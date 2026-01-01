import GameClient from '@/components/game/GameClient';
import { initialPlayers, initialCards, initialBosses, initialGameState } from '@/lib/game-data';

export default function Home() {
  return (
    <GameClient 
      initialPlayers={initialPlayers}
      initialCards={initialCards}
      initialBosses={initialBosses}
      initialGameState={initialGameState}
    />
  );
}
