import { SessionHistoryItem } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HistoryDetailProps {
  historyItem: SessionHistoryItem;
  onClose: () => void;
}

export function HistoryDetail({ historyItem, onClose }: HistoryDetailProps) {
  // 詳細データがない場合（古い履歴など）
  if (!historyItem.games) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>詳細データなし</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            この履歴には詳細データ（各ゲームのスコアなど）が保存されていません。
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>閉じる</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const reversedGames = [...historyItem.games].reverse();
  const reversedChips = historyItem.chipLogs ? [...historyItem.chipLogs].reverse() : [];
  
  // プレイヤーIDと名前のマッピングを作成（履歴アイテムのplayers配列から）
  // 注意: games内のキーはプレイヤーIDだが、historyItem.playersにはIDが含まれていない可能性がある
  // そのため、名前でマッチングするか、保存時の構造に依存する
  // ここでは、historyItem.playersの順序とgames内のキーの関連性が不明確なため、
  // 表示用のプレイヤーリストを作成する
  
  // ゲームデータからプレイヤーIDのリストを取得
  const playerIds = Object.keys(historyItem.games[0]?.finalPoints || {});
  
  // プレイヤーIDごとの名前を特定（historyItem.playersの名前と照合するのは難しいので、
  // ここではIDが名前そのものであるか、あるいは保存時にID=名前として扱われていると仮定するか、
  // もしくはgamesデータ内のキーを使う）
  
  // アプリの仕様上、現状ではID=名前（またはIDがUUIDで名前が別）だが、
  // SessionHistoryItemのplayersにはnameしか入っていない。
  // しかし、gamesのキーはID。
  // ここで問題になるのは、IDから名前への解決。
  // 過去のデータ構造を見ると、saveSessionで `players: playerScores.map(...)` としており、
  // ここにはIDが含まれていない。
  // したがって、詳細表示するには `games` のキー（ID）に対応する名前が必要だが、
  // それが欠落している可能性がある。
  
  // 修正案: HistoryContext.tsxでの保存時にIDも含めるように修正が必要だが、
  // 既存のデータについてはどうするか。
  // 幸い、現在のアプリの実装では `p.id` を使って保存しているが、
  // `session.players` の情報が `SessionHistoryItem` には完全には含まれていない。
  
  // 解決策: `games` のキーをそのまま表示名として使う（ID=名前の場合）、
  // または `historyItem.players` の名前リストを使う。
  // ただし順序が保証されない。
  
  // ここでは、`historyItem.players` の名前を表示用ヘッダーとして使い、
  // データ行ではその順序に合わせて値を表示するよう試みる。
  // しかし、`games` のキーがIDで、`historyItem.players` にIDがないため紐付け不能。
  
  // ★重要★
  // この問題を解決するため、HistoryContext.tsxの保存処理で
  // `players` 配列に `id` も含めるように修正済みであるべきだが、
  // 先ほどの修正では `id` を追加していない。
  // 追加修正が必要。
  
  // 一旦、このコンポーネントでは「プレイヤー名」のリストを表示し、
  // ゲームデータ側は「キー」を表示するが、
  // もしキーがUUIDなら表示が崩れる。
  // 現状のアプリ仕様では `id` は `crypto.randomUUID()` で生成されているため、
  // 名前とは異なる。
  
  // よって、`SessionHistoryItem` に `playerMap` のような
  // ID -> Name のマッピング情報を保存する必要がある。
  // または `players` 配列に `id` を追加する。
  
  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-[90vh] max-w-4xl flex flex-col bg-background sm:rounded-xl shadow-2xl overflow-hidden border sm:border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0 bg-muted/30">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-bold text-lg">対戦履歴詳細</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(historyItem.date).toLocaleString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-8 pb-20">
            {/* Games Table */}
            <div className="rounded-xl overflow-hidden border">
              <div className="p-3 bg-muted/50 font-bold text-sm border-b">ゲーム記録</div>
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">#</TableHead>
                      {historyItem.players.map((p, i) => (
                        <TableHead key={i} className="text-center font-bold min-w-[80px]">
                          {p.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reversedGames.map((game, index) => {
                      const gameNumber = (historyItem.games?.length || 0) - index;
                      return (
                        <TableRow key={game.id}>
                          <TableCell className="text-center font-mono text-muted-foreground">
                            {gameNumber}
                          </TableCell>
                          {/* 
                            注意: ここでプレイヤーIDと名前の紐付け問題がある。
                            保存データにIDが含まれていないため、正確なマッピングができない可能性がある。
                            
                            暫定対応: 
                            games.finalPointsのキーの数とhistoryItem.playersの数が一致する場合、
                            順序に依存して表示する...というのは危険。
                            
                            正しい実装のためには、HistoryContextでの保存処理を修正し、
                            ID情報を含める必要がある。
                            
                            このコンポーネントは、ID情報が追加されたことを前提に実装する。
                            (後ほどHistoryContextとtypes.tsを修正する)
                          */}
                          {historyItem.players.map((p: any, i) => {
                            // p.id が存在することを前提とする
                            const playerId = p.id; 
                            const score = playerId ? game.finalPoints[playerId] : 0;
                            const rank = playerId ? game.ranks[playerId] : 0;
                            
                            // IDがない場合（古いデータ）は表示できない旨を表示するか、
                            // 別の方法で試みる（ここでは安全のため0表示）
                            if (!playerId) return <TableCell key={i} className="text-center">-</TableCell>;

                            const isPositive = score > 0;
                            const isNegative = score < 0;
                            
                            const rankColor = 
                              rank === 1 ? "text-yellow-500" :
                              rank === 2 ? "text-gray-400" :
                              rank === 3 ? "text-amber-700" : "text-muted-foreground";

                            return (
                              <TableCell key={i} className="text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`font-mono font-bold ${
                                    isPositive ? "text-emerald-600" : 
                                    isNegative ? "text-rose-600" : 
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Chips Table */}
            {reversedChips.length > 0 && (
              <div className="rounded-xl overflow-hidden border">
                <div className="p-3 bg-muted/50 font-bold text-sm border-b flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  チップ / 調整
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableBody>
                      {reversedChips.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="w-[50px] text-center text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          {historyItem.players.map((p: any, i) => {
                            const playerId = p.id;
                            const amount = playerId ? log.amounts[playerId] : 0;
                            
                            if (!playerId) return <TableCell key={i} className="text-center">-</TableCell>;

                            return (
                              <TableCell key={i} className="text-center min-w-[80px]">
                                {amount !== 0 && (
                                  <span className={`font-mono font-medium ${
                                    amount > 0 ? "text-yellow-600" : "text-muted-foreground"
                                  }`}>
                                    {amount > 0 ? "+" : ""}{amount}
                                  </span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {/* Total Score Summary */}
            <div className="rounded-xl overflow-hidden border bg-primary/5">
              <div className="p-3 font-bold text-sm border-b border-primary/10 text-center">最終結果</div>
              <div className="flex divide-x divide-primary/10">
                {historyItem.players.map((p, i) => (
                  <div key={i} className="flex-1 p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      {p.rank === 1 && <Trophy className="w-3 h-3 text-yellow-500" />}
                      <span className="font-bold text-sm truncate max-w-[100px]">{p.name}</span>
                    </div>
                    <span className={`text-xl font-bold font-mono ${
                      p.totalScore > 0 ? "text-primary" : p.totalScore < 0 ? "text-destructive" : ""
                    }`}>
                      {p.totalScore > 0 ? "+" : ""}{p.totalScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
