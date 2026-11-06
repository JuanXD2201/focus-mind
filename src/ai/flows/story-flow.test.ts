import { vi, describe, it, expect } from 'vitest';
import { generateStory } from './story-flow';

// Mock the genkit ai object
vi.mock('@/ai/genkit', () => {
  const mockAi = {
    definePrompt: vi.fn().mockImplementation(() => 
      vi.fn().mockResolvedValue({
        output: 'This is a mock story.',
      })
    ),
    defineFlow: vi.fn().mockImplementation((config, flowFunc) => {
      // Return the flow function itself so we can call it directly
      return flowFunc;
    }),
  };
  return { ai: mockAi };
});

describe('generateStory Flow', () => {
  it('should return a story string', async () => {
    const prompt = 'a story about a cat';
    const result = await generateStory(prompt);
    
    expect(typeof result).toBe('string');
    expect(result).toBe('This is a mock story.');
  });
});
