import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { useGame } from "@/contexts/GameContext";
import { haptics } from "@/lib/haptics";

interface ScoreInputProps {
  isOpen: boolean;
  onClose: () => void;
  gameId?: string;
  initialRanks?: Record<string, number>;
  initialAdjustments?: Record<string, number>;
}

export function ScoreInput({ isOpen, onClose, gameId, initialRanks }: ScoreInputProps) {
  const { session, addGame, updateGame } = useGame();
  const [ranks, setRanks] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      const initRanks: Record<string, number | null> = {};
      
      session.players.forEach(p => {
        initRanks[p.id] = initialRanks ? (initialRanks[p.id] || null) : null;
      });
      
      setRanks(initRanks);
      setError(null);
    }
  }, [isOpen, session, initialRanks]);

  const handleRankChange = (pid: string, value: string) => {
    if (localStorage.getItem('haptics-enabled') !== 'false') haptics.light();
    const numValue = value ? parseInt(value, 10) : null;
    setRanks(prev => ({ ...prev, [pid]: numValue }));
  };

  const validateAndSubmit = () => {
    if (!session) return;

    const parsedRanks: Record<string, number> = {};
    const rankCounts = new Set<number>();
    let hasError = false;

    session.players.forEach(p => {
      const r = ranks[p.id];
      if (r === null || r === undefined || r < 1 || r > 4) {
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
      setError("各順位（１位〜４位）は必ず１人のプレイヤーに割り当ててください。");
      return;
    }

    if (gameId) {
      updateGame(gameId, parsedRanks, {});
    } else {
      addGame(parsedRanks, {});
    }
    if (localStorage.getItem('haptics-enabled') !== 'false') haptics.success();
    onClose();
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 w-full h-full sm:h-auto sm:max-w-md p-0 sm:p-6 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center">
              {gameId ? "ゲーム結果の編集" : "ゲーム結果の入力"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground text-center mb-2 px-2">
              <div className="col-span-6 text-left">プレイヤー</div>
              <div className="col-span-6">順位</div>
            </div>

            {session.players.map((player) => (
              <div key={player.id} className="grid grid-cols-12 items-center gap-4 p-2 rounded-lg active:bg-muted/50 transition-colors">
                <Label htmlFor={`rank-${player.id}`} className="col-span-6 font-bold truncate text-lg">
                  {player.name}
                </Label>
                
                <div className="col-span-6">
                  <select
                    id={`rank-${player.id}`}
                    value={ranks[player.id]?.toString() || ""}
                    onChange={(e) => handleRankChange(player.id, e.target.value)}
                    className="glass-input border-0 text-center h-12 text-lg font-medium w-full rounded-lg bg-background/50 backdrop-blur-sm"
                  >
                    <option value="">-</option>
                    <option value="1">1位</option>
                    <option value="2">2位</option>
                    <option value="3">3位</option>
                    <option value="4">4位</option>
                  </select>
                </div>
              </div>
            ))}
            
            {error && (
              <div className="text-destructive text-base text-center font-bold bg-destructive/10 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm mt-auto sm:mt-0">
          <Button 
            onClick={validateAndSubmit} 
            className="w-full h-14 text-lg font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            保存する
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full mt-2 h-12 text-muted-foreground"
          >
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
