import React, { createContext, useContext, useState, useEffect } from "react";
import { GameResult, GameSettings, Player, Session, DEFAULT_SETTINGS } from "@/lib/types";
import { calculateTotalPoints } from "@/lib/calculator";
import { nanoid } from "nanoid";

interface GameContextType {
  session: Session | null;
  startNewSession: (players: Player[], settings: GameSettings) => void;
  addGame: (ranks: Record<string, number>, adjustments?: Record<string, number>) => void;
  updateGame: (gameId: string, ranks: Record<string, number>, adjustments?: Record<string, number>) => void;
  deleteGame: (gameId: string) => void;
  updateSettings: (newSettings: GameSettings) => void;
  resetSession: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem("mahjong_session_v2");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem("mahjong_session_v2", JSON.stringify(session));
    } else {
      localStorage.removeItem("mahjong_session_v2");
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
    players.forEach(p => newSession.totalPoints[p.id] = 0);
    setSession(newSession);
  };

  const addGame = (ranks: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints, calculateTotalPoints }) => {
      const { finalPoints } = calculateGamePoints(ranks, adjustments, session.settings, session.players);
      
      const newGame: GameResult = {
        id: nanoid(),
        timestamp: Date.now(),
        ranks,
        adjustments,
        finalPoints
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

  const updateGame = (gameId: string, ranks: Record<string, number>, adjustments: Record<string, number> = {}) => {
    if (!session) return;

    import("@/lib/calculator").then(({ calculateGamePoints, calculateTotalPoints }) => {
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

  const updateSettings = (newSettings: GameSettings) => {
    if (!session) return;

    // Recalculate all games with new settings
    import("@/lib/calculator").then(({ calculateGamePoints, calculateTotalPoints }) => {
      const updatedGames = session.games.map(game => {
        const { finalPoints } = calculateGamePoints(game.ranks, game.adjustments, newSettings, session.players);
        return {
          ...game,
          finalPoints
        };
      });

      const updatedTotals = calculateTotalPoints(updatedGames, session.players.map(p => p.id));

      setSession({
        ...session,
        settings: newSettings,
        games: updatedGames,
        totalPoints: updatedTotals
      });
    });
  };

  const resetSession = () => {
    setSession(null);
  };

  return (
    <GameContext.Provider value={{ session, startNewSession, addGame, updateGame, deleteGame, updateSettings, resetSession }}>
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
