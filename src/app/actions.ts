
'use server';

import { analyzeWinConditions, AnalyzeWinConditionsInput, AnalyzeWinConditionsOutput } from '@/ai/flows/analyze-win-conditions';
import type { GameState, Player } from '@/lib/types';
import { initialBosses } from '@/lib/game-data';

const FINAL_BOSS_POSITION = initialBosses.find(b => b.name === 'Desigualdade')?.position || 20;

export async function checkWinConditionsAction(gameState: GameState, players: Player[]): Promise<{ isGameOver: boolean; message: string; }> {
  const { indicators, boardPosition } = gameState;

  // 1. Check for immediate loss conditions
  const nonHungerIndicators = ['economy', 'education', 'wellBeing', 'popularSupport', 'militaryReligion'] as const;
  const anyIndicatorAtOrBelowZero = nonHungerIndicators.some(key => indicators[key] <= 0);

  if (anyIndicatorAtOrBelowZero) {
    return { isGameOver: true, message: "Colapso! Um indicador essencial chegou a zero. O país entrou em ruínas. Todos perdem." };
  }
  if (indicators.hunger >= 10) {
    return { isGameOver: true, message: "Colapso! A fome atingiu níveis insustentáveis. O país entrou em ruínas. Todos perdem." };
  }

  // 2. Prepare input for AI and call it.
  const opportunist = players.find(p => p.isOpportunist);
  const input: AnalyzeWinConditionsInput = {
    economy: indicators.economy,
    education: indicators.education,
    wellBeing: indicators.wellBeing,
    popularSupport: indicators.popularSupport,
    hunger: indicators.hunger,
    militaryReligion: indicators.militaryReligion,
    capital: opportunist ? opportunist.capital : 0,
    isOpportunist: !!opportunist,
  };

  try {
    const result: AnalyzeWinConditionsOutput = await analyzeWinConditions(input);

    // 3. Evaluate win conditions based on AI output and game logic
    if (result.opportunistVictory) {
      return { isGameOver: true, message: `O Oportunista venceu! Com o povo alienado, ${opportunist?.name} acumulou poder e riqueza.` };
    }
    
    const hasReachedFinalBoss = boardPosition >= FINAL_BOSS_POSITION;
    if (hasReachedFinalBoss && result.collectiveVictory) {
      return { isGameOver: true, message: "Vitória Coletiva! A nação prosperou e alcançou a Justiça Social!" };
    }
  } catch (error) {
    console.error("Error calling AI for win condition check:", error);
    // Fallback to manual check if AI fails
    const opportunistWin = opportunist && opportunist.capital >= 100 && indicators.education < 3;
    if (opportunistWin) {
        return { isGameOver: true, message: `O Oportunista venceu! Com o povo alienado, ${opportunist?.name} acumulou poder e riqueza.` };
    }
    const collectiveWin = boardPosition >= FINAL_BOSS_POSITION && Object.values(indicators).every(v => v > 7);
    if(collectiveWin) {
        return { isGameOver: true, message: "Vitória Coletiva! A nação prosperou e alcançou a Justiça Social!" };
    }
  }

  // 4. If no win/loss condition met, game continues.
  return { isGameOver: false, message: "" };
}
