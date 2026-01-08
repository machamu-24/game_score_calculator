export interface Player {
  id: string;
  name: string;
  color?: string;
}

export interface GameSettings {
  // Points awarded for each rank (1st, 2nd, 3rd, 4th)
  // e.g., [50, 10, -10, -30]
  rankPoints: [number, number, number, number];
}

export interface GameResult {
  id: string;
  timestamp: number;
  // Rank of each player (1-based: 1, 2, 3, 4)
  ranks: Record<string, number>;
  // Manual adjustments/bonus points (e.g., +5, -3)
  adjustments: Record<string, number>;
  // Final calculated points for this game
  finalPoints: Record<string, number>;
}

export interface Session {
  id: string;
  startedAt: number;
  players: Player[];
  settings: GameSettings;
  games: GameResult[];
  // Current total points for each player
  totalPoints: Record<string, number>;
}

export const DEFAULT_SETTINGS: GameSettings = {
  // Default rank points: 1st=+50, 2nd=+10, 3rd=-10, 4th=-30
  rankPoints: [50, 10, -10, -30],
};
