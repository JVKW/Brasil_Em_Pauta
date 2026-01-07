'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { GameSession, Player, DecisionCard, DecisionOption } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ResourceDashboard from './ResourceDashboard';
import PlayerDashboard from './PlayerDashboard';
import GameBoard from './GameBoard';
import DecisionCardComponent from './DecisionCard';
import EndGameDialog from './EndGameDialog';
import { roleDetails, initialCards, initialBosses } from '@/lib/game-data';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import LogPanel from './LogPanel';
import { API_BASE_URL } from '@/lib/api';
import { useInterval } from '@/hooks/use-interval';
import { checkWinConditionsAction } from '@/app/actions';

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
        // This part can be improved by having a specific endpoint or message for the game over reason.
        // For now, we use a generic message.
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

  // Use the custom interval hook for polling
  useInterval(fetchGameSession, POLLING_INTERVAL);

  // Initial fetch
  useEffect(() => {
    fetchGameSession();
  }, [fetchGameSession]);


  const players = useMemo(() => gameSession?.players || [], [gameSession?.players]);
  const currentPlayer = useMemo(() => {
    if (!gameSession || !players.length) return null;
    return players[gameSession.current_player_index];
  }, [players, gameSession]);
  
  const currentCard = useMemo(() => {
      if (!gameSession || !gameSession.current_card) return null;
      // The API provides the full card object, so we just use it.
      return gameSession.current_card;
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
        
        await fetchGameSession(); // fetch latest state
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
          choice: option.id, // Assuming option.id corresponds to 'ethical' or 'corrupt' etc.
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível processar a decisão.');
      }
      
      // The decision was successful, the poller will pick up the new state.
      // We can optionally trigger an immediate fetch.
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
  
  if (!gameSession || !currentPlayer || !currentCard) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Aguardando dados da partida...</p>
        </div>
    );
  }

  const isCurrentPlayerTurn = userUid === currentPlayer.user_uid;
  const indicators = gameSession.nation_state;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header onRestart={handleRestart} gameCode={gameSession.game_code} />
      <main className="flex-1 container mx-auto px-4 py-2 flex flex-col gap-2 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <ResourceDashboard indicators={indicators} />
          <GameBoard boardPosition={indicators.board_position} bosses={initialBosses} />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden min-h-0">
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <PlayerDashboard players={players} currentPlayerId={currentPlayer.id} />
          </div>
          <div className="lg:col-span-6 flex flex-col overflow-hidden">
            <DecisionCardComponent
              card={currentCard}
              onDecision={handleDecision}
              isProcessing={isProcessing || !isCurrentPlayerTurn || gameSession.status !== 'in_progress'}
              currentPlayer={currentPlayer}
            />
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
