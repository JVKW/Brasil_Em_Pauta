'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { GameSession } from '@/lib/types';

interface JoinGameFormProps {
  onGameJoined: (gameId: string) => void;
}

export default function JoinGameForm({ onGameJoined }: JoinGameFormProps) {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      toast({ variant: 'destructive', title: 'Código inválido', description: 'Por favor, insira um código de partida.' });
      return;
    }
     if (!playerName.trim()) {
      toast({ variant: 'destructive', title: 'Nome inválido', description: 'Por favor, insira seu nome para entrar.' });
      return;
    }

    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Erro de autenticação', description: 'Você precisa estar logado para entrar em um jogo.' });
      return;
    }
    
    setIsLoading(true);
    const gameSessionRef = doc(firestore, 'game_sessions', gameCode.toUpperCase());

    try {
      const gameDoc = await getDoc(gameSessionRef);

      if (!gameDoc.exists()) {
        throw new Error("Partida não encontrada. Verifique o código.");
      }

      const gameData = gameDoc.data() as GameSession;
      const players = gameData.players || {};

      if (Object.keys(players).length >= 4) {
          throw new Error("Esta partida já está cheia.");
      }

      // Add player if not already in the game
      if (!players[user.uid]) {
        const newPlayer = {
          id: user.uid,
          name: playerName,
          role: 'influencer', // TODO: Allow role selection
          isOpportunist: Math.random() < 0.25,
          capital: 5,
          avatar: `${Object.keys(players).length + 1}`,
        };
        await updateDoc(gameSessionRef, {
          [`players.${user.uid}`]: newPlayer
        });
      }
      
      toast({
        title: 'Você entrou no jogo!',
        description: `Bem-vindo à partida ${gameCode.toUpperCase()}.`,
      });

      onGameJoined(gameCode.toUpperCase());

    } catch (error: any) {
      console.error("Error joining game:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar na partida',
        description: error.message || 'Não foi possível se conectar. Tente novamente.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center">Entrar em um Jogo</h2>
       <Input
        type="text"
        placeholder="Seu nome"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="text-center"
      />
      <Input
        type="text"
        placeholder="Insira o código da partida"
        value={gameCode}
        onChange={(e) => setGameCode(e.target.value)}
        className="text-center tracking-widest uppercase"
        maxLength={6}
      />
      <Button onClick={handleJoinGame} disabled={isLoading || !gameCode || !playerName}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Entrar na Partida
      </Button>
    </div>
  );
}
