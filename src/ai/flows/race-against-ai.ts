'use server';

/**
 * @fileOverview This file defines a Genkit flow for racing against AI opponents.
 * It allows the AI to learn from the player's racing style and adapt their strategies.
 *
 * @interface RaceAgainstAIInput - Defines the input schema for the race against AI flow.
 * @interface RaceAgainstAIOutput - Defines the output schema for the race against AI flow.
 * @function raceAgainstAI - An async function that takes RaceAgainstAIInput and returns a Promise of RaceAgainstAIOutput.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RaceAgainstAIInputSchema = z.object({
  trackData: z.string().describe('Data representing the race track layout and characteristics.'),
  playerRacingStyle: z
    .object({
        speed: z.string().describe('The player\'s speed preference (e.g., "fast", "moderate", "cautious").'),
        aggression: z.string().describe('The player\'s aggression level (e.g., "high", "medium", "low").'),
        cornering: z.string().describe('The player\'s cornering technique (e.g., "late braking", "early apex", "wide entry").'),
    })
    .describe(
      'A structured description of the player’s racing style.'
    ),
  difficultyLevel: z
    .enum(['easy', 'medium', 'hard'])
    .default('medium')
    .describe('The difficulty level of the AI opponents.'),
});
export type RaceAgainstAIInput = z.infer<typeof RaceAgainstAIInputSchema>;

const RaceAgainstAIOutputSchema = z.object({
  aiOpponentStrategies: z
    .array(z.string())
    .describe('An array of racing strategies for each AI opponent, adapted to the player’s style and track conditions.'),
});
export type RaceAgainstAIOutput = z.infer<typeof RaceAgainstAIOutputSchema>;

export async function raceAgainstAI(input: RaceAgainstAIInput): Promise<RaceAgainstAIOutput> {
  return raceAgainstAIFlow(input);
}

const raceAgainstAIPrompt = ai.definePrompt({
  name: 'raceAgainstAIPrompt',
  input: {schema: RaceAgainstAIInputSchema},
  output: {schema: RaceAgainstAIOutputSchema},
  prompt: `You are an expert race strategist. Given the following information about the race track, the player's racing style, and the desired difficulty level, generate racing strategies for the AI opponents.

Track Data: {{{trackData}}}
Player Racing Style:
- Speed: {{{playerRacingStyle.speed}}}
- Aggression: {{{playerRacingStyle.aggression}}}
- Cornering: {{{playerRacingStyle.cornering}}}
Difficulty Level: {{{difficultyLevel}}}

Based on this information, create an array of racing strategies. Each strategy should include information like:
- Optimal racing lines for different sections of the track
- Acceleration and braking points
- Overtaking strategies
- Defensive strategies to counter the player's style

Ensure that the strategies are challenging but fair, and adapted to the player's skill level as described by difficultyLevel. Each strategy should be different, so the AI opponents do not behave identically.

Output racing strategies in plain english.

AI Opponent Strategies:`,
});

const raceAgainstAIFlow = ai.defineFlow(
  {
    name: 'raceAgainstAIFlow',
    inputSchema: RaceAgainstAIInputSchema,
    outputSchema: RaceAgainstAIOutputSchema,
  },
  async input => {
    const {output} = await raceAgainstAIPrompt(input);
    return output!;
  }
);
