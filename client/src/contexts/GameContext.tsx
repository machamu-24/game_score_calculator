import React, { createContext, useContext, useState, useEffect } from "react";
import { GameResult, GameSettings, Player, Session, DEFAULT_SETTINGS } from "@/lib/types";
import { calculateTotalPoints } from "@/lib/calculator";
import { nanoid } from "nanoid";

interface GameContextType {
  session: Session | null;
  startNewSession: (players: Player[], settings: GameSettings) => void;
  addGame: (rawScores: Record<string, number>, adjustments?: Record<string, number>) => void;
  updateGame: (gameId: string, rawScores: Record<string, number>, adjustments?: Record<string, number>) => void;
  deleteGame: (gameId: string) => void;
  resetSession: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    // Load from local storage if available
    const saved = localStorage.getItem("mahjong_session");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem("mahjong_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("mahjong_session");
    }
  }, [session]);

  const startNewSession = (players: Player[], settings: GameSettings = DEFAULT_SETTINGS) => {
    const newSession: Session = {
      id: nanoid(),
      startedAt: Date.now(),
      players,
      settings,
      games: [],
      totalPoints: {},
    };
    // Initialize totals
    players.forEach(p => newSession.totalPoints[p.id] = 0);
    setSession(newSession);
  };

  const addGame = (rawScores: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    // Calculate points for this game (logic will be handled in component or helper, 
    // but here we assume we receive raw scores and need to calculate final points)
    // Wait, we should probably calculate it here to ensure consistency.
    // Let's import the calculator.
    
    // Dynamic import to avoid circular dependency if any (though not likely here)
    import("@/lib/calculator").then(({ calculateGamePoints, calculateTotalPoints }) => {
      const { finalPoints, ranks } = calculateGamePoints(rawScores, session.settings, session.players);
      
      const newGame: GameResult = {
        id: nanoid(),
        timestamp: Date.now(),
        rawScores,
        finalPoints,
        adjustments,
        ranks
      };

      const updatedGames = [...session.games, newGame];
      const updatedTotals = calculateTotalPoints(updatedGames, session.players.map(p => p.id));

      setSession({
        ...session,
        games: updatedGames,
        totalPoints: updatedTotals
      });
    });
  };

  const updateGame = (gameId: string, rawScores: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints, calculateTotalPoints }) => {
      const { finalPoints, ranks } = calculateGamePoints(rawScores, session.settings, session.players);
      
      const updatedGames = session.games.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            rawScores,
            finalPoints,
            adjustments,
            ranks
          };
        }
        return g;
      });

      const updatedTotals = calculateTotalPoints(updatedGames, session.players.map(p => p.id));

      setSession({
        ...session,
        games: updatedGames,
        totalPoints: updatedTotals
      });
    });
  };

  const deleteGame = (gameId: string) => {
    if (!session) return;
    
    import("@/lib/calculator").then(({ calculateTotalPoints }) => {
      const updatedGames = session.games.filter(g => g.id !== gameId);
      const updatedTotals = calculateTotalPoints(updatedGames, session.players.map(p => p.id));

      setSession({
        ...session,
        games: updatedGames,
        totalPoints: updatedTotals
      });
    });
  };

  const resetSession = () => {
    setSession(null);
  };

  return (
    <GameContext.Provider value={{ session, startNewSession, addGame, updateGame, deleteGame, resetSession }}>
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
