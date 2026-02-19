import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Settings, Smartphone } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { haptics } from "@/lib/haptics";
import { DataManagement } from "./DataManagement";

export function SettingsDialog() {
  const { session, updateSettings } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [rankPoints, setRankPoints] = useState<[string, string, string, string]>(["50", "10", "-10", "-30"]);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('haptics-enabled');
    if (stored !== null) {
      setHapticsEnabled(stored === 'true');
    }
  }, []);

  const toggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    localStorage.setItem('haptics-enabled', String(enabled));
    if (enabled) haptics.medium();
  };

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
          <DialogTitle>ゲーム設定</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">順位点（ウマ・オカ）</h4>
            <p className="text-sm text-muted-foreground">
              1位〜4位に付与されるポイントを設定してください。
            </p>
            <div className="grid grid-cols-4 gap-2">
              {rankPoints.map((point, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-xs text-center block text-muted-foreground">
                    {index + 1}位
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

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <Label className="text-base font-medium">触覚フィードバック</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  ボタン操作時に振動でフィードバックします
                </p>
              </div>
              <Switch
                checked={hapticsEnabled}
                onCheckedChange={toggleHaptics}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <DataManagement />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            設定を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
