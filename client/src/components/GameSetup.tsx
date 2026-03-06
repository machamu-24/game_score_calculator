import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { haptics } from "@/lib/haptics";
import { usePlayer } from "@/contexts/PlayerContext";
import { DEFAULT_SETTINGS, GameSettings, Player } from "@/lib/types";
import { nanoid } from "nanoid";
import { Play, Users, ChevronDown, UserPlus, ChevronUp } from "lucide-react";
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
  const [showSettings, setShowSettings] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>([
    { id: nanoid(), name: "プレイヤー 1", color: PLAYER_COLORS[0] },
    { id: nanoid(), name: "プレイヤー 2", color: PLAYER_COLORS[1] },
    { id: nanoid(), name: "プレイヤー 3", color: PLAYER_COLORS[2] },
    { id: nanoid(), name: "プレイヤー 4", color: PLAYER_COLORS[3] },
  ]);

  // ウマ・オカ設定
  const [rankPoints, setRankPoints] = useState<[string, string, string, string]>([
    String(DEFAULT_SETTINGS.rankPoints[0]),
    String(DEFAULT_SETTINGS.rankPoints[1]),
    String(DEFAULT_SETTINGS.rankPoints[2]),
    String(DEFAULT_SETTINGS.rankPoints[3]),
  ]);

  const handleNameChange = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const selectRegisteredPlayer = (playerId: string, registeredName: string) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, name: registeredName } : p));
  };

  const handleStart = () => {
    if (localStorage.getItem('haptics-enabled') !== 'false') haptics.heavy();
    
    // ウマ・オカ設定を解析
    const parsedPoints = rankPoints.map(p => parseInt(p));
    const settings: GameSettings = parsedPoints.some(isNaN)
      ? DEFAULT_SETTINGS
      : { rankPoints: parsedPoints as [number, number, number, number] };
    
    startNewSession(players, settings);
  };

  return (
    <div className="flex items-center justify-center min-h-[100dvh] sm:min-h-[80vh] p-0 sm:p-4">
      <Card className="w-full h-[100dvh] sm:h-auto max-w-md glass-panel border-0 relative flex flex-col rounded-none sm:rounded-xl">
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary"
            onClick={() => setShowManager(true)}
          >
            <Users className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">プレイヤー管理</span>
          </Button>
        </div>

        <CardHeader className="pt-8 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-primary">新規ゲーム設定</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-6 overflow-y-auto pb-24 sm:pb-6">
          <div className="space-y-6">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center gap-3">
                <div 
                  className="w-5 h-5 rounded-full shrink-0 shadow-sm" 
                  style={{ backgroundColor: player.color }}
                />
                <div className="grid gap-2 w-full">
                  <Label htmlFor={`player-${index}`} className="text-sm font-medium text-muted-foreground">
                    プレイヤー {index + 1}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`player-${index}`}
                      value={player.name}
                      onChange={(e) => handleNameChange(player.id, e.target.value)}
                      className="glass-input border-0 h-12 text-lg"
                      placeholder={`プレイヤー ${index + 1}`}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 w-12 h-12 bg-background/50 border-0">
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>登録済みから選択</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {registeredPlayers.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            登録プレイヤーがいません
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto">
                            {registeredPlayers.map((rp) => (
                              <DropdownMenuItem 
                                key={rp.id}
                                onClick={() => selectRegisteredPlayer(player.id, rp.name)}
                                className="py-3 text-base"
                              >
                                {rp.name}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowManager(true)} className="text-primary cursor-pointer py-3 font-medium">
                          <UserPlus className="w-4 h-4 mr-2" />
                          新規登録...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ウマ・オカ設定（折りたたみ） */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              onClick={() => setShowSettings(!showSettings)}
            >
              <span>順位点設定（ウマ・オカ）</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/70">
                  {rankPoints.join(' / ')}
                </span>
                {showSettings ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showSettings && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/10">
                <p className="text-xs text-muted-foreground pt-3">
                  1位〜4位に付与されるポイントを設定してください。
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {rankPoints.map((point, index) => (
                    <div key={index} className="space-y-1">
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
                        className="text-center glass-input font-mono h-10 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm absolute bottom-0 left-0 right-0 sm:relative sm:bg-transparent sm:border-0 sm:backdrop-blur-none">
          <Button 
            onClick={handleStart} 
            className="w-full h-14 text-xl font-bold shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
          >
            <Play className="w-6 h-6 mr-2" />
            セッション開始
          </Button>
        </div>
      </Card>

      {showManager && <PlayerManager onClose={() => setShowManager(false)} />}
    </div>
  );
}
