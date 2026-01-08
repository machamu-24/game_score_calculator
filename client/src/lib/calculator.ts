import { GameSettings, Player } from "./types";

/**
 * Calculate final points for a single game based on raw scores and settings.
 * Assumes 4 players.
 */
export function calculateGamePoints(
  rawScores: Record<string, number>,
  settings: GameSettings,
  players: Player[]
): { finalPoints: Record<string, number>; ranks: Record<string, number> } {
  const playerIds = players.map((p) => p.id);
  
  // 1. Sort players by raw score (descending)
  // Handle tie-breaks: currently random or based on ID order (could be improved to seat order)
  const sortedPlayers = [...playerIds].sort((a, b) => {
    const scoreA = rawScores[a] || 0;
    const scoreB = rawScores[b] || 0;
    return scoreB - scoreA;
  });

  const ranks: Record<string, number> = {};
  const finalPoints: Record<string, number> = {};

  // 2. Calculate points
  // Formula: (RawScore - ReturnScore) / 1000 + Uma + (Oka if 1st)
  
  // Total score check (should be InitialScore * 4)
  // But in calculation, we use ReturnScore as baseline.
  
  sortedPlayers.forEach((pid, index) => {
    ranks[pid] = index + 1; // 1-based rank
    
    const rawScore = rawScores[pid] || 0;
    
    // Basic point calculation: (Score - ReturnScore) / 1000
    // Rounding: usually round to nearest integer or 1 decimal place. 
    // Mahjong standard: usually round half up or down depending on rules.
    // Here we use simple float calculation first.
    let point = (rawScore - settings.returnScore) / 1000;
    
    // Add Uma
    point += settings.uma[index];
    
    // Add Oka to 1st place
    if (index === 0) {
      point += settings.oka;
    }
    
    finalPoints[pid] = parseFloat(point.toFixed(1));
  });

  // 3. Adjust for floating point errors or total sum consistency if needed
  // In standard Mahjong, the sum of points should be 0.
  // Let's verify and adjust the top player's score if there's a mismatch due to rounding?
  // For now, we assume simple calculation.
  
  return { finalPoints, ranks };
}

export function calculateTotalPoints(
  games: { finalPoints: Record<string, number>; adjustments?: Record<string, number> }[],
  playerIds: string[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  
  playerIds.forEach(pid => {
    totals[pid] = 0;
  });

  games.forEach(game => {
    playerIds.forEach(pid => {
      const gamePoint = game.finalPoints[pid] || 0;
      const adjustment = game.adjustments?.[pid] || 0;
      totals[pid] += gamePoint + adjustment;
    });
  });

  // Round to 1 decimal
  playerIds.forEach(pid => {
    totals[pid] = parseFloat(totals[pid].toFixed(1));
  });

  return totals;
}
