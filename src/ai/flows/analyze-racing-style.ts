'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a player's racing style from a text description.
 *
 * - analyzeRacingStyle - Analyzes the player's racing style.
 * - AnalyzeRacingStyleInput - The input type for the analyzeRacingStyle function.
 * - AnalyzeRacingStyleOutput - The return type for the analyzeRacingStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRacingStyleInputSchema = z.object({
  racingStyleDescription: z.string().describe('A text description of the player\'s racing style.'),
});
export type AnalyzeRacingStyleInput = z.infer<typeof AnalyzeRacingStyleInputSchema>;

const AnalyzeRacingStyleOutputSchema = z.object({
  speed: z.string().describe('The player\'s speed preference (e.g., "fast", "moderate", "cautious").'),
  aggression: z.string().describe('The player\'s aggression level (e.g., "high", "medium", "low").'),
  cornering: z.string().describe('The player\'s cornering technique (e.g., "late braking", "early apex", "wide entry").'),
});
export type AnalyzeRacingStyleOutput = z.infer<typeof AnalyzeRacingStyleOutputSchema>;

export async function analyzeRacingStyle(
  input: AnalyzeRacingStyleInput
): Promise<AnalyzeRacingStyleOutput> {
  return analyzeRacingStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRacingStylePrompt',
  input: {schema: AnalyzeRacingStyleInputSchema},
  output: {schema: AnalyzeRacingStyleOutputSchema},
  prompt: `You are a racing analyst. Analyze the provided racing style description and extract the key characteristics.

Racing Style Description: {{{racingStyleDescription}}}

Based on the description, determine the player's speed, aggression, and cornering style.
`,
});

const analyzeRacingStyleFlow = ai.defineFlow(
  {
    name: 'analyzeRacingStyleFlow',
    inputSchema: AnalyzeRacingStyleInputSchema,
    outputSchema: AnalyzeRacingStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
