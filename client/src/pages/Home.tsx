import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameProvider, useGame } from "@/contexts/GameContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { GameSetup } from "@/components/GameSetup";
import { ScoreTable } from "@/components/ScoreTable";
import { ScoreChart } from "@/components/ScoreChart";
import { ScoreInput } from "@/components/ScoreInput";
import { ChipInput } from "@/components/ChipInput";
import { ResultScreen } from "@/components/ResultScreen";
import { SettingsDialog } from "@/components/SettingsDialog";
import { StatsPage } from "@/components/StatsPage";
import { Plus, RefreshCw, Coins, Trophy, History } from "lucide-react";
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

function GameDashboard() {
  const { session, resetSession } = useGame();
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isChipInputOpen, setIsChipInputOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  if (!session) {
    return (
      <>
        <GameSetup />
        <div className="fixed bottom-4 right-4">
          <Button 
            variant="outline" 
            className="shadow-lg bg-background/80 backdrop-blur"
            onClick={() => setIsStatsOpen(true)}
          >
            <History className="w-4 h-4 mr-2" />
            戦績・履歴を見る
          </Button>
        </div>
        {isStatsOpen && <StatsPage onClose={() => setIsStatsOpen(false)} />}
      </>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ゲーム点数計算
          </h1>
          <p className="text-muted-foreground mt-1">
            開始時刻: {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <SettingsDialog />
          
          <Button 
            variant="outline" 
            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
            onClick={() => setIsResultOpen(true)}
          >
            <Trophy className="w-4 h-4 mr-2" />
            結果
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                リセット
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-panel">
              <AlertDialogHeader>
                <AlertDialogTitle>セッションを終了しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  現在のゲームデータはすべて消去されます。この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={resetSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  終了する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Action Bar (Mobile optimized) */}
      <div className="grid grid-cols-2 gap-4 md:flex md:justify-end">
        <Button 
          onClick={() => setIsChipInputOpen(true)} 
          className="bg-secondary text-secondary-foreground shadow-lg hover:shadow-secondary/25 hover:scale-105 transition-all"
        >
          <Coins className="w-5 h-5 mr-2" />
          チップ入力
        </Button>
        <Button 
          onClick={() => setIsInputOpen(true)} 
          className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          ゲーム入力
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chart & Stats */}
        <div className="lg:col-span-3 space-y-8">
          <ScoreChart />
        </div>

        {/* Full Width: Score Table */}
        <div className="lg:col-span-3">
          <ScoreTable />
        </div>
      </div>

      <ScoreInput 
        isOpen={isInputOpen} 
        onClose={() => setIsInputOpen(false)} 
      />
      
      <ChipInput
        isOpen={isChipInputOpen}
        onClose={() => setIsChipInputOpen(false)}
      />

      <ResultScreen
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
      />
      
      {isStatsOpen && <StatsPage onClose={() => setIsStatsOpen(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <HistoryProvider>
      <GameProvider>
        <div className="min-h-screen w-full bg-background/50 backdrop-blur-3xl">
          <GameDashboard />
        </div>
      </GameProvider>
    </HistoryProvider>
  );
}
