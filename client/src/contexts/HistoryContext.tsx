import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, SessionHistoryItem, PlayerStats } from "@/lib/types";

interface HistoryContextType {
  history: SessionHistoryItem[];
  playerStats: PlayerStats[];
  saveSession: (session: Session) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const STORAGE_KEY = "mahjong_app_history";

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        calculateStats(parsed);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const calculateStats = (historyItems: SessionHistoryItem[]) => {
    const statsMap = new Map<string, PlayerStats>();

    historyItems.forEach(session => {
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
        current.averageRank += p.rank; // Will divide later
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

    // Sort by total score descending
    statsArray.sort((a, b) => b.totalScore - a.totalScore);

    setPlayerStats(statsArray);
  };

  const saveSession = (session: Session) => {
    // Calculate ranks for this session
    const playerScores = session.players.map(p => ({
      id: p.id,
      name: p.name,
      totalScore: session.grandTotal[p.id] || 0
    }));

    // Sort by score descending to determine rank
    playerScores.sort((a, b) => b.totalScore - a.totalScore);

    const historyItem: SessionHistoryItem = {
      id: session.id,
      date: Date.now(),
      gameCount: session.games.length,
      players: playerScores.map((p, index) => ({
        id: p.id,
        name: p.name,
        totalScore: p.totalScore,
        rank: index + 1
      })),
      // 詳細データを保存
      games: session.games,
      chipLogs: session.chipLogs
    };

    const newHistory = [historyItem, ...history];
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    calculateStats(newHistory);
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    calculateStats(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    setPlayerStats([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <HistoryContext.Provider value={{ history, playerStats, saveSession, deleteHistoryItem, clearHistory }}>
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
