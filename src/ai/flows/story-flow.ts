
'use server';
/**
 * @fileOverview Flow para generar un cuento corto.
 * 
 * - generateStory: Genera un cuento a partir de un tema o prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const storyPrompt = ai.definePrompt({
  name: 'storyPrompt',
  input: { schema: z.string() },
  prompt: `Eres un escritor de cuentos cortos, especializado en historias relajantes, optimistas y con finales felices. 
  Escribe un cuento corto (de 3 a 5 párrafos) basado en la siguiente idea: {{{input}}}.
  El tono debe ser calmado, inspirador y adecuado para todas las edades. No incluyas un título.
  `,
});

const storyFlow = ai.defineFlow(
  {
    name: 'storyFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const { output } = await storyPrompt(prompt);
    return output || 'No se pudo generar un cuento en este momento.';
  }
);

export async function generateStory(prompt: string): Promise<string> {
  return storyFlow(prompt);
}

    