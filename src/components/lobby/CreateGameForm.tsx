'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface CreateGameFormProps {
  userUid: string;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onGameCreated: (gameId: string, playerName: string) => void;
}

export default function CreateGameForm({ userUid, playerName, onPlayerNameChange, onGameCreated }: CreateGameFormProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid, playerName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar o jogo');
      }
      
      toast({
        title: 'Jogo Criado!',
        description: `O código da partida é: ${result.gameCode}`,
      });
      onGameCreated(result.gameCode, playerName);

    } catch (error: any) {
      console.error("Error creating game:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar o jogo',
        description: error.message || 'Ocorreu um problema ao tentar criar a partida.',
      });
    } finally {
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
        onChange={(e) => onPlayerNameChange(e.target.value)}
        className="text-center"
      />
      <Button onClick={handleCreateGame} disabled={isLoading || !playerName}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Criar Partida
      </Button>
    </div>
  );
}
