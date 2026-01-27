import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { DEFAULT_SETTINGS, Player } from "@/lib/types";
import { nanoid } from "nanoid";
import { Play, Users, ChevronDown, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PlayerManager } from "./PlayerManager";

const PLAYER_COLORS = ["#4fd1c5", "#9f7aea", "#f687b3", "#f6ad55"]; // Teal, Purple, Pink, Orange

export function GameSetup() {
  const { startNewSession } = useGame();
  const { registeredPlayers } = usePlayer();
  const [showManager, setShowManager] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>([
    { id: nanoid(), name: "プレイヤー 1", color: PLAYER_COLORS[0] },
    { id: nanoid(), name: "プレイヤー 2", color: PLAYER_COLORS[1] },
    { id: nanoid(), name: "プレイヤー 3", color: PLAYER_COLORS[2] },
    { id: nanoid(), name: "プレイヤー 4", color: PLAYER_COLORS[3] },
  ]);

  const handleNameChange = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const selectRegisteredPlayer = (playerId: string, registeredName: string) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, name: registeredName } : p));
  };

  const handleStart = () => {
    startNewSession(players, DEFAULT_SETTINGS);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md glass-panel border-0 relative">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
          onClick={() => setShowManager(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          プレイヤー管理
        </Button>

        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">新規ゲーム設定</CardTitle>
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
                    プレイヤー {index + 1}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`player-${index}`}
                      value={player.name}
                      onChange={(e) => handleNameChange(player.id, e.target.value)}
                      className="glass-input border-0"
                      placeholder={`プレイヤー ${index + 1}`}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 bg-background/50 border-0">
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>登録済みから選択</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {registeredPlayers.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">
                            登録プレイヤーがいません
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto">
                            {registeredPlayers.map((rp) => (
                              <DropdownMenuItem 
                                key={rp.id}
                                onClick={() => selectRegisteredPlayer(player.id, rp.name)}
                              >
                                {rp.name}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowManager(true)} className="text-primary cursor-pointer">
                          <UserPlus className="w-3 h-3 mr-2" />
                          新規登録...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleStart} 
            className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-5 h-5 mr-2" />
            セッション開始
          </Button>
        </CardContent>
      </Card>

      {showManager && <PlayerManager onClose={() => setShowManager(false)} />}
    </div>
  );
}
