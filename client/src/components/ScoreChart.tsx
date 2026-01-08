import { useGame } from "@/contexts/GameContext";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScoreChart() {
  const { session } = useGame();

  if (!session || session.games.length === 0) return null;

  // Transform data for Recharts
  // Data structure: [{ name: "Start", p1: 0, p2: 0... }, { name: "Game 1", p1: 10, p2: -5... }]
  
  const data = [
    {
      name: "Start",
      ...session.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
    }
  ];

  let currentTotals = { ...session.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}) };

  session.games.forEach((game, index) => {
    const point = {
      name: `Game ${index + 1}`,
    };
    
    session.players.forEach(p => {
      // @ts-ignore
      currentTotals[p.id] += game.finalPoints[p.id];
      // @ts-ignore
      point[p.id] = parseFloat(currentTotals[p.id].toFixed(1));
    });
    
    // @ts-ignore
    data.push(point);
  });

  return (
    <Card className="glass-panel border-0 w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">Score Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--popover)", 
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                itemStyle={{ color: "var(--popover-foreground)" }}
              />
              {session.players.map((player, index) => (
                <Line
                  key={player.id}
                  type="monotone"
                  dataKey={player.id}
                  name={player.name}
                  stroke={player.color || `var(--chart-${index + 1})`}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
