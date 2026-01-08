import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useGame } from "@/contexts/GameContext";

interface ChipInputProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChipInput({ isOpen, onClose }: ChipInputProps) {
  const { session, addChipLog } = useGame();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const handleAmountChange = (pid: string, value: string) => {
    setAmounts(prev => ({ ...prev, [pid]: value }));
  };

  const handleSubmit = () => {
    const parsedAmounts: Record<string, number> = {};
    let total = 0;
    let hasError = false;

    session.players.forEach(p => {
      const valStr = amounts[p.id];
      const val = valStr ? parseInt(valStr) : 0;
      
      if (valStr && isNaN(val)) {
        hasError = true;
      }
      
      parsedAmounts[p.id] = val;
      total += val;
    });

    if (hasError) {
      setError("有効な数値を入力してください。");
      return;
    }

    if (total !== 0) {
      setError(`チップの合計は0になる必要があります。現在の合計: ${total > 0 ? "+" : ""}${total}`);
      return;
    }

    if (Object.values(parsedAmounts).every(v => v === 0)) {
      setError("少なくとも1つのチップ移動を入力してください。");
      return;
    }

    addChipLog(parsedAmounts, note);
    setAmounts({});
    setNote("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">チップ入力</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center mb-2">
            チップの枚数またはポイントを入力してください（合計0）
          </p>

          {session.players.map((player) => (
            <div key={player.id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`chip-${player.id}`} className="text-right col-span-1 font-medium truncate">
                {player.name}
              </Label>
              <Input
                id={`chip-${player.id}`}
                type="number"
                value={amounts[player.id] || ""}
                onChange={(e) => handleAmountChange(player.id, e.target.value)}
                className="col-span-3 glass-input border-0 text-lg text-center font-mono"
                placeholder="0"
              />
            </div>
          ))}

          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <Label htmlFor="chip-note" className="text-right col-span-1 font-medium">
              メモ
            </Label>
            <Input
              id="chip-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3 glass-input border-0"
              placeholder="任意（例: 焼き鳥）"
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleSubmit} 
            className="w-full sm:w-auto min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
