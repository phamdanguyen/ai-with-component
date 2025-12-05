
import { describe, it, expect, beforeEach } from 'vitest';
import { compassTool } from '../tools/core/compass.tool';
import { ToolRegistry } from '../tools/tool-registry';
import { weatherTool } from '../tools/sample-tools/weather.tool';
import { calculatorTool } from '../tools/sample-tools/calculator.tool';

describe('Compass Tool', () => {
    beforeEach(() => {
        const registry = ToolRegistry.getInstance();
        registry.list().forEach(t => registry.unregister(t.name));
        registry.register(weatherTool);
        registry.register(calculatorTool);
    });

    it('should find weather tool for weather intent', async () => {
        const result = await compassTool.execute({ intent: 'check weather in Tokyo' });
        expect(result.success).toBe(true);
        expect(result.data.suggestions).toHaveLength(1);
        expect(result.data.suggestions[0].name).toBe('weather');
    });

    it('should find calculator tool for math intent', async () => {
        // "use calculator for 5 + 5" -> "calculator" matches
        const result = await compassTool.execute({ intent: 'use calculator for 5 + 5' });
        expect(result.success).toBe(true);
        // Might return weather too due to "for" keyword, but calculator should be first or present
        expect(result.data.suggestions.length).toBeGreaterThan(0);
        expect(result.data.suggestions[0].name).toBe('calculator');
    });

    it('should suggest nothing for unrelated intent', async () => {
        const result = await compassTool.execute({ intent: 'make a sandwich' });
        expect(result.success).toBe(true);
        expect(result.data.suggestions).toBeUndefined();
        expect(result.data.message).toContain('No specific tools found');
    });
});
