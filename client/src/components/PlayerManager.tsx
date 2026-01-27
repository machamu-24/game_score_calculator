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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-panel border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl">プレイヤー管理</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-2 items-end">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="new-player">新規プレイヤー登録</Label>
              <Input 
                id="new-player" 
                placeholder="名前を入力..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} disabled={!newName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              追加
            </Button>
          </div>

          <div className="space-y-2">
            <Label>登録済みプレイヤー ({registeredPlayers.length})</Label>
            <ScrollArea className="h-[300px] rounded-md border p-2 bg-muted/20">
              {registeredPlayers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  登録されたプレイヤーはいません。<br />
                  よく遊ぶメンバーを登録しておくと便利です。
                </div>
              ) : (
                <div className="space-y-2">
                  {registeredPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-background/50 border hover:bg-background/80 transition-colors">
                      {editingId === player.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveEdit}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={cancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium truncate flex-1">{player.name}</span>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEdit(player)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>プレイヤーを削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    「{player.name}」をリストから削除します。<br />
                                    ※過去の戦績データには影響しません。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deletePlayer(player.id)} className="bg-destructive text-destructive-foreground">
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
