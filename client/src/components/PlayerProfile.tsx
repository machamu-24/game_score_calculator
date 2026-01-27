import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Calendar, TrendingUp, X, Medal, Target, Hash, Crown, Shield, Zap, Scale, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PlayerProfileProps {
  playerName: string;
  onClose: () => void;
}

export function PlayerProfile({ playerName, onClose }: PlayerProfileProps) {
  const { playerStats, history } = useHistory();

  // Get stats for this player
  const stats = playerStats.find(s => s.name === playerName);
  
  // Filter history for this player
  const playerHistory = history
    .filter(h => h.players.some(p => p.name === playerName))
    .sort((a, b) => a.date - b.date);

  // Prepare chart data
  let cumulativeScore = 0;
  const chartData = playerHistory.map(session => {
    const playerData = session.players.find(p => p.name === playerName);
    const score = playerData ? playerData.totalScore : 0;
    cumulativeScore += score;
    return {
      date: new Date(session.date).toLocaleDateString(),
      score: cumulativeScore,
      sessionScore: score,
      rank: playerData?.rank
    };
  });

  // Add initial 0 point
  if (chartData.length > 0) {
    chartData.unshift({
      date: '開始',
      score: 0,
      sessionScore: 0,
      rank: undefined
    });
  }

  // Calculate detailed stats for achievements
  const totalGames = playerHistory.reduce((acc, session) => acc + session.gameCount, 0);
  const rankCounts = [0, 0, 0, 0, 0]; // index 1-4 used for ranks
  
  playerHistory.forEach(session => {
    const p = session.players.find(p => p.name === playerName);
    if (p && p.rank) {
      rankCounts[p.rank]++;
    }
  });

  if (!stats) return null;

  // Achievement Definitions
  const achievements = [
    {
      id: 'top_last_demon',
      title: 'トップラス魔神',
      description: '1位と4位の合計が70%以上',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      condition: () => {
        if (totalGames < 5) return false;
        const topLastRate = (rankCounts[1] + rankCounts[4]) / stats.totalSessions;
        return topLastRate >= 0.7;
      }
    },
    {
      id: 'rentai_demon',
      title: '連対の鬼',
      description: '1位・2位の確率が60%以上',
      icon: <Crown className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      condition: () => {
        if (totalGames < 5) return false;
        const rentaiRate = (rankCounts[1] + rankCounts[2]) / stats.totalSessions;
        return rentaiRate >= 0.6;
      }
    },
    {
      id: 'iron_defense',
      title: '鉄壁の守備',
      description: '4位率が15%以下',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      condition: () => {
        if (totalGames < 5) return false;
        const lastRate = rankCounts[4] / stats.totalSessions;
        return lastRate <= 0.15;
      }
    },
    {
      id: 'high_roller',
      title: '豪運の覇者',
      description: '通算スコアが+200以上',
      icon: <Star className="w-4 h-4" />,
      color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      condition: () => stats.totalScore >= 200
    },
    {
      id: 'mr_average',
      title: 'ミスター平均',
      description: '平均順位が2.40〜2.60',
      icon: <Scale className="w-4 h-4" />,
      color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      condition: () => {
        if (totalGames < 5) return false;
        const avg = typeof stats.averageRank === 'string' ? parseFloat(stats.averageRank) : stats.averageRank;
        return avg >= 2.4 && avg <= 2.6;
      }
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.condition());

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col glass-panel border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {playerName.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-2xl">{playerName}</CardTitle>
              <p className="text-xs text-muted-foreground">プレイヤー詳細データ</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-6 space-y-6">
          <ScrollArea className="h-full pr-4">
            {/* Achievements Section */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  獲得称号
                </h3>
                <div className="flex flex-wrap gap-3">
                  {unlockedAchievements.map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${achievement.color} shadow-sm transition-all hover:scale-105`}
                      title={achievement.description}
                    >
                      {achievement.icon}
                      <span className="font-bold text-sm">{achievement.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-2 p-2 bg-blue-200 dark:bg-blue-800 rounded-full">
                    <Medal className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">通算スコア</p>
                  <p className={`text-2xl font-bold ${stats.totalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.totalScore > 0 ? '+' : ''}{stats.totalScore}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-2 p-2 bg-purple-200 dark:bg-purple-800 rounded-full">
                    <Target className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">平均順位</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.averageRank}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-2 p-2 bg-yellow-200 dark:bg-yellow-800 rounded-full">
                    <Trophy className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">トップ率</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.topRate}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-2 p-2 bg-slate-200 dark:bg-slate-800 rounded-full">
                    <Hash className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">対戦数</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    {stats.totalSessions}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                スコア推移
              </h3>
              <div className="h-[300px] w-full bg-background/50 rounded-xl border p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#666', marginBottom: '0.5rem' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="通算スコア"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History List */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                対戦履歴
              </h3>
              <div className="space-y-3">
                {playerHistory.map((session) => {
                  const playerData = session.players.find(p => p.name === playerName);
                  if (!playerData) return null;

                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border hover:bg-background/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          playerData.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                          playerData.rank === 2 ? 'bg-slate-100 text-slate-700' : 
                          playerData.rank === 3 ? 'bg-orange-100 text-orange-800' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {playerData.rank}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{new Date(session.date).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{session.gameCount} ゲーム</p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${playerData.totalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {playerData.totalScore > 0 ? '+' : ''}{playerData.totalScore}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
