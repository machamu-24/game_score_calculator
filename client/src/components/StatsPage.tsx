import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Calendar, Medal, TrendingUp, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function StatsPage({ onClose }: { onClose: () => void }) {
  const { playerStats, history, clearHistory } = useHistory();

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col glass-panel border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">戦績・履歴</CardTitle>
          </div>
          <Button variant="ghost" onClick={onClose}>閉じる</Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs defaultValue="stats" className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">プレイヤー通算成績</TabsTrigger>
                <TabsTrigger value="history">対戦履歴</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="stats" className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full pr-4">
                {playerStats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    データがありません。ゲームをプレイして結果を保存してください。
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {playerStats.map((stat, index) => (
                      <Card key={stat.name} className="overflow-hidden border-l-4" style={{ borderLeftColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'transparent' }}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              index === 1 ? 'bg-slate-100 text-slate-700' : 
                              index === 2 ? 'bg-orange-100 text-orange-800' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{stat.name}</h3>
                              <p className="text-xs text-muted-foreground">最終プレイ: {new Date(stat.lastPlayed).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-right">
                            <div>
                              <p className="text-xs text-muted-foreground">通算スコア</p>
                              <p className={`font-bold ${stat.totalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.totalScore > 0 ? '+' : ''}{stat.totalScore}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">平均順位</p>
                              <p className="font-bold">{stat.averageRank}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">トップ率</p>
                              <p className="font-bold">{stat.topRate}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">対戦数</p>
                              <p className="font-bold">{stat.totalSessions}回</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-hidden p-6">
              <div className="flex justify-end mb-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={history.length === 0}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      履歴を全消去
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>履歴をすべて消去しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        これまでの対戦履歴とプレイヤー成績がすべて削除されます。この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground">
                        消去する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <ScrollArea className="h-full pr-4">
                {history.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    履歴がありません。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <Card key={item.id}>
                        <CardHeader className="pb-2 border-b bg-muted/30">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{new Date(item.date).toLocaleString()}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{item.gameCount} ゲーム</span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {item.players.map((p) => (
                              <div key={p.name} className="flex items-center justify-between p-2 rounded bg-background/50 border">
                                <div className="flex items-center gap-2">
                                  {p.rank === 1 && <Trophy className="w-3 h-3 text-yellow-500" />}
                                  <span className="text-sm font-medium truncate max-w-[80px]">{p.name}</span>
                                </div>
                                <span className={`text-sm font-bold ${p.totalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {p.totalScore > 0 ? '+' : ''}{p.totalScore}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
