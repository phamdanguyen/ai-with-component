
import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../tools/tool-registry';
import { weatherTool } from '../tools/sample-tools/weather.tool';
import { calculatorTool } from '../tools/sample-tools/calculator.tool';

describe('ToolRegistry', () => {
    let registry: ToolRegistry;

    beforeEach(() => {
        registry = ToolRegistry.getInstance();
        // Clear tools
        registry.list().forEach(t => registry.unregister(t.name));
    });

    it('should be a singleton', () => {
        const registry2 = ToolRegistry.getInstance();
        expect(registry).toBe(registry2);
    });

    it('should register and retrieve a tool', () => {
        registry.register(weatherTool);
        const tool = registry.get('weather');
        expect(tool).toBeDefined();
        expect(tool?.name).toBe('weather');
    });

    it('should list registered tools', () => {
        registry.register(weatherTool);
        registry.register(calculatorTool);
        const tools = registry.list();
        expect(tools.length).toBe(2);
    });

    it('should execute a tool successfully', async () => {
        registry.register(weatherTool);
        const result = await registry.execute('weather', { location: 'Tokyo' });
        expect(result.success).toBe(true);
        expect(result.data.temperature).toBeDefined();
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle tool execution errors (validation)', async () => {
        registry.register(weatherTool);
        // Missing required param 'location'
        const result = await registry.execute('weather', {});
        expect(result.success).toBe(false);
        expect(result.error).toContain('Missing required parameter');
    });

    it('should handle non-existent tool', async () => {
        const result = await registry.execute('ghost-tool', {});
        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
    });

    it('should execute calculator tool', async () => {
        registry.register(calculatorTool);
        const result = await registry.execute('calculator', { expression: '10 + 5' });
        expect(result.success).toBe(true);
        expect(result.data.result).toBe(15);
    });
});
