export interface Player {
  id: string;
  name: string;
  color?: string; // For graph visualization
}

export interface GameSettings {
  // 順位点 (ウマ) - e.g., [20, 10, -10, -20] or [30, 10, -10, -30]
  uma: [number, number, number, number];
  // オカ (優勝者へのボーナス点) - 通常は (返し点 - 持ち点) * 4
  oka: number;
  // 初期持ち点 (e.g., 25000)
  initialScore: number;
  // 返し点 (e.g., 30000)
  returnScore: number;
  // 素点の1000点あたりのポイント (e.g., 1)
  scoreRate: number;
}

export interface GameResult {
  id: string;
  timestamp: number;
  // Raw scores at the end of the game (素点)
  rawScores: Record<string, number>;
  // Calculated points including uma and oka (順位点込みポイント)
  finalPoints: Record<string, number>;
  // Optional manual adjustments (e.g., chips, penalties)
  adjustments: Record<string, number>;
  // Rank of each player in this game
  ranks: Record<string, number>;
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
  uma: [20, 10, -10, -20], // 10-20
  oka: 20, // (30000 - 25000) * 4 / 1000 = 20
  initialScore: 25000,
  returnScore: 30000,
  scoreRate: 1,
};
