'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface CreateGameFormProps {
  onGameCreated: (gameId: string) => void;
}

export default function CreateGameForm({ onGameCreated }: CreateGameFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleCreateGame = async () => {
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

      const gameSessionData = {
        gameCode,
        creatorId: user.uid,
        status: 'waiting',
        createdAt: serverTimestamp(),
        players: {
          [user.uid]: {
            name: user.displayName || 'Anônimo',
            role: 'economyManager', // Default role, can be changed in lobby
            isOpportunist: Math.random() < 0.25, // 25% chance
            capital: 5,
            avatar: '1',
          },
        },
      };

      setDocumentNonBlocking(gameSessionRef, gameSessionData, { merge: false });
      
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
      <Button onClick={handleCreateGame} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Criar Partida
      </Button>
    </div>
  );
}
