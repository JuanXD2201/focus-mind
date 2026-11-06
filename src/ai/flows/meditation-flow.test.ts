import { vi, describe, it, expect } from 'vitest';
import { generateMeditation } from './meditation-flow';

// Mock the 'wav' library to avoid dealing with streams and buffers in tests
vi.mock('wav', () => ({
  default: {
    Writer: vi.fn().mockImplementation(() => ({
      on: (event: string, callback: (...args: any[]) => void) => {
        if (event === 'end') {
          // This simulates the stream finishing and resolves the promise in toWav
          callback(); 
        }
      },
      write: vi.fn(),
      end: vi.fn(),
    })),
  },
}));

// Mock the genkit ai object
vi.mock('@/ai/genkit', () => {
    return {
        ai: {
            definePrompt: vi.fn(() => 
              vi.fn().mockResolvedValue({ output: { script: 'Mock meditation script.' } })
            ),
            defineFlow: vi.fn((config, flowFunc) => flowFunc), // Executes the actual flow logic
            generate: vi.fn().mockResolvedValue({
              media: { url: 'data:audio/pcm;base64,bW9jayBhdWRpbyBkYXRh' } // Mock raw pcm data
            }),
        }
    };
});

describe('generateMeditation Flow', () => {
  it('should return a script and a WAV audio data URI', async () => {
    const topic = 'calmness';
    const result = await generateMeditation(topic);

    expect(result).toHaveProperty('script', 'Mock meditation script.');
    expect(result).toHaveProperty('audioDataUri');
    expect(result.audioDataUri).toContain('data:audio/wav;base64,');
  });

  it('should handle AI audio generation failure gracefully', async () => {
    // Temporarily override the mock for this test case
    const { ai } = await import('@/ai/genkit');
    (ai.generate as any).mockResolvedValueOnce({ media: null });

    const topic = 'anxiety';
    const result = await generateMeditation(topic);
    
    expect(result).toHaveProperty('script', 'Mock meditation script.');
    expect(result.audioDataUri).toBeUndefined();
  });
});
