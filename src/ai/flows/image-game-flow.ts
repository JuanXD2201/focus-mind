
'use server';
/**
 * @fileOverview Flow para el juego "Adivina la Imagen".
 * 
 * - guessTheImage: Genera una imagen y la información asociada (qué es y una pista).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ImageGameOutputSchema = z.object({
  imageUrl: z.string().describe("La URL de la imagen generada, como un data URI."),
  subject: z.string().describe("El sujeto principal de la imagen, en una o dos palabras (ej: 'Un gato astronauta')."),
  hint: z.string().describe("Una pista sutil sobre lo que es la imagen (ej: 'Es un animal doméstico que viaja al espacio').")
});

type ImageGameOutput = z.infer<typeof ImageGameOutputSchema>;

const imageInfoPrompt = ai.definePrompt({
    name: 'imageInfoPrompt',
    output: { schema: z.object({
        subject: z.string(),
        prompt: z.string(),
        hint: z.string()
    }) },
    prompt: `Genera una idea para una imagen que sea interesante y un poco surrealista, pero adivinable. 
    Proporciona el sujeto, un prompt para un modelo de generación de imágenes y una pista.
    - subject: El nombre del objeto o ser (ej: 'Un elefante rosa').
    - prompt: Un prompt detallado para generar la imagen (ej: 'foto cinematográfica de un elefante bebé color rosa pastel, fondo de estudio minimalista').
    - hint: Una pista que no revele directamente la respuesta (ej: 'Es un mamífero grande de un color inusual').
    Asegúrate de que la respuesta sea solo el JSON.
    `
});


const imageGameFlow = ai.defineFlow(
  {
    name: 'imageGameFlow',
    outputSchema: ImageGameOutputSchema,
  },
  async () => {
    const { output: imageInfo } = await imageInfoPrompt();
    if (!imageInfo) {
        throw new Error("No se pudo obtener la información de la imagen.");
    }

    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: imageInfo.prompt,
    });

    if (!media?.url) {
        throw new Error("No se pudo generar la imagen.");
    }
    
    return {
        imageUrl: media.url,
        subject: imageInfo.subject,
        hint: imageInfo.hint,
    };
  }
);


export async function guessTheImage(): Promise<ImageGameOutput> {
  return imageGameFlow();
}
