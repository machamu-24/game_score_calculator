import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Calendar, TrendingUp, Trash2, X, User } from "lucide-react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from "react";
import { PlayerProfile } from "./PlayerProfile";
import { HistoryDetail } from "./HistoryDetail";
import { SessionHistoryItem } from "@/lib/types";

export function StatsPage({ onClose }: { onClose: () => void }) {
  const { playerStats, history, deleteHistoryItem, clearHistory } = useHistory();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SessionHistoryItem | null>(null);

  // Prepare data for the chart
  // Sort history by date ascending for the chart
  const sortedHistory = [...history].sort((a, b) => a.date - b.date);
  
  // Get all unique player names
  const allPlayerNames = Array.from(new Set(history.flatMap(h => h.players.map(p => p.name))));
  
  // Create cumulative score data
  const chartData = sortedHistory.reduce((acc, session, index) => {
    const prevData = index > 0 ? acc[index - 1] : {};
    const newData: any = {
      name: new Date(session.date).toLocaleDateString(),
      date: session.date, // keep for sorting if needed
    };

    allPlayerNames.forEach(playerName => {
      const playerInSession = session.players.find(p => p.name === playerName);
      const sessionScore = playerInSession ? playerInSession.totalScore : 0;
      const prevScore = prevData[playerName] || 0;
      newData[playerName] = prevScore + sessionScore;
    });

    acc.push(newData);
    return acc;
  }, [] as any[]);

  // Add initial 0 point
  if (chartData.length > 0) {
    const initialPoint: any = { name: '開始' };
    allPlayerNames.forEach(name => initialPoint[name] = 0);
    chartData.unshift(initialPoint);
  }

  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#22c55e", // green
    "#eab308", // yellow
    "#a855f7", // purple
    "#f97316", // orange
    "#06b6d4", // cyan
    "#ec4899", // pink
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      {selectedPlayer && (
        <PlayerProfile 
          playerName={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}

      {selectedHistoryItem && (
        <HistoryDetail
          historyItem={selectedHistoryItem}
          onClose={() => setSelectedHistoryItem(null)}
        />
      )}
      
      <Card className="w-full h-full sm:h-[90vh] max-w-4xl flex flex-col glass-panel border-0 sm:border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 rounded-none sm:rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl sm:text-2xl">戦績・履歴</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <Tabs defaultValue="stats" className="h-full flex flex-col">
            <div className="px-4 pt-4 shrink-0">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="stats" className="text-xs sm:text-sm">通算成績</TabsTrigger>
                <TabsTrigger value="chart" className="text-xs sm:text-sm">推移グラフ</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">対戦履歴</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="stats" className="flex-1 overflow-hidden p-4 sm:p-6">
              <ScrollArea className="h-full pr-0 sm:pr-4">
                {playerStats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    データがありません。ゲームをプレイして結果を保存してください。
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4 pb-20 sm:pb-0">
                    {playerStats.map((stat, index) => (
                      <Card 
                        key={stat.name} 
                        className="overflow-hidden border-l-4 cursor-pointer hover:bg-muted/50 transition-colors group" 
                        style={{ borderLeftColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'transparent' }}
                        onClick={() => setSelectedPlayer(stat.name)}
                      >
                        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              index === 1 ? 'bg-slate-100 text-slate-700' : 
                              index === 2 ? 'bg-orange-100 text-orange-800' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                {stat.name}
                                <User className="w-4 h-4 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                              </h3>
                              <p className="text-xs text-muted-foreground">最終: {new Date(stat.lastPlayed).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 w-full sm:w-auto text-center sm:text-right">
                            <div className="flex flex-col items-center sm:items-end">
                              <p className="text-[10px] text-muted-foreground">スコア</p>
                              <p className={`font-bold text-sm sm:text-base ${stat.totalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.totalScore > 0 ? '+' : ''}{stat.totalScore}
                              </p>
                            </div>
                            <div className="flex flex-col items-center sm:items-end">
                              <p className="text-[10px] text-muted-foreground">平均順位</p>
                              <p className="font-bold text-sm sm:text-base">{stat.averageRank}</p>
                            </div>
                            <div className="flex flex-col items-center sm:items-end">
                              <p className="text-[10px] text-muted-foreground">トップ率</p>
                              <p className="font-bold text-sm sm:text-base">{stat.topRate}%</p>
                            </div>
                            <div className="flex flex-col items-center sm:items-end">
                              <p className="text-[10px] text-muted-foreground">対戦数</p>
                              <p className="font-bold text-sm sm:text-base">{stat.totalSessions}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chart" className="flex-1 overflow-hidden p-6">
              {chartData.length <= 1 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  データが不足しています。ゲームをプレイして結果を保存してください。
                </div>
              ) : (
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      {allPlayerNames.map((name, index) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
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
                      <Card 
                        key={item.id} 
                        className="relative group cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedHistoryItem(item)}
                      >
                        <div 
                          className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>この履歴を削除しますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {new Date(item.date).toLocaleString()} の対戦記録を削除します。<br/>
                                  この操作は取り消せません。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    if (localStorage.getItem('haptics-enabled') !== 'false') {
                                      // Dynamic import to avoid circular dependency if haptics is not available in this context
                                      import('@/lib/haptics').then(({ haptics }) => haptics.heavy());
                                    }
                                    deleteHistoryItem(item.id);
                                  }} 
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  削除する
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        <CardHeader className="pb-2 border-b bg-muted/30">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{new Date(item.date).toLocaleString()}</span>
                            </div>
                            <span className="text-xs text-muted-foreground mr-8">{item.gameCount} ゲーム</span>
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
