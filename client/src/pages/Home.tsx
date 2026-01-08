import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameProvider, useGame } from "@/contexts/GameContext";
import { GameSetup } from "@/components/GameSetup";
import { ScoreTable } from "@/components/ScoreTable";
import { ScoreChart } from "@/components/ScoreChart";
import { ScoreInput } from "@/components/ScoreInput";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Plus, RefreshCw } from "lucide-react";
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

  if (!session) {
    return <GameSetup />;
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Game Score Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Session started at {new Date(session.startedAt).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          <SettingsDialog />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-panel">
              <AlertDialogHeader>
                <AlertDialogTitle>End Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all current game data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  End Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={() => setIsInputOpen(true)} className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Add Game
          </Button>
        </div>
      </header>

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
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <div className="min-h-screen w-full bg-background/50 backdrop-blur-3xl">
        <GameDashboard />
      </div>
    </GameProvider>
  );
}
