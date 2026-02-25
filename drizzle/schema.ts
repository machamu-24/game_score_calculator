import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * 登録済みプレイヤーテーブル
 * ユーザーが事前に登録したプレイヤー情報
 */
export const registeredPlayers = mysqlTable("registered_players", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
}, (table) => ({
  userIdIdx: index("registered_players_userId_idx").on(table.userId),
}));

/**
 * セッションテーブル
 * 1つのゲームセッション（複数のゲームをまとめた単位）
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("userId").notNull(),
  startedAt: bigint("startedAt", { mode: "number" }).notNull(),
  endedAt: bigint("endedAt", { mode: "number" }),
  // ゲーム設定（順位点など）
  rankPoints: json("rankPoints").$type<[number, number, number, number]>().notNull(),
  // プレイヤー情報（セッション開始時のスナップショット）
  players: json("players").$type<Array<{ id: string; name: string; color?: string }>>().notNull(),
  // 最終スコア（計算結果のキャッシュ）
  finalScores: json("finalScores").$type<Record<string, number>>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index("sessions_userId_idx").on(table.userId),
  startedAtIdx: index("sessions_startedAt_idx").on(table.startedAt),
}));

/**
 * ゲーム結果テーブル
 * セッション内の個別のゲーム結果
 */
export const gameResults = mysqlTable("game_results", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  // 各プレイヤーの順位 (1-4)
  ranks: json("ranks").$type<Record<string, number>>().notNull(),
  // 手動調整ポイント（チップ以外の追加点など）
  adjustments: json("adjustments").$type<Record<string, number>>().notNull(),
  // 計算後の最終ポイント
  finalPoints: json("finalPoints").$type<Record<string, number>>().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  sessionIdIdx: index("game_results_sessionId_idx").on(table.sessionId),
  timestampIdx: index("game_results_timestamp_idx").on(table.timestamp),
}));

/**
 * チップログテーブル
 * セッション内のチップの増減記録
 */
export const chipLogs = mysqlTable("chip_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  // 各プレイヤーのチップ増減
  amounts: json("amounts").$type<Record<string, number>>().notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  sessionIdIdx: index("chip_logs_sessionId_idx").on(table.sessionId),
  timestampIdx: index("chip_logs_timestamp_idx").on(table.timestamp),
}));

/**
 * セッション履歴テーブル
 * 完了したセッションの要約情報（統計表示用）
 */
export const sessionHistories = mysqlTable("session_histories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  date: bigint("date", { mode: "number" }).notNull(),
  gameCount: int("gameCount").notNull(),
  // プレイヤーごとの最終結果
  players: json("players").$type<Array<{
    id?: string;
    name: string;
    totalScore: number;
    rank: number;
  }>>().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("session_histories_userId_idx").on(table.userId),
  sessionIdIdx: index("session_histories_sessionId_idx").on(table.sessionId),
  dateIdx: index("session_histories_date_idx").on(table.date),
}));

export type RegisteredPlayer = typeof registeredPlayers.$inferSelect;
export type InsertRegisteredPlayer = typeof registeredPlayers.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type GameResult = typeof gameResults.$inferSelect;
export type InsertGameResult = typeof gameResults.$inferInsert;

export type ChipLog = typeof chipLogs.$inferSelect;
export type InsertChipLog = typeof chipLogs.$inferInsert;

export type SessionHistory = typeof sessionHistories.$inferSelect;
export type InsertSessionHistory = typeof sessionHistories.$inferInsert;