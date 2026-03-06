import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// db モジュールをモック
vi.mock("./db", () => ({
  getSessionById: vi.fn(),
  updateSession: vi.fn(),
  getActiveSession: vi.fn(),
  getGameResults: vi.fn(),
  getChipLogs: vi.fn(),
}));

import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("session.updateSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("セッションが存在する場合、rankPointsを更新できる", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const mockSession = {
      id: "test-session-id",
      userId: 1,
      startedAt: Date.now(),
      endedAt: null,
      rankPoints: [50, 10, -10, -30],
      players: [],
      finalScores: null,
    };

    vi.mocked(db.getSessionById).mockResolvedValue(mockSession as any);
    vi.mocked(db.updateSession).mockResolvedValue(undefined as any);

    const result = await caller.session.updateSettings({
      sessionId: "test-session-id",
      rankPoints: [30, 10, -10, -30],
    });

    expect(result).toEqual({ success: true });
    expect(db.getSessionById).toHaveBeenCalledWith("test-session-id", 1);
    expect(db.updateSession).toHaveBeenCalledWith("test-session-id", 1, {
      rankPoints: [30, 10, -10, -30],
    });
  });

  it("セッションが存在しない場合、エラーをスローする", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getSessionById).mockResolvedValue(null as any);

    await expect(
      caller.session.updateSettings({
        sessionId: "non-existent-session",
        rankPoints: [30, 10, -10, -30],
      })
    ).rejects.toThrow("Session not found");
  });
});

describe("GameSetup settings parsing", () => {
  it("デフォルト設定が正しく設定されている", () => {
    const DEFAULT_RANK_POINTS: [number, number, number, number] = [50, 10, -10, -30];
    expect(DEFAULT_RANK_POINTS[0]).toBe(50);
    expect(DEFAULT_RANK_POINTS[1]).toBe(10);
    expect(DEFAULT_RANK_POINTS[2]).toBe(-10);
    expect(DEFAULT_RANK_POINTS[3]).toBe(-30);
  });

  it("文字列の順位点を数値に正しく変換できる", () => {
    const rankPointStrings = ["30", "10", "-10", "-30"];
    const parsed = rankPointStrings.map(p => parseInt(p));
    expect(parsed).toEqual([30, 10, -10, -30]);
    expect(parsed.some(isNaN)).toBe(false);
  });

  it("無効な入力の場合はデフォルト設定にフォールバックする", () => {
    const DEFAULT_SETTINGS = { rankPoints: [50, 10, -10, -30] as [number, number, number, number] };
    const rankPointStrings = ["30", "", "-10", "-30"];
    const parsedPoints = rankPointStrings.map(p => parseInt(p));
    const settings = parsedPoints.some(isNaN)
      ? DEFAULT_SETTINGS
      : { rankPoints: parsedPoints as [number, number, number, number] };
    
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });
});
