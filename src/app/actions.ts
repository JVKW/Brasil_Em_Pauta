'use server';

import { analyzeWinConditions, AnalyzeWinConditionsInput, AnalyzeWinConditionsOutput } from '@/ai/flows/analyze-win-conditions';
import type { GameSession, Player } from '@/lib/types';
import { initialBosses } from '@/lib/game-data';

const FINAL_BOSS_POSITION = initialBosses.find(b => b.name === 'Desigualdade')?.position || 20;

export async function checkWinConditionsAction(gameSession: GameSession): Promise<{ isGameOver: boolean; message: string; }> {
  
  // 1. Check for immediate loss conditions based on gameSession indicators
  const nonHungerIndicators = ['economy', 'education', 'wellbeing', 'popular_support', 'military_religion'] as const;
  const anyIndicatorAtOrBelowZero = nonHungerIndicators.some(key => gameSession[key] <= 0);

  if (anyIndicatorAtOrBelowZero) {
    return { isGameOver: true, message: "Colapso! Um indicador essencial chegou a zero. O país entrou em ruínas. Todos perdem." };
  }
  if (gameSession.hunger >= 10) {
    return { isGameOver: true, message: "Colapso! A fome atingiu níveis insustentáveis. O país entrou em ruínas. Todos perdem." };
  }

  // 2. Prepare input for AI and call it.
  const opportunist = gameSession.players.find(p => p.isOpportunist);
  const input: AnalyzeWinConditionsInput = {
    economy: gameSession.economy,
    education: gameSession.education,
    wellBeing: gameSession.wellbeing,
    popularSupport: gameSession.popular_support,
    hunger: gameSession.hunger,
    militaryReligion: gameSession.military_religion,
    capital: opportunist ? opportunist.capital : 0,
    isOpportunist: !!opportunist,
  };

  try {
    const result: AnalyzeWinConditionsOutput = await analyzeWinConditions(input);

    // 3. Evaluate win conditions based on AI output and game logic
    if (result.opportunistVictory) {
      return { isGameOver: true, message: `O Oportunista venceu! Com o povo alienado, ${opportunist?.nickname} acumulou poder e riqueza.` };
    }
    
    const hasReachedFinalBoss = gameSession.board_position >= FINAL_BOSS_POSITION;
    if (hasReachedFinalBoss && result.collectiveVictory) {
      return { isGameOver: true, message: "Vitória Coletiva! A nação prosperou e alcançou a Justiça Social!" };
    }
  } catch (error) {
    console.error("Error calling AI for win condition check:", error);
    // Fallback to manual check if AI fails
    const opportunistWin = opportunist && opportunist.capital >= 100 && gameSession.education < 3;
    if (opportunistWin) {
        return { isGameOver: true, message: `O Oportunista venceu! Com o povo alienado, ${opportunist?.nickname} acumulou poder e riqueza.` };
    }
    const collectiveWin = gameSession.board_position >= FINAL_BOSS_POSITION && 
      nonHungerIndicators.every(key => gameSession[key] > 7) &&
      gameSession.hunger < 3; // Example condition for hunger
    if(collectiveWin) {
        return { isGameOver: true, message: "Vitória Coletiva! A nação prosperou e alcançou a Justiça Social!" };
    }
  }

  // 4. If no win/loss condition met, game continues.
  return { isGameOver: false, message: "" };
}
