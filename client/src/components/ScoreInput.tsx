import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from "@/contexts/GameContext";

interface ScoreInputProps {
  isOpen: boolean;
  onClose: () => void;
  gameId?: string;
  initialRanks?: Record<string, number>;
  initialAdjustments?: Record<string, number>;
}

export function ScoreInput({ isOpen, onClose, gameId, initialRanks }: ScoreInputProps) {
  const { session, addGame, updateGame } = useGame();
  const [ranks, setRanks] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      const initRanks: Record<string, string> = {};
      
      session.players.forEach(p => {
        initRanks[p.id] = initialRanks ? String(initialRanks[p.id] || "") : "";
      });
      
      setRanks(initRanks);
      setError(null);
    }
  }, [isOpen, session, initialRanks]);

  const handleRankChange = (pid: string, value: string) => {
    setRanks(prev => ({ ...prev, [pid]: value }));
  };

  const validateAndSubmit = () => {
    if (!session) return;

    const parsedRanks: Record<string, number> = {};
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
    });

    if (hasError) {
      setError("すべてのプレイヤーの順位を選択してください。");
      return;
    }

    // Validate unique ranks
    if (rankCounts.size !== 4) {
      setError("各順位（1位〜4位）は必ず1人のプレイヤーに割り当ててください。");
      return;
    }

    if (gameId) {
      updateGame(gameId, parsedRanks, {});
    } else {
      addGame(parsedRanks, {});
    }
    onClose();
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {gameId ? "ゲーム結果の編集" : "ゲーム結果の入力"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground text-center mb-2">
            <div className="col-span-6 text-left pl-2">プレイヤー</div>
            <div className="col-span-6">順位</div>
          </div>

          {session.players.map((player) => (
            <div key={player.id} className="grid grid-cols-12 items-center gap-4">
              <Label htmlFor={`rank-${player.id}`} className="col-span-6 font-medium truncate pl-2 text-base">
                {player.name}
              </Label>
              
              <div className="col-span-6">
                <Select 
                  value={ranks[player.id]} 
                  onValueChange={(val) => handleRankChange(player.id, val)}
                >
                  <SelectTrigger className="glass-input border-0 text-center">
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1位</SelectItem>
                    <SelectItem value="2">2位</SelectItem>
                    <SelectItem value="3">3位</SelectItem>
                    <SelectItem value="4">4位</SelectItem>
                  </SelectContent>
                </Select>
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
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
