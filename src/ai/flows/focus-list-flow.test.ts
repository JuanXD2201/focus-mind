import { vi, describe, it, expect } from 'vitest';
import { manageFocusList } from './focus-list-flow';

vi.mock('@/ai/genkit', () => ({
  ai: {
    defineFlow: vi.fn((config, flowFunc) => flowFunc),
  },
}));

describe('manageFocusList Flow', () => {
  it("should return success for 'get' action", async () => {
    const input = { action: 'get', userId: 'user-123' };
    const result = await manageFocusList(input);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Funcionalidad de obtención directa en el cliente.");
  });

  it('should return success and log a message for other actions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const input = { 
        action: 'add', 
        userId: 'user-123', 
        taskData: { text: 'New task' } 
    };
    const result = await manageFocusList(input);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Acción add registrada.');
    expect(consoleSpy).toHaveBeenCalledWith("Acción 'add' ejecutada por el usuario user-123.");
    
    consoleSpy.mockRestore();
  });
});
