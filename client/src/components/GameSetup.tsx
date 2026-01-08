import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { DEFAULT_SETTINGS, Player } from "@/lib/types";
import { nanoid } from "nanoid";
import { Plus, Trash2, Play } from "lucide-react";

const PLAYER_COLORS = ["#4fd1c5", "#9f7aea", "#f687b3", "#f6ad55"]; // Teal, Purple, Pink, Orange

export function GameSetup() {
  const { startNewSession } = useGame();
  const [players, setPlayers] = useState<Player[]>([
    { id: nanoid(), name: "Player 1", color: PLAYER_COLORS[0] },
    { id: nanoid(), name: "Player 2", color: PLAYER_COLORS[1] },
    { id: nanoid(), name: "Player 3", color: PLAYER_COLORS[2] },
    { id: nanoid(), name: "Player 4", color: PLAYER_COLORS[3] },
  ]);

  const handleNameChange = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleStart = () => {
    startNewSession(players, DEFAULT_SETTINGS);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md glass-panel border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">New Game Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shrink-0" 
                  style={{ backgroundColor: player.color }}
                />
                <div className="grid gap-1.5 w-full">
                  <Label htmlFor={`player-${index}`} className="text-xs text-muted-foreground">
                    Player {index + 1}
                  </Label>
                  <Input
                    id={`player-${index}`}
                    value={player.name}
                    onChange={(e) => handleNameChange(player.id, e.target.value)}
                    className="glass-input border-0"
                    placeholder={`Player ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleStart} 
            className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
