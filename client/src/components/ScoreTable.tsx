import { useGame } from "@/contexts/GameContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ScoreInput } from "./ScoreInput";

export function ScoreTable() {
  const { session, deleteGame } = useGame();
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  if (!session || session.games.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground glass-panel rounded-xl">
        No games recorded yet. Start by adding a game!
      </div>
    );
  }

  // Reverse games to show latest first
  const reversedGames = [...session.games].reverse();

  return (
    <>
      <div className="rounded-xl overflow-hidden glass-panel border-0">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="hover:bg-transparent border-white/10">
              <TableHead className="w-[60px] text-center">#</TableHead>
              {session.players.map(p => (
                <TableHead key={p.id} className="text-center font-bold text-foreground">
                  {p.name}
                </TableHead>
              ))}
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reversedGames.map((game, index) => {
              const gameNumber = session.games.length - index;
              return (
                <TableRow key={game.id} className="hover:bg-white/5 border-white/10 transition-colors">
                  <TableCell className="text-center font-mono text-muted-foreground">
                    {gameNumber}
                  </TableCell>
                  {session.players.map(p => {
                    const score = game.finalPoints[p.id];
                    const isPositive = score > 0;
                    const isNegative = score < 0;
                    return (
                      <TableCell key={p.id} className="text-center">
                        <span className={`font-mono font-medium ${
                          isPositive ? "text-emerald-500 dark:text-emerald-400" : 
                          isNegative ? "text-rose-500 dark:text-rose-400" : 
                          "text-muted-foreground"
                        }`}>
                          {score > 0 ? "+" : ""}{score}
                        </span>
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
            })}
            
            {/* Total Row */}
            <TableRow className="bg-primary/10 hover:bg-primary/10 border-t-2 border-primary/20 font-bold">
              <TableCell className="text-center text-primary">Total</TableCell>
              {session.players.map(p => {
                const total = session.totalPoints[p.id];
                return (
                  <TableCell key={p.id} className="text-center text-lg">
                    <span className={total > 0 ? "text-primary" : total < 0 ? "text-destructive" : ""}>
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

      {editingGameId && (
        <ScoreInput
          isOpen={true}
          onClose={() => setEditingGameId(null)}
          gameId={editingGameId}
          initialScores={session.games.find(g => g.id === editingGameId)?.rawScores}
        />
      )}
    </>
  );
}
