import React, { createContext, useContext, useMemo, useRef } from "react";
import { Session, SessionHistoryItem, PlayerStats } from "@/lib/types";
import { trpc } from "@/lib/trpc";
import { nanoid } from "nanoid";

interface HistoryContextType {
  history: SessionHistoryItem[];
  playerStats: PlayerStats[];
  isLoading: boolean;
  saveSession: (session: Session) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  importHistory: (jsonData: string) => Promise<boolean>;
  exportHistory: () => string;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils();

  // 履歴リストを取得
  const { data: history = [], isLoading } = trpc.history.list.useQuery();

  // 履歴作成
  const createHistoryMutation = trpc.history.create.useMutation({
    onSuccess: () => {
      utils.history.list.invalidate();
    },
  });

  // 履歴削除
  const deleteHistoryMutation = trpc.history.delete.useMutation({
    onSuccess: () => {
      utils.history.list.invalidate();
    },
  });

  // 履歴インポート
  const importHistoryMutation = trpc.history.import.useMutation({
    onSuccess: () => {
      utils.history.list.invalidate();
    },
  });



  // 履歴から統計を計算
  const playerStats = useMemo(() => {
    if (history.length === 0) {
      return [];
    }

    const statsMap = new Map<string, PlayerStats>();

    history.forEach(session => {
      session.players.forEach(p => {
        const current = statsMap.get(p.name) || {
          name: p.name,
          totalSessions: 0,
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          topCount: 0,
          topRate: 0,
          averageRank: 0,
          lastPlayed: 0
        };

        current.totalSessions += 1;
        current.totalGames += session.gameCount;
        current.totalScore += p.totalScore;
        if (p.rank === 1) current.topCount += 1;
        current.averageRank += p.rank;
        current.lastPlayed = Math.max(current.lastPlayed, session.date);

        statsMap.set(p.name, current);
      });
    });

    const statsArray = Array.from(statsMap.values()).map(stat => ({
      ...stat,
      averageScore: parseFloat((stat.totalScore / stat.totalSessions).toFixed(1)),
      topRate: parseFloat(((stat.topCount / stat.totalSessions) * 100).toFixed(1)),
      averageRank: parseFloat((stat.averageRank / stat.totalSessions).toFixed(2))
    }));

    statsArray.sort((a, b) => b.totalScore - a.totalScore);

    return statsArray;
  }, [history]);

  const saveSession = async (session: Session) => {
    const playerScores = session.players.map(p => ({
      id: p.id,
      name: p.name,
      totalScore: session.grandTotal[p.id] || 0
    }));

    playerScores.sort((a, b) => b.totalScore - a.totalScore);

    const historyItem = {
      id: session.id,
      sessionId: session.id,
      date: Date.now(),
      gameCount: session.games.length,
      players: playerScores.map((p, index) => ({
        id: p.id,
        name: p.name,
        totalScore: p.totalScore,
        rank: index + 1
      })),
    };

    await createHistoryMutation.mutateAsync(historyItem);
  };

  const deleteHistoryItem = async (id: string) => {
    await deleteHistoryMutation.mutateAsync({ id });
  };

  const clearHistory = async () => {
    // すべての履歴を削除
    for (const item of history) {
      await deleteHistoryMutation.mutateAsync({ id: item.id });
    }
  };

  const exportHistory = () => {
    return JSON.stringify(history);
  };

  const importHistory = async (jsonData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) {
        return false;
      }

      // 既存の履歴IDをチェック
      const existingIds = new Set(history.map(h => h.id));
      const newItems = parsed.filter((item: any) => !existingIds.has(item.id));

      if (newItems.length === 0) {
        return true;
      }

      // sessionIdがない場合はidを使用
      const itemsWithSessionId = newItems.map((item: any) => ({
        ...item,
        sessionId: item.sessionId || item.id,
      }));

      await importHistoryMutation.mutateAsync({
        histories: itemsWithSessionId,
      });

      return true;
    } catch (e) {
      console.error("Failed to import history", e);
      return false;
    }
  };

  // localStorageからのマイグレーション（初回のみ）
  // TODO: マイグレーション機能は後で実装

  return (
    <HistoryContext.Provider value={{ 
      history, 
      playerStats, 
      isLoading,
      saveSession, 
      deleteHistoryItem, 
      clearHistory, 
      importHistory, 
      exportHistory 
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
