'use server';

/**
 * @fileOverview Analyzes win conditions based on resource levels and character objectives.
 *
 * - analyzeWinConditions - A function to determine if win conditions are met.
 * - AnalyzeWinConditionsInput - The input type for the analyzeWinConditions function.
 * - AnalyzeWinConditionsOutput - The return type for the analyzeWinConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWinConditionsInputSchema = z.object({
  economy: z.number().describe('The level of the economy (0-10).'),
  education: z.number().describe('The level of education (0-10).'),
  wellBeing: z.number().describe('The level of well-being (0-10).'),
  popularSupport: z.number().describe('The level of popular support (0-10).'),
  hunger: z.number().describe('The level of hunger (0-10, inverse).'),
  militaryReligion: z.number().describe('The level of military & religion (0-10).'),
  capital: z.number().describe('The amount of capital a player has.'),
  isOpportunist: z.boolean().describe('Whether the player is an opportunist.'),
});
export type AnalyzeWinConditionsInput = z.infer<typeof AnalyzeWinConditionsInputSchema>;

const AnalyzeWinConditionsOutputSchema = z.object({
  collectiveVictory: z.boolean().describe('Whether the collective victory condition is met.'),
  opportunistVictory: z.boolean().describe('Whether the opportunist victory condition is met.'),
  message: z.string().describe('A message indicating the outcome of the game.'),
});
export type AnalyzeWinConditionsOutput = z.infer<typeof AnalyzeWinConditionsOutputSchema>;

export async function analyzeWinConditions(input: AnalyzeWinConditionsInput): Promise<AnalyzeWinConditionsOutput> {
  return analyzeWinConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWinConditionsPrompt',
  input: {schema: AnalyzeWinConditionsInputSchema},
  output: {schema: AnalyzeWinConditionsOutputSchema},
  prompt: `Determine if any win conditions are met based on the following game state:

Economy: {{{economy}}}
Education: {{{education}}}
Well-being: {{{wellBeing}}}
Popular Support: {{{popularSupport}}}
Hunger: {{{hunger}}}
Military & Religion: {{{militaryReligion}}}
Capital: {{{capital}}}
Is Opportunist: {{{isOpportunist}}}

Collective Victory Condition: All indicators (Economy, Education, Well-being, Popular Support, Military & Religion) are above 7, and the game has reached the last boss (Desigualdade).
Opportunist Victory Condition: A player with the secret objective of "Opportunist" has 100 capital and the Education level is below 3.

Return a JSON object with the following boolean fields:
- collectiveVictory: true if the collective victory condition is met, false otherwise.
- opportunistVictory: true if the opportunist victory condition is met, false otherwise.
- message: A message indicating which win condition is met, or if none are met. Be concise.
`,
});

const analyzeWinConditionsFlow = ai.defineFlow(
  {
    name: 'analyzeWinConditionsFlow',
    inputSchema: AnalyzeWinConditionsInputSchema,
    outputSchema: AnalyzeWinConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
