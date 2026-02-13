import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';

export function PlayerManager({ onClose }: { onClose: () => void }) {
  const { registeredPlayers, addPlayer, updatePlayer, deletePlayer } = usePlayer();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addPlayer(newName);
      setNewName('');
    }
  };

  const startEdit = (player: { id: string, name: string }) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updatePlayer(editingId, editName);
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <Card className="w-full h-full sm:h-auto sm:max-w-md glass-panel border-0 sm:border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col rounded-none sm:rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl">プレイヤー管理</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-2 items-end shrink-0">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="new-player" className="text-sm font-medium">新規プレイヤー登録</Label>
              <Input 
                id="new-player" 
                placeholder="名前を入力..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="h-12 text-lg"
              />
            </div>
            <Button onClick={handleAdd} disabled={!newName.trim()} className="h-12 px-4">
              <Plus className="w-5 h-5 mr-2" />
              追加
            </Button>
          </div>

          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <Label className="text-sm font-medium">登録済みプレイヤー ({registeredPlayers.length})</Label>
            <ScrollArea className="flex-1 rounded-md border p-2 bg-muted/20">
              {registeredPlayers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  登録されたプレイヤーはいません。<br />
                  よく遊ぶメンバーを登録しておくと便利です。
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {registeredPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 rounded-md bg-background/50 border hover:bg-background/80 transition-colors">
                      {editingId === player.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-10 text-base"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-green-600" onClick={saveEdit}>
                            <Save className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground" onClick={cancelEdit}>
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium truncate flex-1 text-base">{player.name}</span>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-primary" onClick={() => startEdit(player)}>
                              <Edit2 className="w-5 h-5" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[90vw] max-w-md rounded-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>プレイヤーを削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    「{player.name}」をリストから削除します。<br />
                                    ※過去の戦績データには影響しません。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                                  <AlertDialogCancel className="w-full sm:w-auto mt-0">キャンセル</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deletePlayer(player.id)} className="bg-destructive text-destructive-foreground w-full sm:w-auto">
                                    削除する
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
