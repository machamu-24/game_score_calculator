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

// 新規追加: 履歴保存用の型定義
export interface SessionHistoryItem {
  id: string;
  date: number;
  players: {
    name: string;
    totalScore: number;
    rank: number; // セッション内での順位
  }[];
  gameCount: number; // このセッションで行われたゲーム数
}

// 新規追加: プレイヤー通算成績用の型定義
export interface PlayerStats {
  name: string;
  totalSessions: number; // 参加セッション数
  totalGames: number;    // 総ゲーム数（セッション内のゲーム数の合計）
  totalScore: number;    // 通算スコア
  averageScore: number;  // 平均スコア
  topCount: number;      // セッショントップ回数
  topRate: number;       // セッショントップ率
  averageRank: number;   // 平均順位（セッション単位）
  lastPlayed: number;    // 最終プレイ日
}
