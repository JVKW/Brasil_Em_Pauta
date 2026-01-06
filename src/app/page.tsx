'use client';

import { useState } from 'react';
import GameLobby from '@/components/lobby/GameLobby';
import GameClient from '@/components/game/GameClient';
import { FirebaseClientProvider } from '@/firebase';

export default function Home() {
  const [gameId, setGameId] = useState<string | null>(null);

  const handleLeaveGame = () => {
    setGameId(null);
  };

  if (!gameId) {
    return (
      <FirebaseClientProvider>
        <GameLobby onGameJoined={setGameId} />
      </FirebaseClientProvider>
    );
  }

  return (
    <FirebaseClientProvider>
      <GameClient gameId={gameId} />
    </FirebaseClientProvider>
  );
}
