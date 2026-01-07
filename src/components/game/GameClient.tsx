'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { GameSession, Player, Boss } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ResourceDashboard from './ResourceDashboard';
import PlayerDashboard from './PlayerDashboard';
import GameBoard from './GameBoard';
import DecisionCardComponent from './DecisionCard';
import EndGameDialog from './EndGameDialog';
import { initialBosses } from '@/lib/game-data';
import Header from './Header';
import { Loader2, Users, BookOpen, ScrollText } from 'lucide-react';
import LogPanel from './LogPanel';
import { API_BASE_URL } from '@/lib/api';
import { useInterval } from '@/hooks/use-interval';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        const err = await response.json().catch(() => ({error: 'Não foi possível carregar o estado do jogo.'}));
        throw new Error(err.error);
      }
      const data: GameSession = await response.json();
      setGameSession(data);

      if (data.status === 'finished' && !gameOver.isGameOver) {
        let message = data.gameOverMessage || "A partida foi concluída!";
        if (data.end_reason === 'collapsed') {
          message = "Colapso! Um indicador essencial chegou a zero ou a fome atingiu níveis insustentáveis. O país entrou em ruínas.";
        } else if (data.end_reason === 'victory') {
          message = "Vitória Coletiva! A nação prosperou e alcançou a Justiça Social!";
        }
        setGameOver({ isGameOver: true, message: message });
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

  useInterval(fetchGameSession, gameSession?.status === 'finished' ? null : POLLING_INTERVAL);

  useEffect(() => {
    fetchGameSession();
  }, [fetchGameSession]);

  const handleStartGame = async () => {
    if (!gameSession || userUid !== gameSession.creator_user_uid || gameSession.status !== 'waiting') return;

    setIsProcessing(true);
    try {
        const response = await fetch(`${API_BASE_URL}/game/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameCode: gameSession.game_code }),
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Falha ao iniciar a partida.');
        }
        await fetchGameSession(); // Fetch immediately to get the new state with the card
        toast({ title: "A partida começou!", description: "Bom jogo!" });
    } catch (error: any) {
        console.error("Error starting game:", error);
        toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
        setIsProcessing(false);
    }
  };

  const players = useMemo(() => gameSession?.players || [], [gameSession?.players]);
  
  const currentPlayer = useMemo(() => {
    if (!gameSession || !players.length || gameSession.current_player_index === undefined) return null;
    return players.find(p => p.turn_order === gameSession.current_player_index);
  }, [players, gameSession]);
  
  const currentCard = useMemo(() => {
      if (!gameSession || !gameSession.currentCard) return null;
      return gameSession.currentCard;
  }, [gameSession]);

  const handleDecision = useCallback(async (choiceIndex: number) => {
    if (isProcessing || !gameSession || !currentPlayer || userUid !== currentPlayer.user_uid) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/game/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameCode: gameSession.game_code,
          userUid: userUid,
          choice: choiceIndex, // Send the index of the choice
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível processar a decisão.');
      }
      
      await fetchGameSession(); // Poll for new state

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
  
  const currentBoss = useMemo(() => {
    if (!gameSession) return null;
    return initialBosses.find(b => b.position === gameSession.board_position) || null;
  }, [gameSession?.board_position]);

  if (isLoading || !gameSession) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando jogo...</p>
             <p className="mt-4 text-xs text-muted-foreground">Código: {gameCode}</p>
             <Button onClick={onLeave} variant="outline" size="sm" className="mt-4">Sair</Button>
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
  
  const isCurrentPlayerTurn = !!currentPlayer && userUid === currentPlayer.user_uid;
  const isWaiting = gameSession.status === 'waiting';
  const isCreator = userUid === gameSession.creator_user_uid;
  const canStart = isCreator && isWaiting && players.length >= 2;

  const indicators = {
    economy: gameSession.economy,
    education: gameSession.education,
    wellbeing: gameSession.wellbeing,
    popular_support: gameSession.popular_support,
    hunger: gameSession.hunger,
    military_religion: gameSession.military_religion,
  };


  return (
    <div className={cn(
        "flex flex-col h-screen bg-background text-foreground overflow-hidden transition-colors duration-500",
        currentBoss && "boss-battle"
      )}>
      <Header gameCode={gameSession.game_code} />
      <main className="flex-1 container mx-auto px-2 py-2 md:px-4 flex flex-col gap-4 overflow-hidden">
        
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-col flex-1 gap-4 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ResourceDashboard indicators={indicators} />
              <GameBoard boardPosition={gameSession.board_position} bosses={initialBosses} currentBoss={currentBoss} />
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
              <div className="lg:col-span-3 flex flex-col overflow-hidden">
                <PlayerDashboard players={players} currentPlayerId={currentPlayer?.id} />
              </div>
              <div className="lg:col-span-6 flex flex-col overflow-hidden">
                {isWaiting ? (
                     <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg shadow-lg text-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="mt-4 text-muted-foreground">
                            {players.length < 2 ? "Aguardando mais jogadores..." : "Aguardando o anfitrião iniciar a partida..."}
                        </p>
                        <p className="text-sm text-muted-foreground">({players.length} de 4 jogadores)</p>

                        {canStart && (
                            <Button onClick={handleStartGame} disabled={isProcessing} className="mt-6">
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Iniciar Partida
                            </Button>
                        )}
                    </div>
                ) : currentCard && currentPlayer ? (
                    <DecisionCardComponent
                    card={currentCard}
                    onDecision={handleDecision}
                    isProcessing={isProcessing || !isCurrentPlayerTurn}
                    currentPlayer={currentPlayer}
                    />
                ) : (
                     <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg shadow-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="mt-4 text-muted-foreground">Aguardando próxima rodada...</p>
                    </div>
                )}
              </div>
              <div className="lg:col-span-3 flex flex-col overflow-hidden">
                <LogPanel logs={gameSession.logs || []} />
              </div>
            </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
                 {isWaiting ? (
                     <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg shadow-lg text-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="mt-4 text-muted-foreground">
                            {players.length < 2 ? "Aguardando mais jogadores..." : "Aguardando o anfitrião iniciar a partida..."}
                        </p>
                        <p className="text-sm text-muted-foreground">({players.length} de 4 jogadores)</p>

                        {canStart && (
                            <Button onClick={handleStartGame} disabled={isProcessing} className="mt-6">
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Iniciar Partida
                            </Button>
                        )}
                    </div>
                ) : currentCard && currentPlayer ? (
                    <DecisionCardComponent
                    card={currentCard}
                    onDecision={handleDecision}
                    isProcessing={isProcessing || !isCurrentPlayerTurn}
                    currentPlayer={currentPlayer}
                    />
                ) : (
                     <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg shadow-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="mt-4 text-muted-foreground">Aguardando próxima rodada...</p>
                    </div>
                )}
            </div>

            <Tabs defaultValue="players" className="w-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="players"><Users className="w-4 h-4 mr-1"/> Gabinete</TabsTrigger>
                <TabsTrigger value="nation"><BookOpen className="w-4 h-4 mr-1"/> Nação</TabsTrigger>
                <TabsTrigger value="logs"><ScrollText className="w-4 h-4 mr-1"/> Diário</TabsTrigger>
              </TabsList>
              <TabsContent value="players" className="flex-1 overflow-auto mt-2">
                <PlayerDashboard players={players} currentPlayerId={currentPlayer?.id} />
              </TabsContent>
              <TabsContent value="nation" className="flex-1 overflow-auto mt-2 space-y-4">
                <ResourceDashboard indicators={indicators} />
                <GameBoard boardPosition={gameSession.board_position} bosses={initialBosses} currentBoss={currentBoss} />
              </TabsContent>
              <TabsContent value="logs" className="flex-1 overflow-auto mt-2">
                 <LogPanel logs={gameSession.logs || []} />
              </TabsContent>
            </Tabs>
        </div>


      </main>
      <EndGameDialog
        isOpen={gameOver.isGameOver}
        message={gameOver.message}
        onLeave={onLeave}
      />
    </div>
  );
}
