import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== Registered Players ====================
  players: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getRegisteredPlayers(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().optional(),
        createdAt: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createRegisteredPlayer({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateRegisteredPlayer(input.id, ctx.user.id, input.name, input.color);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteRegisteredPlayer(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ==================== Sessions ====================
  session: router({
    getActive: protectedProcedure.query(async ({ ctx }) => {
      const session = await db.getActiveSession(ctx.user.id);
      if (!session) return null;

      // セッションに紐づくゲーム結果とチップログも取得
      const games = await db.getGameResults(session.id);
      const chipLogs = await db.getChipLogs(session.id);

      return {
        ...session,
        games,
        chipLogs,
      };
    }),

    create: protectedProcedure
      .input(z.object({
        id: z.string(),
        startedAt: z.number(),
        rankPoints: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        players: z.array(z.object({
          id: z.string(),
          name: z.string(),
          color: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSession({
          ...input,
          userId: ctx.user.id,
          endedAt: null,
          finalScores: null,
        });
        return { success: true };
      }),

    end: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        endedAt: z.number(),
        finalScores: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.endSession(input.sessionId, ctx.user.id, input.endedAt, input.finalScores);
        return { success: true };
      }),

    updateSettings: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        rankPoints: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.sessionId, ctx.user.id);
        if (!session) throw new Error('Session not found');
        await db.updateSession(input.sessionId, ctx.user.id, {
          rankPoints: input.rankPoints,
        });
        return { success: true };
      }),
  }),

  // ==================== Game Results ====================
  games: router({
    create: protectedProcedure
      .input(z.object({
        id: z.string(),
        sessionId: z.string(),
        timestamp: z.number(),
        ranks: z.any(),
        adjustments: z.any(),
        finalPoints: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        // セッションの所有権を確認
        const session = await db.getSessionById(input.sessionId, ctx.user.id);
        if (!session) {
          throw new Error("Session not found");
        }
        await db.createGameResult(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        sessionId: z.string(),
        ranks: z.any(),
        adjustments: z.any(),
        finalPoints: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        // セッションの所有権を確認
        const session = await db.getSessionById(input.sessionId, ctx.user.id);
        if (!session) {
          throw new Error("Session not found");
        }
        await db.updateGameResult(input.id, input.sessionId, {
          ranks: input.ranks,
          adjustments: input.adjustments,
          finalPoints: input.finalPoints,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.string(),
        sessionId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // セッションの所有権を確認
        const session = await db.getSessionById(input.sessionId, ctx.user.id);
        if (!session) {
          throw new Error("Session not found");
        }
        await db.deleteGameResult(input.id, input.sessionId);
        return { success: true };
      }),
  }),

  // ==================== Chip Logs ====================
  chips: router({
    create: protectedProcedure
      .input(z.object({
        id: z.string(),
        sessionId: z.string(),
        timestamp: z.number(),
        amounts: z.any(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // セッションの所有権を確認
        const session = await db.getSessionById(input.sessionId, ctx.user.id);
        if (!session) {
          throw new Error("Session not found");
        }
        await db.createChipLog(input);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.string(),
        sessionId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // セッションの所有権を確認
        const session = await db.getSessionById(input.sessionId, ctx.user.id);
        if (!session) {
          throw new Error("Session not found");
        }
        await db.deleteChipLog(input.id, input.sessionId);
        return { success: true };
      }),
  }),

  // ==================== Session Histories ====================
  history: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSessionHistories(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const history = await db.getSessionHistoryById(input.id, ctx.user.id);
        if (!history) return null;

        // 詳細データを取得（ゲーム結果とチップログ）
        const games = await db.getGameResults(history.sessionId);
        const chipLogs = await db.getChipLogs(history.sessionId);

        return {
          ...history,
          games,
          chipLogs,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        id: z.string(),
        sessionId: z.string(),
        date: z.number(),
        gameCount: z.number(),
        players: z.array(z.object({
          id: z.string().optional(),
          name: z.string(),
          totalScore: z.number(),
          rank: z.number(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSessionHistory({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSessionHistory(input.id, ctx.user.id);
        return { success: true };
      }),

    import: protectedProcedure
      .input(z.object({
        histories: z.array(z.object({
          id: z.string(),
          sessionId: z.string(),
          date: z.number(),
          gameCount: z.number(),
          players: z.array(z.object({
            id: z.string().optional(),
            name: z.string(),
            totalScore: z.number(),
            rank: z.number(),
          })),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        // ユーザーIDを付与してインポート
        const historiesWithUserId = input.histories.map(h => ({
          ...h,
          userId: ctx.user.id,
        }));
        await db.importSessionHistories(historiesWithUserId);
        return { success: true, count: historiesWithUserId.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
