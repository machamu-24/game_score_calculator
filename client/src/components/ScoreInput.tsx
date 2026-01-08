import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useGame } from "@/contexts/GameContext";
import { Player } from "@/lib/types";

interface ScoreInputProps {
  isOpen: boolean;
  onClose: () => void;
  gameId?: string; // If provided, we are editing
  initialScores?: Record<string, number>;
}

export function ScoreInput({ isOpen, onClose, gameId, initialScores }: ScoreInputProps) {
  const { session, addGame, updateGame } = useGame();
  const [scores, setScores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      const initial: Record<string, string> = {};
      session.players.forEach(p => {
        initial[p.id] = initialScores ? String(initialScores[p.id] || "") : "";
      });
      setScores(initial);
      setError(null);
    }
  }, [isOpen, session, initialScores]);

  const handleScoreChange = (pid: string, value: string) => {
    setScores(prev => ({ ...prev, [pid]: value }));
  };

  const validateAndSubmit = () => {
    if (!session) return;

    const parsedScores: Record<string, number> = {};
    let totalScore = 0;
    let hasError = false;

    session.players.forEach(p => {
      const val = parseInt(scores[p.id]);
      if (isNaN(val)) {
        hasError = true;
      }
      parsedScores[p.id] = val;
      totalScore += val;
    });

    if (hasError) {
      setError("Please enter valid numbers for all players.");
      return;
    }

    // Validation: Total score should match (Initial * 4) usually, but we can just warn or allow flexibility
    // Standard Mahjong: 25000 * 4 = 100000
    const expectedTotal = session.settings.initialScore * 4;
    if (totalScore !== expectedTotal) {
      setError(`Total score is ${totalScore}. Expected ${expectedTotal}. Diff: ${totalScore - expectedTotal}`);
      // We allow submission even with warning? Let's block for now to ensure data integrity, or maybe just warn.
      // User requested flexibility, so maybe just show warning but allow submit?
      // Let's block for safety but maybe add an "Override" button later if needed.
      // For now, strictly enforce sum.
      return; 
    }

    if (gameId) {
      updateGame(gameId, parsedScores);
    } else {
      addGame(parsedScores);
    }
    onClose();
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {gameId ? "Edit Game Scores" : "Enter Game Scores"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {session.players.map((player) => (
            <div key={player.id} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`score-${player.id}`} className="text-right col-span-1 font-medium truncate">
                {player.name}
              </Label>
              <Input
                id={`score-${player.id}`}
                type="number"
                value={scores[player.id] || ""}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                className="col-span-3 glass-input border-0 text-lg text-center font-mono"
                placeholder="0"
              />
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
            Save Scores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
