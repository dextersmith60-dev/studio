'use server';

/**
 * @fileOverview A flow for generating varied track conditions using generative AI.
 *
 * - generateTrackConditions - A function to generate track conditions.
 * - GenerateTrackConditionsInput - The input type for the generateTrackConditions function.
 * - GenerateTrackConditionsOutput - The return type for the generateTrackConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrackConditionsInputSchema = z.object({
  trackName: z.string().describe('The name of the track.'),
  currentWeather: z.string().describe('The current weather conditions on the track.'),
});
export type GenerateTrackConditionsInput = z.infer<
  typeof GenerateTrackConditionsInputSchema
>;

const GenerateTrackConditionsOutputSchema = z.object({
  newWeather: z.string().describe('The new weather conditions for the track.'),
  trackObstacles: z
    .string()
    .describe('A description of new obstacles on the track.'),
});
export type GenerateTrackConditionsOutput = z.infer<
  typeof GenerateTrackConditionsOutputSchema
>;

export async function generateTrackConditions(
  input: GenerateTrackConditionsInput
): Promise<GenerateTrackConditionsOutput> {
  return generateTrackConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrackConditionsPrompt',
  input: {schema: GenerateTrackConditionsInputSchema},
  output: {schema: GenerateTrackConditionsOutputSchema},
  prompt: `You are a race track condition generator. Given the track name and current weather conditions, you will generate new weather conditions and track obstacles to make the race more challenging and varied.

Track Name: {{{trackName}}}
Current Weather: {{{currentWeather}}}

Generate new weather conditions that are different from the current weather.
Also, generate a description of new obstacles that could be on the track, such as debris, oil slicks, or potholes.
`,
});

const generateTrackConditionsFlow = ai.defineFlow(
  {
    name: 'generateTrackConditionsFlow',
    inputSchema: GenerateTrackConditionsInputSchema,
    outputSchema: GenerateTrackConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
