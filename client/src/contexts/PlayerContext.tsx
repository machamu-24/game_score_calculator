import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { RegisteredPlayer } from '@/lib/types';
import { nanoid } from 'nanoid';
import { trpc } from '@/lib/trpc';

interface PlayerContextType {
  registeredPlayers: RegisteredPlayer[];
  isLoading: boolean;
  addPlayer: (name: string, color?: string) => Promise<void>;
  updatePlayer: (id: string, name: string, color?: string) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  
  // プレイヤーリストを取得
  const { data: registeredPlayers = [], isLoading } = trpc.players.list.useQuery();

  // プレイヤー追加
  const createMutation = trpc.players.create.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
    },
  });

  // プレイヤー更新
  const updateMutation = trpc.players.update.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
    },
  });

  // プレイヤー削除
  const deleteMutation = trpc.players.delete.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
    },
  });

  const addPlayer = async (name: string, color?: string) => {
    if (!name.trim()) return;
    await createMutation.mutateAsync({
      id: nanoid(),
      name: name.trim(),
      color,
      createdAt: Date.now(),
    });
  };

  const updatePlayer = async (id: string, name: string, color?: string) => {
    await updateMutation.mutateAsync({
      id,
      name: name.trim(),
      color,
    });
  };

  const deletePlayer = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  // localStorageからのマイグレーション（初回のみ）
  // TODO: マイグレーション機能は後で実装
  // const hasMigrated = useRef(false);
  // 
  // useEffect(() => {
  //   if (isLoading || hasMigrated.current) return;
  //
  //   const migrateFromLocalStorage = async () => {
  //     try {
  //       const saved = localStorage.getItem('registered_players');
  //       if (!saved) {
  //         hasMigrated.current = true;
  //         return;
  //       }
  //
  //       const localPlayers: RegisteredPlayer[] = JSON.parse(saved);
  //       if (localPlayers.length === 0) {
  //         hasMigrated.current = true;
  //         return;
  //       }
  //
  //       // ローカルのプレイヤーをサーバーに移行
  //       for (const player of localPlayers) {
  //         await createMutation.mutateAsync(player);
  //       }
  //
  //       // 移行完了後、localStorageをクリア
  //       localStorage.removeItem('registered_players');
  //       hasMigrated.current = true;
  //       console.log('Migrated players from localStorage to database');
  //     } catch (e) {
  //       console.error('Failed to migrate players from localStorage', e);
  //       hasMigrated.current = true;
  //     }
  //   };
  //
  //   migrateFromLocalStorage();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLoading]);

  return (
    <PlayerContext.Provider value={{ 
      registeredPlayers, 
      isLoading,
      addPlayer, 
      updatePlayer, 
      deletePlayer 
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
