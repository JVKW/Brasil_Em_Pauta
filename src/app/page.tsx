'use client';

import { useState, useEffect } from 'react';
import GameLobby from '@/components/lobby/GameLobby';
import GameClient from '@/components/game/GameClient';

// Helper to get or create a user UID
const getOrCreateUserUid = (): string => {
  let userUid = localStorage.getItem('userUid');
  if (!userUid) {
    userUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('userUid', userUid);
  }
  return userUid;
};


export default function Home() {
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  useEffect(() => {
    const uid = getOrCreateUserUid();
    setUserUid(uid);
    // Attempt to get a saved player name
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const handleGameJoined = (code: string, name: string) => {
    setPlayerName(name);
    setGameCode(code);
    localStorage.setItem('playerName', name);
  };

  const handleLeaveGame = () => {
    setGameCode(null);
  };
  
  if (!userUid) {
    return <div>Carregando...</div>;
  }

  if (!gameCode) {
    return (
        <GameLobby onGameJoined={handleGameJoined} userUid={userUid} defaultPlayerName={playerName} />
    );
  }

  return (
      <GameClient gameCode={gameCode} userUid={userUid} onLeave={handleLeaveGame} />
  );
}
