import { vi, describe, it, expect, beforeEach } from 'vitest';
import { guessTheImage } from './image-game-flow';

// definePrompt se ejecuta al importar el flujo, asi que el prompt se crea una sola vez.
// Se expone el mock con vi.hoisted para poder cambiar su resultado en cada prueba.
const { imageInfoPrompt } = vi.hoisted(() => ({
  imageInfoPrompt: vi.fn(),
}));

const validImageInfo = {
  subject: 'A cat astronaut',
  prompt: 'A photorealistic cat wearing an astronaut helmet',
  hint: 'A domestic animal in space',
};

vi.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: vi.fn(() => imageInfoPrompt),
    defineFlow: vi.fn((config, flowFunc) => flowFunc),
    generate: vi.fn().mockResolvedValue({
      media: { url: 'data:image/png;base64,bW9jayBpbWFnZSBkYXRh' },
    }),
  },
}));

describe('guessTheImage Flow', () => {
  beforeEach(() => {
    imageInfoPrompt.mockReset();
    imageInfoPrompt.mockResolvedValue({ output: validImageInfo });
  });

  it('should return an image URL, subject, and hint', async () => {
    const result = await guessTheImage();

    expect(result).toHaveProperty('imageUrl');
    expect(result.imageUrl).toContain('data:image/png;base64,');
    expect(result).toHaveProperty('subject', 'A cat astronaut');
    expect(result).toHaveProperty('hint', 'A domestic animal in space');
  });

  it('should throw an error if image info generation fails', async () => {
    // El prompt no devuelve salida
    imageInfoPrompt.mockResolvedValueOnce({ output: null });

    await expect(guessTheImage()).rejects.toThrow("No se pudo obtener la información de la imagen.");
  });

  it('should throw an error if image generation fails', async () => {
    const genkit = await import('@/ai/genkit');
    // Mock the image generation to return no media url
     (genkit.ai.generate as any).mockResolvedValueOnce({ media: { url: null } });
    
    await expect(guessTheImage()).rejects.toThrow("No se pudo generar la imagen.");
  });
});
