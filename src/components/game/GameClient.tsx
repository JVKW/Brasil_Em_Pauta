'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { GameSession, Player, DecisionCard, Boss, DecisionOption, LogEntry } from '@/lib/types';
import { checkWinConditionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import ResourceDashboard from './ResourceDashboard';
import PlayerDashboard from './PlayerDashboard';
import GameBoard from './GameBoard';
import DecisionCardComponent from './DecisionCard';
import EndGameDialog from './EndGameDialog';
import { roleDetails, indicatorDetails, initialCards, initialBosses, initialGameState } from '@/lib/game-data';
import Header from './Header';
import { Crown, Swords, Loader2 } from 'lucide-react';
import LogPanel from './LogPanel';

type GameClientProps = {
  gameId: string;
};

const getRandomCard = (cards: DecisionCard[], currentCardId?: string): DecisionCard => {
  const availableCards = cards.filter(c => c.id !== currentCardId);
  if (availableCards.length === 0) {
    return cards[0];
  }
  return availableCards[Math.floor(Math.random() * availableCards.length)];
};


export default function GameClient({ gameId }: GameClientProps) {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const gameSessionRef = useMemoFirebase(() => firestore ? doc(firestore, 'game_sessions', gameId) : null, [firestore, gameId]);
  const { data: gameSession, isLoading: isGameLoading, error: gameError } = useDoc<GameSession>(gameSessionRef);
  
  const [gameOver, setGameOver] = useState({ isGameOver: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);


  const players = useMemo(() => gameSession?.players ? Object.values(gameSession.players) : [], [gameSession?.players]);
  const currentPlayer = useMemo(() => {
    if (!gameSession || players.length === 0) return null;
    return players[gameSession.currentPlayerIndex];
  }, [players, gameSession]);
  
  const currentCard = useMemo(() => {
     if(!gameSession?.currentCardId) return null;
     return initialCards.find(c => c.id === gameSession.currentCardId);
  }, [gameSession?.currentCardId])


  const handleRestart = async () => {
    if (!firestore || !gameSessionRef) return;
    
    // Get the first player (creator) to preserve them
    const creatorId = gameSession?.creatorId;
    const originalPlayers = gameSession?.players;
    let playersToKeep = {};
    if(creatorId && originalPlayers && originalPlayers[creatorId]) {
      playersToKeep = {
        [creatorId]: originalPlayers[creatorId]
      }
    }

    const randomCard = getRandomCard(initialCards);
    await updateDoc(gameSessionRef, {
        ...initialGameState,
        status: 'waiting',
        players: playersToKeep, // Reset to only the creator or empty
        turn: 1,
        currentPlayerIndex: 0,
        currentCardId: randomCard.id,
        logs: [],
    });
    setGameOver({ isGameOver: false, message: '' });
    toast({ title: "Jogo Reiniciado", description: "Uma nova partida começou." });
  };
  
  const handleDecision = useCallback(async (option: DecisionOption) => {
    if (isProcessing || !gameSession || !currentPlayer || !firestore || !gameSessionRef) return;
    setIsProcessing(true);

    let newGameState = JSON.parse(JSON.stringify(gameSession));
    const playerToUpdate = newGameState.players[currentPlayer.id];
    const playerRole = playerToUpdate.role;
    
    let boardChange = 0;
    const effectsDescriptions: string[] = [];

    option.effects.forEach(effect => {
      let valueChange: number | undefined;
      let indicatorName: string | undefined;

      if ('indicator' in effect) {
        let change = effect.change;
        if (playerRole === 'ministerOfEducation' && effect.indicator === 'education' && change > 0) change *= 2;
        if (playerRole === 'influencer' && effect.indicator === 'popularSupport') change *= 2;
        if (playerRole === 'agriculture' && effect.indicator === 'hunger' && change < 0) change *= 2;
        if (playerRole === 'religious' && (effect.indicator === 'wellBeing' || effect.indicator === 'popularSupport') && change > 0) change = Math.ceil(change * 1.5);

        if (playerRole === 'militaryCommander' && change < 0) {
            change = Math.floor(change / 2);
        }

        newGameState.indicators[effect.indicator] += change;
        if(effect.indicator !== 'hunger') {
            newGameState.indicators[effect.indicator] = Math.max(0, Math.min(10, newGameState.indicators[effect.indicator]));
        } else {
             newGameState.indicators[effect.indicator] = Math.max(0, newGameState.indicators[effect.indicator]);
        }
        valueChange = change;
        indicatorName = indicatorDetails[effect.indicator].name;

      } else if ('capital' in effect) {
        let change = effect.change;
        if(playerRole === 'economyManager' && change > 0) change = Math.ceil(change * 1.5);
        playerToUpdate.capital += change;
        valueChange = change;
        indicatorName = 'Capital';

      } else if ('board' in effect) {
        boardChange += effect.change;
        valueChange = effect.change;
        indicatorName = 'Progresso';
      }

      if(indicatorName && valueChange !== undefined) {
        effectsDescriptions.push(`${indicatorName} ${valueChange > 0 ? '+' : ''}${valueChange}`);
      }
    });
    
    const newLogEntry: Omit<LogEntry, 'id'> = {
        turn: newGameState.turn,
        playerName: currentPlayer.name,
        playerRole: roleDetails[currentPlayer.role].name,
        decision: option.name,
        effects: effectsDescriptions.join(', ') || "Nenhum efeito."
    };
    newGameState.logs.unshift({ ...newLogEntry, id: Date.now() + Math.random() });


    newGameState.boardPosition = Math.min(20, newGameState.boardPosition + boardChange);

    const bossOnCurrentTile = initialBosses.find(b => b.position === newGameState.boardPosition);
    if (bossOnCurrentTile && boardChange > 0) {
      if (newGameState.indicators[bossOnCurrentTile.requirement.indicator] < bossOnCurrentTile.requirement.level) {
        newGameState.boardPosition = Math.max(1, newGameState.boardPosition - 1);
        toast({
          variant: "destructive",
          title: "Progresso Bloqueado!",
          description: `O progresso da nação foi barrado por "${bossOnCurrentTile.name}". O indicador de ${indicatorDetails[bossOnCurrentTile.requirement.indicator].name} precisa ser no mínimo ${bossOnCurrentTile.requirement.level}.`,
          icon: <Swords className="h-6 w-6 text-destructive-foreground" />,
        });
        newGameState.logs.unshift({
            id: Date.now() + Math.random(),
            turn: newGameState.turn,
            playerName: "Sistema",
            playerRole: "Chefe",
            decision: `Falha ao enfrentar ${bossOnCurrentTile.name}`,
            effects: "Progresso da nação regrediu."
        });

      } else {
        toast({
          title: "Desafio Superado!",
          description: `A nação venceu o desafio "${bossOnCurrentTile.name}"!`,
          icon: <Crown className="h-6 w-6 text-amber-500" />,
        });
         newGameState.logs.unshift({
            id: Date.now() + Math.random(),
            turn: newGameState.turn,
            playerName: "Sistema",
            playerRole: "Chefe",
            decision: `Vitória sobre ${bossOnCurrentTile.name}`,
            effects: "A nação avança!"
        });
      }
    }
    
    const winCheckResult = await checkWinConditionsAction(newGameState, Object.values(newGameState.players));
    if (winCheckResult.isGameOver) {
      setGameOver(winCheckResult);
       newGameState.logs.unshift({
          id: Date.now() + Math.random(),
          turn: newGameState.turn,
          playerName: "Sistema",
          playerRole: "Fim de Jogo",
          decision: winCheckResult.message,
          effects: "A partida terminou."
      });
      newGameState.status = 'completed';
    }

    const nextPlayerIndex = (newGameState.currentPlayerIndex + 1) % Object.values(newGameState.players).length;
    if (nextPlayerIndex === 0) {
      newGameState.turn += 1;
    }
    newGameState.currentPlayerIndex = nextPlayerIndex;
    newGameState.currentCardId = getRandomCard(initialCards, newGameState.currentCardId).id;

    // Update the entire game session document in Firestore
    try {
        await updateDoc(gameSessionRef, {
            indicators: newGameState.indicators,
            players: newGameState.players,
            boardPosition: newGameState.boardPosition,
            logs: newGameState.logs,
            status: newGameState.status,
            turn: newGameState.turn,
            currentPlayerIndex: newGameState.currentPlayerIndex,
            currentCardId: newGameState.currentCardId,
        });
    } catch (e) {
        console.error("Failed to update game state:", e);
        toast({
            variant: "destructive",
            title: "Erro de Sincronização",
            description: "Não foi possível salvar sua jogada. Verifique sua conexão.",
        });
    } finally {
       setIsProcessing(false);
    }
  }, [gameSession, currentPlayer, isProcessing, toast, firestore, gameSessionRef]);
  

  if (isUserLoading || isGameLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando jogo...</p>
        </div>
    );
  }

  if (gameError) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-background text-red-500">
              <p>Erro ao carregar o jogo: {gameError.message}</p>
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

  const isCurrentPlayerTurn = user?.uid === currentPlayer.id;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header onRestart={handleRestart} gameCode={gameSession.gameCode} />
      <main className="flex-1 container mx-auto px-4 py-2 flex flex-col gap-2 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <ResourceDashboard indicators={gameSession.indicators} />
          <GameBoard boardPosition={gameSession.boardPosition} bosses={initialBosses} />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden min-h-0">
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <PlayerDashboard players={players} currentPlayerId={currentPlayer.id} />
          </div>
          <div className="lg:col-span-6 flex flex-col overflow-hidden">
            <DecisionCardComponent
              card={currentCard}
              onDecision={handleDecision}
              isProcessing={isProcessing || !isCurrentPlayerTurn}
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
