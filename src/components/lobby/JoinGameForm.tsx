'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface JoinGameFormProps {
  userUid: string;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onGameJoined: (gameId: string, playerName: string) => void;
}

export default function JoinGameForm({ userUid, playerName, onPlayerNameChange, onGameJoined }: JoinGameFormProps) {
  const [gameCode, setGameCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    
    setIsLoading(true);
    const upperCaseGameCode = gameCode.toUpperCase();

    try {
      const response = await fetch(`${API_BASE_URL}/game/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode: upperCaseGameCode, userUid, playerName }),
      });
      
      if (!response.ok) {
        let errorMessage = "Falha ao entrar na partida.";
        try {
            const result = await response.json();
            errorMessage = result.error || `Erro ${response.status}.`;
        } catch (e) {
            errorMessage = `Ocorreu um erro (${response.status}).`;
        }

        if (response.status === 404) {
            errorMessage = "Partida não encontrada. Verifique o código e tente novamente.";
        } else if (response.status === 403 || response.status === 409 || response.status === 400) {
             errorMessage = "Não foi possível entrar. A sala pode estar cheia ou o jogo já começou.";
        }

        throw new Error(errorMessage);
      }
      
      const result = await response.json();

      toast({ title: 'Você entrou no jogo!', description: `Bem-vindo à partida ${upperCaseGameCode}.` });
      onGameJoined(upperCaseGameCode, playerName);

    } catch (error: any) {
      console.error("Error joining game:", error);
      toast({
            variant: 'destructive',
            title: 'Erro ao entrar na partida',
            description: error.message,
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
        placeholder="Seu nome (será usado na partida)"
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
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
