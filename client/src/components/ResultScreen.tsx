import { useGame } from "@/contexts/GameContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Medal, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResultScreen({ isOpen, onClose }: ResultScreenProps) {
  const { session } = useGame();

  if (!session) return null;

  // Calculate stats
  const stats = session.players.map(p => {
    const totalScore = session.grandTotal[p.id];
    const gamePoints = session.totalGamePoints[p.id];
    const chips = session.totalChips[p.id];
    
    // Calculate ranks count
    const ranks = session.games.map(g => g.ranks[p.id]);
    const firstCount = ranks.filter(r => r === 1).length;
    const secondCount = ranks.filter(r => r === 2).length;
    const thirdCount = ranks.filter(r => r === 3).length;
    const fourthCount = ranks.filter(r => r === 4).length;
    
    const gameCount = session.games.length;
    const avgRank = gameCount > 0 
      ? (ranks.reduce((a, b) => a + b, 0) / gameCount).toFixed(2) 
      : "-";

    return {
      ...p,
      totalScore,
      gamePoints,
      chips,
      firstCount,
      secondCount,
      thirdCount,
      fourthCount,
      avgRank
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const winner = stats[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Session Results
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Winner Section */}
          <div className="text-center space-y-2 bg-gradient-to-b from-yellow-500/20 to-transparent p-6 rounded-2xl border border-yellow-500/30">
            <div className="text-sm text-yellow-500 font-bold uppercase tracking-widest">Winner</div>
            <div className="text-4xl font-bold text-foreground">{winner.name}</div>
            <div className="text-5xl font-mono font-bold text-yellow-500">
              {winner.totalScore > 0 ? "+" : ""}{winner.totalScore}
            </div>
          </div>

          {/* Ranking Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Medal className="w-5 h-5" />
              Final Standings
            </h3>
            <div className="grid gap-3">
              {stats.map((player, index) => (
                <div 
                  key={player.id} 
                  className="grid grid-cols-12 items-center p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="col-span-1 font-bold text-lg text-muted-foreground">#{index + 1}</div>
                  <div className="col-span-4 font-bold text-lg truncate">{player.name}</div>
                  <div className="col-span-3 text-right">
                    <div className="text-2xl font-mono font-bold">
                      {player.totalScore > 0 ? "+" : ""}{player.totalScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="col-span-2 text-right px-2 border-r border-white/10">
                    <div className="font-mono text-sm">{player.gamePoints > 0 ? "+" : ""}{player.gamePoints}</div>
                    <div className="text-[10px] text-muted-foreground">Score</div>
                  </div>
                  <div className="col-span-2 text-right pl-2">
                    <div className="font-mono text-sm">{player.chips > 0 ? "+" : ""}{player.chips}</div>
                    <div className="text-[10px] text-muted-foreground">Chips</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Detailed Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(player => (
                <div key={player.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="font-bold text-center truncate border-b border-white/10 pb-2">
                    {player.name}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Rank</span>
                      <span className="font-mono font-bold">{player.avgRank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-500">1st</span>
                      <span className="font-mono">{player.firstCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">2nd</span>
                      <span className="font-mono">{player.secondCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">3rd</span>
                      <span className="font-mono">{player.thirdCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">4th</span>
                      <span className="font-mono">{player.fourthCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <Button onClick={onClose} variant="outline" className="min-w-[120px]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
