'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
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

    let unsubscribe: Unsubscribe | null = null;
    let hasJoined = false; // Flag to prevent multiple join attempts

    const timeout = setTimeout(() => {
        if(unsubscribe) unsubscribe();
        if (!hasJoined) {
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Erro ao entrar na partida',
                description: 'A partida não foi encontrada. Verifique o código e tente novamente.',
            });
        }
    }, 10000); // 10 second timeout

    unsubscribe = onSnapshot(gameSessionRef, async (docSnap) => {
        if (hasJoined) { // If already joined, do nothing.
          if(unsubscribe) unsubscribe();
          clearTimeout(timeout);
          return;
        }

        if (docSnap.exists()) {
            clearTimeout(timeout);
            
            const gameData = docSnap.data() as GameSession;
            const currentPlayers = gameData.players || {};

            if (Object.keys(currentPlayers).length >= 4 && !currentPlayers[user.uid]) {
                setIsLoading(false);
                toast({ variant: "destructive", title: "Partida Cheia", description: "Esta partida já atingiu o número máximo de jogadores." });
                if (unsubscribe) unsubscribe();
                return;
            }

            if (gameData.status !== 'waiting' && !currentPlayers[user.uid]) {
                setIsLoading(false);
                toast({ variant: "destructive", title: "Partida em Andamento", description: "Esta partida já começou." });
                if (unsubscribe) unsubscribe();
                return;
            }

            let updatedPlayers = { ...currentPlayers };

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
                updatedPlayers[user.uid] = newPlayer;
            }

            try {
                await updateDoc(gameSessionRef, {
                    players: updatedPlayers
                });
                hasJoined = true;
                toast({ title: 'Você entrou no jogo!', description: `Bem-vindo à partida ${gameData.gameCode}.` });
                onGameJoined(upperCaseGameCode);
            } catch(e: any) {
                 console.error("Error joining game on update:", e);
                 setIsLoading(false);
                 toast({
                    variant: 'destructive',
                    title: 'Erro ao entrar na partida',
                    description: e.message || 'Não foi possível entrar na partida.',
                 });
            } finally {
               if (unsubscribe) unsubscribe();
            }

        }
    }, (error) => {
        console.error("Error with onSnapshot:", error);
        clearTimeout(timeout);
        if(unsubscribe) unsubscribe();
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Erro de Conexão",
            description: "Não foi possível se conectar à partida. Verifique sua conexão e tente novamente.",
        });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-center">Entrar em um Jogo</h2>
       <Input
        type="text"
        placeholder="Seu nome (será usado na partida)"
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
