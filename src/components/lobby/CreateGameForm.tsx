'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { initialCards, initialGameState, roleDetails } from '@/lib/game-data';

interface CreateGameFormProps {
  onGameCreated: (gameId: string) => void;
}

export default function CreateGameForm({ onGameCreated }: CreateGameFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome inválido',
        description: 'Por favor, insira seu nome para criar um jogo.',
      });
      return;
    }
    
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar um jogo.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const gameSessionRef = doc(firestore, 'game_sessions', gameCode);

      const randomCard = initialCards[Math.floor(Math.random() * initialCards.length)];
      const roles = Object.keys(roleDetails);
      const randomRole = roles[Math.floor(Math.random() * roles.length)];

      const gameSessionData = {
        ...initialGameState,
        gameCode,
        creatorId: user.uid,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        players: {
          [user.uid]: {
            id: user.uid,
            name: playerName,
            role: randomRole,
            isOpportunist: Math.random() < 0.25, // 25% chance
            capital: 5,
            avatar: '1',
          },
        },
        turn: 1,
        currentPlayerIndex: 0,
        currentCardId: randomCard.id,
        logs: [],
      };

      await setDoc(gameSessionRef, gameSessionData);
      
      toast({
        title: 'Jogo Criado!',
        description: `O código da partida é: ${gameCode}`,
      });
      onGameCreated(gameCode);

    } catch (error: any) {
      console.error("Error creating game:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar o jogo',
        description: error.message || 'Ocorreu um problema ao tentar criar a partida.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center">Criar um Novo Jogo</h2>
       <Input
        type="text"
        placeholder="Seu nome"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="text-center"
      />
      <Button onClick={handleCreateGame} disabled={isLoading || !playerName}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Criar Partida
      </Button>
    </div>
  );
}
