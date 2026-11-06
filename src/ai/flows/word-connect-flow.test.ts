import { vi, describe, it, expect } from 'vitest';
import { connectWords } from './word-connect-flow';

// definePrompt se ejecuta al importar el flujo, asi que el prompt se crea una sola vez.
// Se expone el mock con vi.hoisted para poder inspeccionarlo desde las pruebas.
const { interpretationPrompt } = vi.hoisted(() => ({
  interpretationPrompt: vi.fn(),
}));

vi.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: vi.fn(() => interpretationPrompt),
    defineFlow: vi.fn((config, flowFunc) => flowFunc),
  },
}));

describe('connectWords Flow', () => {

  it("should return a random word when action is 'getWord'", async () => {
    // Mock Math.random to get a predictable result
    const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1); // Will pick 'Energía' (2nd item)

    const result = await connectWords({ action: 'getWord' });
    
    expect(result).toHaveProperty('word');
    expect(result.word).toBe('Energía');
    expect(result.interpretation).toBeUndefined();

    mathSpy.mockRestore();
  });

  it("should return an interpretation when action is 'interpret'", async () => {
    interpretationPrompt.mockResolvedValueOnce({ output: 'A beautiful and creative interpretation.' });

    const input = {
      action: 'interpret' as const,
      promptWord: 'Calma',
      userWords: 'peace, quiet, blue',
    };
    const result = await connectWords(input);

    expect(result).toHaveProperty('interpretation', 'A beautiful and creative interpretation.');
    expect(result.word).toBeUndefined();
    
    // Check if the interpretation prompt was called with the correct arguments
    expect(interpretationPrompt).toHaveBeenCalledWith({
      promptWord: 'Calma',
      userWords: 'peace, quiet, blue',
    });
  });

  it('should throw an error for invalid action', async () => {
    const input = { action: 'invalidAction' } as any;
    await expect(connectWords(input)).rejects.toThrow('Acción no válida o faltan parámetros.');
  });
  
  it("should throw an error for 'interpret' action without required params", async () => {
    const input = { action: 'interpret', promptWord: 'Calma' } as any;
    await expect(connectWords(input)).rejects.toThrow('Acción no válida o faltan parámetros.');
  });
});
