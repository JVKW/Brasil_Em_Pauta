'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameState, Player, DecisionCard, Boss, DecisionOption } from '@/lib/types';
import { checkWinConditionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ResourceDashboard from './ResourceDashboard';
import PlayerDashboard from './PlayerDashboard';
import GameBoard from './GameBoard';
import DecisionCardComponent from './DecisionCard';
import EndGameDialog from './EndGameDialog';
import { roleDetails } from '@/lib/game-data';
import Header from './Header';
import { Crown, Swords } from 'lucide-react';
import { Card } from '../ui/card';

type GameClientProps = {
  initialGameState: GameState;
  initialPlayers: Player[];
  initialCards: DecisionCard[];
  initialBosses: Boss[];
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
  const [currentCard, setCurrentCard] = useState<DecisionCard>(initialCards[0]);
  const [gameOver, setGameOver] = useState({ isGameOver: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const currentPlayer = useMemo(() => players[currentPlayerIndex], [players, currentPlayerIndex]);

  const handleRestart = () => {
    setGameState(initialGameState);
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setCurrentCard(initialCards[Math.floor(Math.random() * initialCards.length)]);
    setGameOver({ isGameOver: false, message: '' });
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

    option.effects.forEach(effect => {
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
      } else if ('capital' in effect) {
        let change = effect.change;
        if(playerRole === 'economyManager' && change > 0) change = Math.ceil(change * 1.5);
        player.capital += change;
      } else if ('board' in effect) {
        boardChange += effect.change;
      }
    });

    newGameState.boardPosition = Math.min(20, newGameState.boardPosition + boardChange);

    const bossOnCurrentTile = initialBosses.find(b => b.position === newGameState.boardPosition);
    if (bossOnCurrentTile) {
      if (newGameState.indicators[bossOnCurrentTile.requirement.indicator] < bossOnCurrentTile.requirement.level) {
        newGameState.boardPosition = Math.max(1, newGameState.boardPosition - 1);
        toast({
          variant: "destructive",
          title: "Progresso Bloqueado!",
          description: `O progresso da nação foi barrado por "${bossOnCurrentTile.name}". O indicador de ${bossOnCurrentTile.requirement.indicator} precisa ser no mínimo ${bossOnCurrentTile.requirement.level}.`,
          icon: <Swords className="h-6 w-6 text-destructive-foreground" />,
        });
      } else {
        toast({
          title: "Desafio Superado!",
          description: `A nação venceu o desafio "${bossOnCurrentTile.name}"!`,
          icon: <Crown className="h-6 w-6 text-amber-500" />,
        });
      }
    }

    setGameState(newGameState);
    setPlayers(newPlayers);
    
    const winCheckResult = await checkWinConditionsAction(newGameState, newPlayers);
    if (winCheckResult.isGameOver) {
      setGameOver(winCheckResult);
      setIsProcessing(false);
      return;
    }

    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % newPlayers.length);
    setCurrentCard(initialCards[Math.floor(Math.random() * initialCards.length)]);
    setIsProcessing(false);
  }, [gameState, players, currentPlayerIndex, initialBosses, initialCards, isProcessing, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRestart={handleRestart} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <ResourceDashboard indicators={gameState.indicators} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8">
          <div className="lg:col-span-1">
            <PlayerDashboard players={players} currentPlayerId={currentPlayer.id} />
          </div>
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <GameBoard boardPosition={gameState.boardPosition} bosses={initialBosses} />
            <DecisionCardComponent
                card={currentCard}
                onDecision={handleDecision}
                isProcessing={isProcessing}
                currentPlayer={currentPlayer}
              />
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
