
'use server';
/**
 * @fileOverview Flow para generar un guion de meditación y convertirlo a audio.
 *
 * - generateMeditation - Genera una meditación guiada en audio a partir de un tema.
 * - GenerateMeditationInput - Tipo de entrada para la función.
 * - GenerateMeditationOutput - Tipo de salida para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';


export type GenerateMeditationInput = string;

export type GenerateMeditationOutput = {
  script: string;
  audioDataUri?: string;
};

const GenerateMeditationInputSchema = z.string();
const GenerateMeditationOutputSchema = z.object({
  script: z.string().describe('El guion de la meditación.'),
  audioDataUri: z.string().optional().describe('El audio de la meditación como un data URI.'),
});

const meditationPrompt = ai.definePrompt({
    name: 'meditationPrompt',
    input: { schema: GenerateMeditationInputSchema },
    output: { schema: z.object({ script: z.string() })},
    prompt: `Eres un guía de meditación experto. Escribe un guion de meditación corto y relajante sobre el siguiente tema: {{{input}}}. El guion debe ser calmado, tranquilizador y fácil de seguir.`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const meditationFlow = ai.defineFlow(
  {
    name: 'meditationFlow',
    inputSchema: GenerateMeditationInputSchema,
    outputSchema: GenerateMeditationOutputSchema,
  },
  async (topic) => {
    const { output } = await meditationPrompt(topic);
    if (!output?.script) {
        throw new Error('No se pudo generar el guion de la meditación.');
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: output.script,
    });
    
    if (!media) {
      return { script: output.script };
    }
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);
    
    return {
        script: output.script,
        audioDataUri: 'data:audio/wav;base64,' + wavBase64
    };
  }
);


export async function generateMeditation(topic: GenerateMeditationInput): Promise<GenerateMeditationOutput> {
  return meditationFlow(topic);
}
