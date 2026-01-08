import { GameSettings, Player } from "./types";

/**
 * Calculate final points for a single game based on ranks and adjustments.
 */
export function calculateGamePoints(
  ranks: Record<string, number>,
  adjustments: Record<string, number>,
  settings: GameSettings,
  players: Player[]
): { finalPoints: Record<string, number> } {
  const finalPoints: Record<string, number> = {};

  players.forEach((player) => {
    const rank = ranks[player.id]; // 1, 2, 3, 4
    const adjustment = adjustments[player.id] || 0;
    
    // Get base point from rank (0-indexed array, so rank-1)
    // If rank is invalid (e.g. 0 or undefined), default to 0 points (or handle error)
    const rankPoint = rank >= 1 && rank <= 4 ? settings.rankPoints[rank - 1] : 0;
    
    finalPoints[player.id] = rankPoint + adjustment;
  });

  return { finalPoints };
}

export function calculateTotalPoints(
  games: { finalPoints: Record<string, number> }[],
  playerIds: string[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  
  playerIds.forEach(pid => {
    totals[pid] = 0;
  });

  games.forEach(game => {
    playerIds.forEach(pid => {
      const gamePoint = game.finalPoints[pid] || 0;
      totals[pid] += gamePoint;
    });
  });

  return totals;
}
