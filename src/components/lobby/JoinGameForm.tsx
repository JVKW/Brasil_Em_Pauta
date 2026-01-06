'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { GameSession, Player } from '@/lib/types';
import { roleDetails } from '@/lib/game-data';

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
    const upperCaseGameCode = gameCode.toUpperCase();
    const gameSessionRef = doc(firestore, 'game_sessions', upperCaseGameCode);

    try {
      const gameDoc = await getDoc(gameSessionRef);

      if (!gameDoc.exists()) {
        throw new Error("Partida não encontrada. Verifique o código.");
      }

      const gameData = gameDoc.data() as GameSession;
      
      const currentPlayers = gameData.players || {};

      if (Object.keys(currentPlayers).length >= 4 && !currentPlayers[user.uid]) {
          throw new Error("Esta partida já está cheia.");
      }

      // Only add the player if they are not already in the game
      if (!currentPlayers[user.uid]) {
        const availableRoles = Object.keys(roleDetails).filter(
          (role) => !Object.values(currentPlayers).some((p: Player) => p.role === role)
        );
        
        const newPlayerRole = availableRoles.length > 0 
          ? availableRoles[Math.floor(Math.random() * availableRoles.length)] 
          : 'influencer';
        
        const newPlayer: Player = {
          id: user.uid,
          name: playerName,
          role: newPlayerRole,
          isOpportunist: Math.random() < 0.25,
          capital: 5,
          avatar: `${Object.keys(currentPlayers).length + 1}`,
        };
        
        // This is the correct, robust way to update the nested object.
        const updatedPlayers = {
          ...currentPlayers,
          [user.uid]: newPlayer
        };
        
        await updateDoc(gameSessionRef, {
          players: updatedPlayers
        });

        toast({
          title: 'Você entrou no jogo!',
          description: `Bem-vindo à partida ${upperCaseGameCode}.`,
        });
      } else {
        toast({
          title: 'Você já está no jogo!',
          description: `Reconectando à partida ${upperCaseGameCode}.`,
        });
      }

      onGameJoined(upperCaseGameCode);

    } catch (error: any) {
      console.error("Error joining game:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar na partida',
        description: error.message || 'Não foi possível se conectar. Tente novamente.',
      });
    } finally {
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
