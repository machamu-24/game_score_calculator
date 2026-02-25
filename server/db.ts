import { eq, and, desc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, registeredPlayers, sessions, gameResults, chipLogs, sessionHistories } from "../drizzle/schema";
import type * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ==================== Registered Players ====================

export async function getRegisteredPlayers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(registeredPlayers)
    .where(eq(registeredPlayers.userId, userId))
    .orderBy(desc(registeredPlayers.createdAt));
}

export async function createRegisteredPlayer(data: schema.InsertRegisteredPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(registeredPlayers).values(data);
  return result;
}

export async function updateRegisteredPlayer(id: string, userId: number, name: string, color?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(registeredPlayers)
    .set({ name, color })
    .where(
      and(
        eq(registeredPlayers.id, id),
        eq(registeredPlayers.userId, userId)
      )
    );
}

export async function deleteRegisteredPlayer(id: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(registeredPlayers)
    .where(
      and(
        eq(registeredPlayers.id, id),
        eq(registeredPlayers.userId, userId)
      )
    );
}

// ==================== Sessions ====================

export async function getActiveSession(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        isNull(sessions.endedAt)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function getSessionById(sessionId: string, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, userId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function createSession(data: schema.InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(data);
  return result;
}

export async function updateSession(sessionId: string, userId: number, updates: Partial<schema.Session>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(sessions)
    .set(updates)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, userId)
      )
    );
}

export async function endSession(sessionId: string, userId: number, endedAt: number, finalScores: Record<string, number>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(sessions)
    .set({ endedAt, finalScores })
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, userId)
      )
    );
}

// ==================== Game Results ====================

export async function getGameResults(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(gameResults)
    .where(eq(gameResults.sessionId, sessionId))
    .orderBy(gameResults.timestamp);
}

export async function createGameResult(data: schema.InsertGameResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(gameResults).values(data);
  return result;
}

export async function updateGameResult(gameId: string, sessionId: string, updates: Partial<schema.GameResult>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(gameResults)
    .set(updates)
    .where(
      and(
        eq(gameResults.id, gameId),
        eq(gameResults.sessionId, sessionId)
      )
    );
}

export async function deleteGameResult(gameId: string, sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(gameResults)
    .where(
      and(
        eq(gameResults.id, gameId),
        eq(gameResults.sessionId, sessionId)
      )
    );
}

// ==================== Chip Logs ====================

export async function getChipLogs(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(chipLogs)
    .where(eq(chipLogs.sessionId, sessionId))
    .orderBy(chipLogs.timestamp);
}

export async function createChipLog(data: schema.InsertChipLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chipLogs).values(data);
  return result;
}

export async function deleteChipLog(logId: string, sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(chipLogs)
    .where(
      and(
        eq(chipLogs.id, logId),
        eq(chipLogs.sessionId, sessionId)
      )
    );
}

// ==================== Session Histories ====================

export async function getSessionHistories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sessionHistories)
    .where(eq(sessionHistories.userId, userId))
    .orderBy(desc(sessionHistories.date));
}

export async function getSessionHistoryById(historyId: string, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(sessionHistories)
    .where(
      and(
        eq(sessionHistories.id, historyId),
        eq(sessionHistories.userId, userId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function createSessionHistory(data: schema.InsertSessionHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessionHistories).values(data);
  return result;
}

export async function deleteSessionHistory(historyId: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .delete(sessionHistories)
    .where(
      and(
        eq(sessionHistories.id, historyId),
        eq(sessionHistories.userId, userId)
      )
    );
}

export async function importSessionHistories(histories: schema.InsertSessionHistory[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (histories.length === 0) return;
  return await db.insert(sessionHistories).values(histories);
}
