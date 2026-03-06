import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { GameResult, GameSettings, Player, Session, DEFAULT_SETTINGS, ChipLog } from "@/lib/types";
import { calculateTotalPoints, calculateTotalChips, calculateGrandTotal } from "@/lib/calculator";
import { nanoid } from "nanoid";
import { useHistory } from "./HistoryContext";
import { trpc } from "@/lib/trpc";

interface GameContextType {
  session: Session | null;
  isLoading: boolean;
  startNewSession: (players: Player[], settings: GameSettings) => Promise<void>;
  addGame: (ranks: Record<string, number>, adjustments?: Record<string, number>) => void;
  updateGame: (gameId: string, ranks: Record<string, number>, adjustments?: Record<string, number>) => void;
  deleteGame: (gameId: string) => void;
  addChipLog: (amounts: Record<string, number>, note?: string) => void;
  deleteChipLog: (logId: string) => void;
  updateSettings: (newSettings: GameSettings) => void;
  resetSession: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { saveSession } = useHistory();
  const utils = trpc.useUtils();

  // アクティブセッションを取得
  const { data: activeSessionData, isLoading } = trpc.session.getActive.useQuery(undefined, {
    refetchOnMount: true,
  });

  // セッション作成
  const createSessionMutation = trpc.session.create.useMutation();

  // セッション終了
  const endSessionMutation = trpc.session.end.useMutation();

  // ゲーム作成
  const createGameMutation = trpc.games.create.useMutation({
    onSuccess: () => {
      utils.session.getActive.invalidate();
    },
  });

  // ゲーム更新
  const updateGameMutation = trpc.games.update.useMutation({
    onSuccess: () => {
      utils.session.getActive.invalidate();
    },
  });

  // ゲーム削除
  const deleteGameMutation = trpc.games.delete.useMutation({
    onSuccess: () => {
      utils.session.getActive.invalidate();
    },
  });

  // チップログ作成
  const createChipMutation = trpc.chips.create.useMutation({
    onSuccess: () => {
      utils.session.getActive.invalidate();
    },
  });

  // チップログ削除
  const deleteChipMutation = trpc.chips.delete.useMutation({
    onSuccess: () => {
      utils.session.getActive.invalidate();
    },
  });

  // サーバーからのデータをローカルセッションに変換
  const session = useMemo(() => {
    if (!activeSessionData) {
      return null;
    }

    const playerIds = activeSessionData.players.map((p: any) => p.id);
    const normalizedChipLogs = activeSessionData.chipLogs.map((c: any) => ({
      ...c,
      note: c.note ?? undefined,
    }));
    const totalGamePoints = calculateTotalPoints(activeSessionData.games, playerIds);
    const totalChips = calculateTotalChips(normalizedChipLogs, playerIds);
    const grandTotal = calculateGrandTotal(totalGamePoints, totalChips, playerIds);

    return {
      id: activeSessionData.id,
      startedAt: activeSessionData.startedAt,
      players: activeSessionData.players.map((p: any) => ({
        ...p,
        color: p.color ?? undefined,
      })),
      settings: { rankPoints: activeSessionData.rankPoints },
      games: activeSessionData.games,
      chipLogs: activeSessionData.chipLogs.map((c: any) => ({
        ...c,
        note: c.note ?? undefined,
      })),
      totalGamePoints,
      totalChips,
      grandTotal,
    };
  }, [activeSessionData]);

  const startNewSession = async (players: Player[], settings: GameSettings = DEFAULT_SETTINGS) => {
    const sessionId = nanoid();
    await createSessionMutation.mutateAsync({
      id: sessionId,
      startedAt: Date.now(),
      rankPoints: settings.rankPoints,
      players,
    });
    // クエリを再取得してセッションを更新
    await utils.session.getActive.invalidate();
  };



  const addGame = (ranks: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints }) => {
      const { finalPoints } = calculateGamePoints(ranks, adjustments, session.settings, session.players);
      
      createGameMutation.mutate({
        id: nanoid(),
        sessionId: session.id,
        timestamp: Date.now(),
        ranks,
        adjustments,
        finalPoints,
      });
    });
  };

  const updateGame = (gameId: string, ranks: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints }) => {
      const { finalPoints } = calculateGamePoints(ranks, adjustments, session.settings, session.players);
      
      updateGameMutation.mutate({
        id: gameId,
        sessionId: session.id,
        ranks,
        adjustments,
        finalPoints,
      });
    });
  };

  const deleteGame = (gameId: string) => {
    if (!session) return;
    deleteGameMutation.mutate({
      id: gameId,
      sessionId: session.id,
    });
  };

  const addChipLog = (amounts: Record<string, number>, note?: string) => {
    if (!session) return;

    createChipMutation.mutate({
      id: nanoid(),
      sessionId: session.id,
      timestamp: Date.now(),
      amounts,
      note,
    });
  };

  const deleteChipLog = (logId: string) => {
    if (!session) return;

    deleteChipMutation.mutate({
      id: logId,
      sessionId: session.id,
    });
  };

  // 設定更新
  const updateSettingsMutation = trpc.session.updateSettings.useMutation({
    onSuccess: () => {
      utils.session.getActive.invalidate();
    },
  });

  const updateSettings = (newSettings: GameSettings) => {
    if (!session) return;
    updateSettingsMutation.mutate({
      sessionId: session.id,
      rankPoints: newSettings.rankPoints,
    });
  };

  const resetSession = async () => {
    if (session) {
      // セッションを終了してhistoryに保存
      await endSessionMutation.mutateAsync({
        sessionId: session.id,
        endedAt: Date.now(),
        finalScores: session.grandTotal,
      });
      
      // 履歴に保存
      await saveSession(session);
    }
    
    await utils.session.getActive.invalidate();
  };

  // localStorageからのマイグレーション（初回のみ）
  // TODO: マイグレーション機能は後で実装

  return (
    <GameContext.Provider value={{ 
      session, 
      isLoading,
      startNewSession, 
      addGame, 
      updateGame, 
      deleteGame, 
      addChipLog,
      deleteChipLog,
      updateSettings, 
      resetSession 
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
