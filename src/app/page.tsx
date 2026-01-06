'use client';

import { useState } from 'react';
import GameLobby from '@/components/lobby/GameLobby';
import GameClient from '@/components/game/GameClient';
import { FirebaseClientProvider } from '@/firebase';
import { initialPlayers, initialCards, initialBosses, initialGameState } from '@/lib/game-data';

export default function Home() {
  const [gameId, setGameId] = useState<string | null>(null);

  if (!gameId) {
    return (
      <FirebaseClientProvider>
        <GameLobby onGameJoined={setGameId} />
      </FirebaseClientProvider>
    );
  }

  return (
    <FirebaseClientProvider>
      <GameClient
        gameId={gameId}
        initialPlayers={initialPlayers}
        initialCards={initialCards}
        initialBosses={initialBosses}
        initialGameState={initialGameState}
      />
    </FirebaseClientProvider>
  );
}
