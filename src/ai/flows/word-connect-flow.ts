
'use server';
/**
 * @fileOverview Flow para el juego "Conecta Palabras".
 * 
 * - connectWords: Obtiene una palabra aleatoria o interpreta la conexión del usuario.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const words = [
    "Calma", "Energía", "Creatividad", "Fuerza", "Alegría", 
    "Enfoque", "Naturaleza", "Sueño", "Viaje", "Hogar"
];

// Se mueve la lógica de obtención de palabra a una función separada para mayor claridad.
const getRandomWord = () => {
    return words[Math.floor(Math.random() * words.length)];
}

const WordConnectInputSchema = z.object({
    action: z.enum(['getWord', 'interpret']),
    promptWord: z.string().optional(),
    userWords: z.string().optional(),
});
type WordConnectInput = z.infer<typeof WordConnectInputSchema>;

const WordConnectOutputSchema = z.object({
    word: z.string().optional(),
    interpretation: z.string().optional(),
});
type WordConnectOutput = z.infer<typeof WordConnectOutputSchema>;

const interpretationPrompt = ai.definePrompt({
  name: 'interpretationPrompt',
  input: { schema: z.object({ promptWord: z.string(), userWords: z.string() }) },
  prompt: `Eres un psicólogo amable y creativo. Un usuario ha asociado las siguientes palabras/ideas: "{{userWords}}" con la palabra clave: "{{promptWord}}".
  Escribe una interpretación corta, positiva y alentadora (2-3 frases) sobre esta conexión.
  Enfócate en la creatividad y los posibles significados subyacentes de una manera gentil. No des consejos, solo ofrece una perspectiva inspiradora.
  `,
});


const wordConnectFlow = ai.defineFlow(
  {
    name: 'wordConnectFlow',
    inputSchema: WordConnectInputSchema,
    outputSchema: WordConnectOutputSchema,
  },
  async (input) => {
    if (input.action === 'getWord') {
        const word = getRandomWord();
        return { word };
    }

    if (input.action === 'interpret' && input.promptWord && input.userWords) {
        const { output } = await interpretationPrompt({ promptWord: input.promptWord, userWords: input.userWords });
        return { interpretation: output || 'Una conexión interesante y llena de potencial.' };
    }
    
    throw new Error('Acción no válida o faltan parámetros.');
  }
);


export async function connectWords(input: WordConnectInput): Promise<WordConnectOutput> {
  return wordConnectFlow(input);
}
