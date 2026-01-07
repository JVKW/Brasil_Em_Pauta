'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { GameSession, Player, DecisionOption } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ResourceDashboard from './ResourceDashboard';
import PlayerDashboard from './PlayerDashboard';
import GameBoard from './GameBoard';
import DecisionCardComponent from './DecisionCard';
import EndGameDialog from './EndGameDialog';
import { initialBosses } from '@/lib/game-data';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import LogPanel from './LogPanel';
import { API_BASE_URL } from '@/lib/api';
import { useInterval } from '@/hooks/use-interval';
import { Button } from '../ui/button';


type GameClientProps = {
  gameCode: string;
  userUid: string;
  onLeave: () => void;
};

const POLLING_INTERVAL = 2000; // 2 seconds

export default function GameClient({ gameCode, userUid, onLeave }: GameClientProps) {
  const { toast } = useToast();
  
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState({ isGameOver: false, message: '' });

  const fetchGameSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/game/${gameCode}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Não foi possível carregar o estado do jogo.');
      }
      const data: GameSession = await response.json();
      setGameSession(data);

      if(data.status === 'finished' && !gameOver.isGameOver) {
        setGameOver({ isGameOver: true, message: data.gameOverMessage || "A partida foi concluída!" });
      }

    } catch (e: any) {
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Erro de Conexão',
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [gameCode, toast, gameOver.isGameOver]);

  useInterval(fetchGameSession, POLLING_INTERVAL);

  useEffect(() => {
    fetchGameSession();
  }, [fetchGameSession]);

  useEffect(() => {
    if (gameSession && gameSession.status === 'waiting' && gameSession.players.length === 4) {
      const startGame = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/game/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameCode: gameSession.game_code }),
          });
          if (!response.ok) {
            throw new Error('Falha ao iniciar a partida.');
          }
          await fetchGameSession();
          toast({ title: "A partida começou!", description: "A sala está cheia. Bom jogo!" });
        } catch (error: any) {
          console.error("Error starting game:", error);
          toast({ variant: 'destructive', title: 'Erro', description: error.message });
        }
      };
      
      if (userUid === gameSession.creator_user_uid) {
        startGame();
      }
    }
  }, [gameSession, userUid, fetchGameSession, toast]);


  const players = useMemo(() => gameSession?.players || [], [gameSession?.players]);
  const currentPlayer = useMemo(() => {
    if (!gameSession || !players.length) return null;
    return players[gameSession.current_player_index];
  }, [players, gameSession]);
  
  const currentCard = useMemo(() => {
      if (!gameSession || !gameSession.currentCard) return null;
      return gameSession.currentCard;
  }, [gameSession]);

  const handleRestart = async () => {
    if (!gameSession) return;
    setIsProcessing(true);
    try {
        const response = await fetch(`${API_BASE_URL}/game/restart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameCode: gameSession.game_code, userUid }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Falha ao reiniciar');
        
        await fetchGameSession();
        setGameOver({ isGameOver: false, message: '' });
        toast({ title: "Jogo Reiniciado", description: "Uma nova partida começou." });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Erro", description: e.message });
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleDecision = useCallback(async (option: DecisionOption) => {
    if (isProcessing || !gameSession || !currentPlayer || userUid !== currentPlayer.user_uid) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/game/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameCode: gameSession.game_code,
          userUid: userUid,
          choice: option.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível processar a decisão.');
      }
      
      await fetchGameSession();

    } catch (e: any) {
        console.error("Failed to process decision:", e);
        toast({
            variant: "destructive",
            title: "Erro de Jogada",
            description: e.message || "Não foi possível salvar sua jogada.",
        });
    } finally {
       setIsProcessing(false);
    }
  }, [gameSession, currentPlayer, isProcessing, toast, userUid, fetchGameSession]);
  

  if (isLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando jogo...</p>
        </div>
    );
  }

  if (error) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-background text-red-500">
              <p>Erro ao carregar o jogo: {error}</p>
              <Button onClick={onLeave} className="mt-4">Voltar ao Lobby</Button>
          </div>
      );
  }
  
  // This is the key change. If gameSession hasn't been fetched yet, show a loading state.
  if (!gameSession) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Aguardando dados da partida...</p>
             <p className="mt-4 text-xs text-muted-foreground">Código: {gameCode}</p>
             <Button onClick={onLeave} variant="outline" size="sm" className="mt-4">Sair</Button>
        </div>
    );
  }

  const isCurrentPlayerTurn = !!currentPlayer && userUid === currentPlayer.user_uid;
  const isWaiting = gameSession.status === 'waiting';

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header onRestart={handleRestart} gameCode={gameSession.game_code} />
      <main className="flex-1 container mx-auto px-4 py-2 flex flex-col gap-2 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <ResourceDashboard indicators={gameSession} />
          <GameBoard boardPosition={gameSession.board_position} bosses={initialBosses} />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden min-h-0">
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <PlayerDashboard players={players} currentPlayerId={currentPlayer?.id} />
          </div>
          <div className="lg:col-span-6 flex flex-col overflow-hidden">
            {!isWaiting && currentCard && currentPlayer ? (
                <DecisionCardComponent
                card={currentCard}
                onDecision={handleDecision}
                isProcessing={isProcessing || !isCurrentPlayerTurn}
                currentPlayer={currentPlayer}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg shadow-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p className="mt-4 text-muted-foreground">
                        {isWaiting ? "Aguardando mais jogadores..." : "Aguardando próxima rodada..."}
                    </p>
                    <p className="text-sm text-muted-foreground">({players.length} de 4 jogadores)</p>
                </div>
            )}
          </div>
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <LogPanel logs={gameSession.logs || []} />
          </div>
        </div>
      </main>
      <EndGameDialog
        isOpen={gameOver.isGameOver}
        message={gameOver.message}
        onRestart={handleRestart}
      />
    </div>
  );
}

    