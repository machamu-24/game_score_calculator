import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RegisteredPlayer } from '@/lib/types';
import { nanoid } from 'nanoid';

interface PlayerContextType {
  registeredPlayers: RegisteredPlayer[];
  addPlayer: (name: string, color?: string) => void;
  updatePlayer: (id: string, name: string, color?: string) => void;
  deletePlayer: (id: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('registered_players');
    if (saved) {
      try {
        setRegisteredPlayers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse registered players', e);
      }
    }
  }, []);

  // Save to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem('registered_players', JSON.stringify(registeredPlayers));
  }, [registeredPlayers]);

  const addPlayer = (name: string, color?: string) => {
    if (!name.trim()) return;
    const newPlayer: RegisteredPlayer = {
      id: nanoid(),
      name: name.trim(),
      color,
      createdAt: Date.now(),
    };
    setRegisteredPlayers(prev => [...prev, newPlayer]);
  };

  const updatePlayer = (id: string, name: string, color?: string) => {
    setRegisteredPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, name: name.trim(), color } : p
    ));
  };

  const deletePlayer = (id: string) => {
    setRegisteredPlayers(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PlayerContext.Provider value={{ registeredPlayers, addPlayer, updatePlayer, deletePlayer }}>
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
