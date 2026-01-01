'use client';
import React, { useState, useCallback, useMemo } from 'react';
import type { GameState, Player, DecisionCard, Boss, DecisionOption, LogEntry } from '@/lib/types';
import { checkWinConditionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ResourceDashboard from './ResourceDashboard';
import PlayerDashboard from './PlayerDashboard';
import GameBoard from './GameBoard';
import DecisionCardComponent from './DecisionCard';
import EndGameDialog from './EndGameDialog';
import { roleDetails, indicatorDetails } from '@/lib/game-data';
import Header from './Header';
import { Crown, Swords } from 'lucide-react';
import LogPanel from './LogPanel';

type GameClientProps = {
  initialGameState: GameState;
  initialPlayers: Player[];
  initialCards: DecisionCard[];
  initialBosses: Boss[];
};

const getRandomCard = (cards: DecisionCard[], currentCardId?: string): DecisionCard => {
  const availableCards = cards.filter(c => c.id !== currentCardId);
  if (availableCards.length === 0) {
    return cards[0];
  }
  return availableCards[Math.floor(Math.random() * availableCards.length)];
};


export default function GameClient({
  initialGameState,
  initialPlayers,
  initialCards,
  initialBosses,
}: GameClientProps) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<DecisionCard>(getRandomCard(initialCards));
  const [gameOver, setGameOver] = useState({ isGameOver: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [turn, setTurn] = useState(1);
  const { toast } = useToast();

  const currentPlayer = useMemo(() => players[currentPlayerIndex], [players, currentPlayerIndex]);

  const addLog = (log: Omit<LogEntry, 'id'>) => {
    setLogs(prevLogs => [{ ...log, id: Date.now() }, ...prevLogs]);
  };

  const handleRestart = () => {
    setGameState(initialGameState);
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setCurrentCard(getRandomCard(initialCards));
    setGameOver({ isGameOver: false, message: '' });
    setLogs([]);
    setTurn(1);
    toast({ title: "Jogo Reiniciado", description: "Uma nova partida começou." });
  };

  const handleDecision = useCallback(async (option: DecisionOption) => {
    if (isProcessing) return;
    setIsProcessing(true);

    let newGameState = JSON.parse(JSON.stringify(gameState));
    let newPlayers = JSON.parse(JSON.stringify(players));
    const player = newPlayers[currentPlayerIndex];
    const playerRole = player.role;
    
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
        player.capital += change;
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
    
    addLog({
      turn,
      playerName: currentPlayer.name,
      playerRole: roleDetails[currentPlayer.role].name,
      decision: option.name,
      effects: effectsDescriptions.join(', ') || "Nenhum efeito."
    });

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
        addLog({
            turn,
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
         addLog({
            turn,
            playerName: "Sistema",
            playerRole: "Chefe",
            decision: `Vitória sobre ${bossOnCurrentTile.name}`,
            effects: "A nação avança!"
        });
      }
    }

    setGameState(newGameState);
    setPlayers(newPlayers);
    
    const winCheckResult = await checkWinConditionsAction(newGameState, newPlayers);
    if (winCheckResult.isGameOver) {
      setGameOver(winCheckResult);
       addLog({
          turn,
          playerName: "Sistema",
          playerRole: "Fim de Jogo",
          decision: winCheckResult.message,
          effects: "A partida terminou."
      });
      setIsProcessing(false);
      return;
    }

    const nextPlayerIndex = (currentPlayerIndex + 1) % newPlayers.length;
    if (nextPlayerIndex === 0) {
      setTurn(t => t + 1);
    }
    setCurrentPlayerIndex(nextPlayerIndex);
    setCurrentCard(getRandomCard(initialCards, currentCard.id));
    setIsProcessing(false);
  }, [gameState, players, currentPlayer, currentPlayerIndex, initialBosses, initialCards, isProcessing, toast, turn, currentCard]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header onRestart={handleRestart} />
      <main className="flex-1 container mx-auto px-4 py-2 flex flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResourceDashboard indicators={gameState.indicators} />
          <GameBoard boardPosition={gameState.boardPosition} bosses={initialBosses} />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <PlayerDashboard players={players} currentPlayerId={currentPlayer.id} />
          </div>
          <div className="lg:col-span-6 flex flex-col overflow-hidden">
            <DecisionCardComponent
              card={currentCard}
              onDecision={handleDecision}
              isProcessing={isProcessing}
              currentPlayer={currentPlayer}
            />
          </div>
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <LogPanel logs={logs} />
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
