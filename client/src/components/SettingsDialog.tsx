import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

export function SettingsDialog() {
  const { session, updateSettings } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [rankPoints, setRankPoints] = useState<[string, string, string, string]>(["50", "10", "-10", "-30"]);

  useEffect(() => {
    if (session && isOpen) {
      setRankPoints([
        String(session.settings.rankPoints[0]),
        String(session.settings.rankPoints[1]),
        String(session.settings.rankPoints[2]),
        String(session.settings.rankPoints[3])
      ]);
    }
  }, [session, isOpen]);

  if (!session) return null;

  const handleSave = () => {
    const newPoints = rankPoints.map(p => parseInt(p));
    if (newPoints.some(isNaN)) return;

    updateSettings({
      rankPoints: newPoints as [number, number, number, number]
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-0">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Rank Points</h4>
            <p className="text-sm text-muted-foreground">
              Points awarded for 1st, 2nd, 3rd, and 4th place.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {rankPoints.map((point, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-xs text-center block text-muted-foreground">
                    {index + 1}{index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"}
                  </Label>
                  <Input
                    type="number"
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...rankPoints] as [string, string, string, string];
                      newPoints[index] = e.target.value;
                      setRankPoints(newPoints);
                    }}
                    className="text-center glass-input font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
