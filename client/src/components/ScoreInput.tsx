import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from "@/contexts/GameContext";
import { Player } from "@/lib/types";

interface ScoreInputProps {
  isOpen: boolean;
  onClose: () => void;
  gameId?: string;
  initialRanks?: Record<string, number>;
  initialAdjustments?: Record<string, number>;
}

export function ScoreInput({ isOpen, onClose, gameId, initialRanks, initialAdjustments }: ScoreInputProps) {
  const { session, addGame, updateGame } = useGame();
  const [ranks, setRanks] = useState<Record<string, string>>({});
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      const initRanks: Record<string, string> = {};
      const initAdj: Record<string, string> = {};
      
      session.players.forEach(p => {
        initRanks[p.id] = initialRanks ? String(initialRanks[p.id] || "") : "";
        initAdj[p.id] = initialAdjustments ? String(initialAdjustments[p.id] || "") : "";
      });
      
      setRanks(initRanks);
      setAdjustments(initAdj);
      setError(null);
    }
  }, [isOpen, session, initialRanks, initialAdjustments]);

  const handleRankChange = (pid: string, value: string) => {
    setRanks(prev => ({ ...prev, [pid]: value }));
  };

  const handleAdjustmentChange = (pid: string, value: string) => {
    setAdjustments(prev => ({ ...prev, [pid]: value }));
  };

  const validateAndSubmit = () => {
    if (!session) return;

    const parsedRanks: Record<string, number> = {};
    const parsedAdjustments: Record<string, number> = {};
    const rankCounts = new Set<number>();
    let hasError = false;

    session.players.forEach(p => {
      // Parse Rank
      const r = parseInt(ranks[p.id]);
      if (isNaN(r) || r < 1 || r > 4) {
        hasError = true;
      } else {
        parsedRanks[p.id] = r;
        rankCounts.add(r);
      }

      // Parse Adjustment (optional, default 0)
      const adjStr = adjustments[p.id];
      const adj = adjStr === "" ? 0 : parseInt(adjStr);
      if (isNaN(adj)) {
        // Allow empty, but if typed and NaN, it's error? 
        // Let's assume empty is 0. If user typed "abc", it's NaN.
        if (adjStr !== "" && adjStr !== "-") hasError = true; // Simple check
      }
      parsedAdjustments[p.id] = isNaN(adj) ? 0 : adj;
    });

    if (hasError) {
      setError("Please ensure all ranks are selected and adjustments are valid numbers.");
      return;
    }

    // Validate unique ranks
    if (rankCounts.size !== 4) {
      setError("Each rank (1st, 2nd, 3rd, 4th) must be assigned to exactly one player.");
      return;
    }

    if (gameId) {
      updateGame(gameId, parsedRanks, parsedAdjustments);
    } else {
      addGame(parsedRanks, parsedAdjustments);
    }
    onClose();
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {gameId ? "Edit Game Result" : "Enter Game Result"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground text-center mb-2">
            <div className="col-span-4 text-left pl-2">Player</div>
            <div className="col-span-4">Rank</div>
            <div className="col-span-4">Adjustment</div>
          </div>

          {session.players.map((player) => (
            <div key={player.id} className="grid grid-cols-12 items-center gap-4">
              <Label htmlFor={`rank-${player.id}`} className="col-span-4 font-medium truncate pl-2 text-base">
                {player.name}
              </Label>
              
              <div className="col-span-4">
                <Select 
                  value={ranks[player.id]} 
                  onValueChange={(val) => handleRankChange(player.id, val)}
                >
                  <SelectTrigger className="glass-input border-0 text-center">
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st</SelectItem>
                    <SelectItem value="2">2nd</SelectItem>
                    <SelectItem value="3">3rd</SelectItem>
                    <SelectItem value="4">4th</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Input
                  type="number"
                  value={adjustments[player.id]}
                  onChange={(e) => handleAdjustmentChange(player.id, e.target.value)}
                  className="glass-input border-0 text-center font-mono"
                  placeholder="+/-"
                />
              </div>
            </div>
          ))}
          
          {error && (
            <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={validateAndSubmit} 
            className="w-full sm:w-auto min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
