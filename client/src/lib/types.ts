export interface Player {
  id: string;
  name: string;
  color?: string;
}

export interface GameSettings {
  // Points awarded for each rank (1st, 2nd, 3rd, 4th)
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

export interface ChipLog {
  id: string;
  timestamp: number;
  // Chip changes for each player
  amounts: Record<string, number>;
  note?: string;
}

export interface Session {
  id: string;
  startedAt: number;
  players: Player[];
  settings: GameSettings;
  games: GameResult[];
  chipLogs: ChipLog[];
  // Current total points from games (excluding chips)
  totalGamePoints: Record<string, number>;
  // Current total chips
  totalChips: Record<string, number>;
  // Grand total (Game Points + Chips)
  grandTotal: Record<string, number>;
}

export const DEFAULT_SETTINGS: GameSettings = {
  rankPoints: [50, 10, -10, -30],
};
