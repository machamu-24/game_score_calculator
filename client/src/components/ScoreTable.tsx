import { useGame } from "@/contexts/GameContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Coins } from "lucide-react";
import { useState } from "react";
import { ScoreInput } from "./ScoreInput";

export function ScoreTable() {
  const { session, deleteGame, deleteChipLog } = useGame();
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  if (!session) return null;

  const reversedGames = [...session.games].reverse();
  const reversedChips = [...session.chipLogs].reverse();

  return (
    <div className="space-y-8">
      {/* Games Table */}
      <div className="rounded-xl overflow-hidden glass-panel border-0">
        <div className="p-4 font-bold text-lg border-b border-white/10">ゲーム履歴</div>
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/10">
              <TableHead className="w-[60px] text-center">#</TableHead>
              {session.players.map(p => (
                <TableHead key={p.id} className="text-center font-bold text-foreground">
                  {p.name}
                </TableHead>
              ))}
              <TableHead className="w-[80px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reversedGames.length === 0 ? (
              <TableRow>
                <TableCell colSpan={session.players.length + 2} className="text-center py-8 text-muted-foreground">
                  まだゲーム記録がありません。
                </TableCell>
              </TableRow>
            ) : (
              reversedGames.map((game, index) => {
                const gameNumber = session.games.length - index;
                return (
                  <TableRow key={game.id} className="hover:bg-white/5 border-white/10 transition-colors">
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {gameNumber}
                    </TableCell>
                    {session.players.map(p => {
                      const score = game.finalPoints[p.id];
                      const rank = game.ranks[p.id];
                      const isPositive = score > 0;
                      const isNegative = score < 0;
                      
                      const rankColor = 
                        rank === 1 ? "text-yellow-500" :
                        rank === 2 ? "text-gray-400" :
                        rank === 3 ? "text-amber-700" : "text-muted-foreground";

                      return (
                        <TableCell key={p.id} className="text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-mono font-bold text-lg ${
                              isPositive ? "text-emerald-500 dark:text-emerald-400" : 
                              isNegative ? "text-rose-500 dark:text-rose-400" : 
                              "text-muted-foreground"
                            }`}>
                              {score > 0 ? "+" : ""}{score}
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold ${rankColor}`}>
                              {rank === 1 ? "1位" : rank === 2 ? "2位" : rank === 3 ? "3位" : "4位"}
                            </span>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-white/10 hover:text-primary"
                          onClick={() => setEditingGameId(game.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-white/10 hover:text-destructive"
                          onClick={() => deleteGame(game.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            
            {/* Game Subtotal */}
            <TableRow className="bg-white/5 font-medium border-t-2 border-white/10">
              <TableCell className="text-center text-muted-foreground text-xs">小計</TableCell>
              {session.players.map(p => {
                const total = session.totalGamePoints[p.id];
                return (
                  <TableCell key={p.id} className="text-center">
                    <span className={total > 0 ? "text-emerald-500" : total < 0 ? "text-rose-500" : ""}>
                      {total > 0 ? "+" : ""}{total}
                    </span>
                  </TableCell>
                );
              })}
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Chips Table */}
      {reversedChips.length > 0 && (
        <div className="rounded-xl overflow-hidden glass-panel border-0">
          <div className="p-4 font-bold text-lg border-b border-white/10 flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            チップ / 調整
          </div>
          <Table>
            <TableBody>
              {reversedChips.map((log) => (
                <TableRow key={log.id} className="hover:bg-white/5 border-white/10">
                  <TableCell className="w-[60px] text-center text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  {session.players.map(p => {
                    const amount = log.amounts[p.id];
                    return (
                      <TableCell key={p.id} className="text-center">
                        {amount !== 0 && (
                          <span className={`font-mono font-medium ${
                            amount > 0 ? "text-yellow-500" : "text-muted-foreground"
                          }`}>
                            {amount > 0 ? "+" : ""}{amount}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="w-[80px] text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-white/10 hover:text-destructive"
                      onClick={() => deleteChipLog(log.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Chip Subtotal */}
              <TableRow className="bg-white/5 font-medium border-t-2 border-white/10">
                <TableCell className="text-center text-muted-foreground text-xs">チップ計</TableCell>
                {session.players.map(p => {
                  const total = session.totalChips[p.id];
                  return (
                    <TableCell key={p.id} className="text-center">
                      <span className={total > 0 ? "text-yellow-500" : total < 0 ? "text-muted-foreground" : ""}>
                        {total > 0 ? "+" : ""}{total}
                      </span>
                    </TableCell>
                  );
                })}
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grand Total */}
      <div className="rounded-xl overflow-hidden glass-panel border-0 bg-primary/5 border-primary/20">
        <Table>
          <TableBody>
            <TableRow className="hover:bg-transparent border-0">
              <TableCell className="w-[60px] text-center font-bold text-primary">合計</TableCell>
              {session.players.map(p => {
                const total = session.grandTotal[p.id];
                return (
                  <TableCell key={p.id} className="text-center">
                    <span className={`text-2xl font-bold font-mono ${
                      total > 0 ? "text-primary" : total < 0 ? "text-destructive" : ""
                    }`}>
                      {total > 0 ? "+" : ""}{total}
                    </span>
                  </TableCell>
                );
              })}
              <TableCell className="w-[80px]"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {editingGameId && (
        <ScoreInput
          isOpen={true}
          onClose={() => setEditingGameId(null)}
          gameId={editingGameId}
          initialRanks={session.games.find(g => g.id === editingGameId)?.ranks}
          initialAdjustments={session.games.find(g => g.id === editingGameId)?.adjustments}
        />
      )}
    </div>
  );
}
