import React, { createContext, useContext, useState, useEffect } from "react";
import { GameResult, GameSettings, Player, Session, DEFAULT_SETTINGS, ChipLog } from "@/lib/types";
import { calculateTotalPoints, calculateTotalChips, calculateGrandTotal } from "@/lib/calculator";
import { nanoid } from "nanoid";
import { useHistory } from "./HistoryContext";

interface GameContextType {
  session: Session | null;
  startNewSession: (players: Player[], settings: GameSettings) => void;
  addGame: (ranks: Record<string, number>, adjustments?: Record<string, number>) => void;
  updateGame: (gameId: string, ranks: Record<string, number>, adjustments?: Record<string, number>) => void;
  deleteGame: (gameId: string) => void;
  addChipLog: (amounts: Record<string, number>, note?: string) => void;
  deleteChipLog: (logId: string) => void;
  updateSettings: (newSettings: GameSettings) => void;
  resetSession: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem("mahjong_session_v3");
    return saved ? JSON.parse(saved) : null;
  });
  
  const { saveSession } = useHistory();

  useEffect(() => {
    if (session) {
      localStorage.setItem("mahjong_session_v3", JSON.stringify(session));
    } else {
      localStorage.removeItem("mahjong_session_v3");
    }
  }, [session]);

  const startNewSession = (players: Player[], settings: GameSettings = DEFAULT_SETTINGS) => {
    const newSession: Session = {
      id: nanoid(),
      startedAt: Date.now(),
      players,
      settings,
      games: [],
      chipLogs: [],
      totalGamePoints: {},
      totalChips: {},
      grandTotal: {},
    };
    players.forEach(p => {
      newSession.totalGamePoints[p.id] = 0;
      newSession.totalChips[p.id] = 0;
      newSession.grandTotal[p.id] = 0;
    });
    setSession(newSession);
  };

  const updateSessionTotals = (currentSession: Session) => {
    const playerIds = currentSession.players.map(p => p.id);
    const totalGamePoints = calculateTotalPoints(currentSession.games, playerIds);
    const totalChips = calculateTotalChips(currentSession.chipLogs, playerIds);
    const grandTotal = calculateGrandTotal(totalGamePoints, totalChips, playerIds);

    return {
      ...currentSession,
      totalGamePoints,
      totalChips,
      grandTotal
    };
  };

  const addGame = (ranks: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints }) => {
      const { finalPoints } = calculateGamePoints(ranks, adjustments, session.settings, session.players);
      
      const newGame: GameResult = {
        id: nanoid(),
        timestamp: Date.now(),
        ranks,
        adjustments,
        finalPoints
      };

      const updatedSession = {
        ...session,
        games: [...session.games, newGame]
      };

      setSession(updateSessionTotals(updatedSession));
    });
  };

  const updateGame = (gameId: string, ranks: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints }) => {
      const { finalPoints } = calculateGamePoints(ranks, adjustments, session.settings, session.players);
      
      const updatedGames = session.games.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            ranks,
            adjustments,
            finalPoints
          };
        }
        return g;
      });

      const updatedSession = {
        ...session,
        games: updatedGames
      };

      setSession(updateSessionTotals(updatedSession));
    });
  };

  const deleteGame = (gameId: string) => {
    if (!session) return;
    
    const updatedGames = session.games.filter(g => g.id !== gameId);
    const updatedSession = {
      ...session,
      games: updatedGames
    };

    setSession(updateSessionTotals(updatedSession));
  };

  const addChipLog = (amounts: Record<string, number>, note?: string) => {
    if (!session) return;

    const newLog: ChipLog = {
      id: nanoid(),
      timestamp: Date.now(),
      amounts,
      note
    };

    const updatedSession = {
      ...session,
      chipLogs: [...session.chipLogs, newLog]
    };

    setSession(updateSessionTotals(updatedSession));
  };

  const deleteChipLog = (logId: string) => {
    if (!session) return;

    const updatedLogs = session.chipLogs.filter(l => l.id !== logId);
    const updatedSession = {
      ...session,
      chipLogs: updatedLogs
    };

    setSession(updateSessionTotals(updatedSession));
  };

  const updateSettings = (newSettings: GameSettings) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints }) => {
      const updatedGames = session.games.map(game => {
        const { finalPoints } = calculateGamePoints(game.ranks, game.adjustments, newSettings, session.players);
        return {
          ...game,
          finalPoints
        };
      });

      const updatedSession = {
        ...session,
        settings: newSettings,
        games: updatedGames
      };

      setSession(updateSessionTotals(updatedSession));
    });
  };

  const resetSession = () => {
    if (session) {
      saveSession(session); // Save to history before resetting
    }
    setSession(null);
  };

  return (
    <GameContext.Provider value={{ 
      session, 
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
