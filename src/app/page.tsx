'use client';

import { useState, useEffect } from 'react';
import GameLobby from '@/components/lobby/GameLobby';
import GameClient from '@/components/game/GameClient';

// Helper to generate a unique user UID for the session
const generateSessionUserUid = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};


export default function Home() {
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  useEffect(() => {
    // Generate a unique UID for this specific session instance.
    // This ensures every open tab/window has its own identity.
    const uid = generateSessionUserUid();
    setUserUid(uid);

    // Attempt to get a saved player name for convenience, but not the UID.
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const handleGameJoined = (code: string, name: string) => {
    setPlayerName(name);
    setGameCode(code);
    // Persist player name for convenience across sessions.
    localStorage.setItem('playerName', name);
  };

  const handleLeaveGame = () => {
    setGameCode(null);
    // Optional: could regenerate userUid here if needed, but reloading the page
    // will have the same effect.
  };
  
  if (!userUid) {
    // This state is very brief, happens before useEffect runs.
    return <div>Gerando sessão de jogador...</div>;
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
