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
      setError("Please enter valid numbers.");
      return;
    }

    // Zero-sum check for chips? Usually chips are zero-sum (someone pays, someone receives).
    // But sometimes it's just bonus. Let's warn if not zero-sum but allow it?
    // Or strictly enforce zero-sum.
    // "Chip" usually implies exchange. Let's enforce zero-sum for consistency, 
    // or at least warn. Let's enforce it to prevent mistakes.
    if (total !== 0) {
      setError(`Total chip amount must be 0. Current total: ${total > 0 ? "+" : ""}${total}`);
      return;
    }

    // Check if all zero
    if (Object.values(parsedAmounts).every(v => v === 0)) {
      setError("Please enter at least one chip movement.");
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
          <DialogTitle className="text-xl font-bold text-center">Record Chips</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center mb-2">
            Enter chip amounts (e.g., +5, -5). Total must be 0.
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
              Note
            </Label>
            <Input
              id="chip-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3 glass-input border-0"
              placeholder="Optional (e.g. Yakitori)"
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
            Add Chips
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
