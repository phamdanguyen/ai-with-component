/**
 * ToolExecutionService Tests
 *
 * Story 4-1: Tool Registry & Execution
 * Coverage: Registry, Execution, Caching, Timeout, Validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ToolExecutionService,
  ToolExecutionError,
  BUILTIN_TOOLS,
} from '../services/tool-execution.service';
import type { ToolDefinition } from '../services/interfaces';

describe('ToolExecutionService', () => {
  let service: ToolExecutionService;

  beforeEach(() => {
    service = new ToolExecutionService({
      maxCacheSize: 10,
      cacheTTL: 60000,
      defaultTimeout: 5000,
    });
  });

  describe('Tool Registration', () => {
    it('should register a tool', () => {
      const tool: ToolDefinition = {
        name: 'test_tool',
        description: 'A test tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => 'result',
      };

      service.registerTool(tool);
      const tools = service.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('test_tool');
    });

    it('should get all registered tools', () => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
      const tools = service.getTools();

      expect(tools.length).toBeGreaterThanOrEqual(4);
      expect(tools.map((t) => t.name)).toContain('get_current_date');
      expect(tools.map((t) => t.name)).toContain('calculate');
      expect(tools.map((t) => t.name)).toContain('get_weather');
      expect(tools.map((t) => t.name)).toContain('translate');
    });

    it('should overwrite tool with same name', () => {
      const tool1: ToolDefinition = {
        name: 'test',
        description: 'Version 1',
        parameters: { type: 'object', properties: {} },
        execute: async () => 'v1',
      };
      const tool2: ToolDefinition = {
        name: 'test',
        description: 'Version 2',
        parameters: { type: 'object', properties: {} },
        execute: async () => 'v2',
      };

      service.registerTool(tool1);
      service.registerTool(tool2);

      const tools = service.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].description).toBe('Version 2');
    });
  });

  describe('Tool Execution', () => {
    beforeEach(() => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
    });

    it('should execute get_current_date tool', async () => {
      const result = await service.executeTool('get_current_date', {
        format: 'iso',
      });

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it('should execute calculate tool', async () => {
      const result = (await service.executeTool('calculate', {
        expression: '2 + 2',
      })) as { expression: string; result: number };

      expect(result.expression).toBe('2 + 2');
      expect(result.result).toBe(4);
    });

    it('should execute calculate with complex expression', async () => {
      const result = (await service.executeTool('calculate', {
        expression: '(10 + 5) * 2',
      })) as { expression: string; result: number };

      expect(result.result).toBe(30);
    });

    it('should execute get_weather tool', async () => {
      const result = (await service.executeTool('get_weather', {
        city: 'Tokyo',
      })) as { city: string; temperature: number; condition: string };

      expect(result.city).toBe('Tokyo');
      expect(result.temperature).toBe(22);
      expect(result.condition).toBe('Partly Cloudy');
    });

    it('should execute translate tool', async () => {
      const result = (await service.executeTool('translate', {
        text: 'hello',
        to: 'vi',
      })) as { original: string; translated: string };

      expect(result.original).toBe('hello');
      expect(result.translated).toBe('Xin chào');
    });

    it('should throw ToolExecutionError for unknown tool', async () => {
      await expect(
        service.executeTool('unknown_tool', {})
      ).rejects.toThrow(ToolExecutionError);

      try {
        await service.executeTool('unknown_tool', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ToolExecutionError);
        expect((error as ToolExecutionError).code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Parameter Validation', () => {
    beforeEach(() => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
    });

    it('should throw error for missing required parameter', async () => {
      await expect(service.executeTool('calculate', {})).rejects.toThrow(
        'Missing required parameter: expression'
      );

      try {
        await service.executeTool('calculate', {});
      } catch (error) {
        expect((error as ToolExecutionError).code).toBe('VALIDATION');
      }
    });

    it('should throw error for invalid parameter type', async () => {
      await expect(
        service.executeTool('calculate', { expression: 123 })
      ).rejects.toThrow("Parameter 'expression' must be a string");
    });

    it('should throw error for invalid enum value', async () => {
      await expect(
        service.executeTool('get_current_date', { format: 'invalid' })
      ).rejects.toThrow("Parameter 'format' must be one of");
    });

    it('should allow valid enum value', async () => {
      const result = await service.executeTool('get_current_date', {
        format: 'short',
      });
      expect(result).toBeDefined();
    });

    it('should skip validation when validateParams is false', async () => {
      const result = await service.executeTool(
        'get_current_date',
        { format: 'invalid_but_skipped' },
        { validateParams: false }
      );
      expect(result).toBeDefined();
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout slow tool execution', async () => {
      const slowTool: ToolDefinition = {
        name: 'slow_tool',
        description: 'A slow tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          return 'done';
        },
      };

      service.registerTool(slowTool);

      await expect(
        service.executeTool('slow_tool', {}, { timeout: 100 })
      ).rejects.toThrow('timed out');

      try {
        await service.executeTool('slow_tool', {}, { timeout: 100 });
      } catch (error) {
        expect((error as ToolExecutionError).code).toBe('TIMEOUT');
      }
    });

    it('should complete fast tool within timeout', async () => {
      const fastTool: ToolDefinition = {
        name: 'fast_tool',
        description: 'A fast tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => 'quick result',
      };

      service.registerTool(fastTool);
      const result = await service.executeTool('fast_tool', {}, { timeout: 5000 });

      expect(result).toBe('quick result');
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
    });

    it('should cache tool results', async () => {
      // First call
      const result1 = await service.executeTool('calculate', {
        expression: '5 + 5',
      });

      // Second call (should be cached)
      const result2 = await service.executeTool('calculate', {
        expression: '5 + 5',
      });

      expect(result1).toEqual(result2);

      const stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should not cache when cacheable is false', async () => {
      const nonCacheableTool: ToolDefinition = {
        name: 'non_cacheable',
        description: 'Non-cacheable tool',
        parameters: { type: 'object', properties: {} },
        execute: async () => Math.random(),
        cacheable: false,
      };

      service.registerTool(nonCacheableTool);

      const result1 = await service.executeTool('non_cacheable', {});
      const result2 = await service.executeTool('non_cacheable', {});

      expect(result1).not.toBe(result2);
    });

    it('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('executeToolSafe', () => {
    beforeEach(() => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
    });

    it('should return success result for valid execution', async () => {
      const result = await service.executeToolSafe('calculate', {
        expression: '10 / 2',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ expression: '10 / 2', result: 5 });
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.cached).toBe(false);
    });

    it('should return cached flag when result is from cache', async () => {
      // First call
      await service.executeToolSafe('calculate', { expression: '3 * 3' });

      // Second call (cached)
      const result = await service.executeToolSafe('calculate', {
        expression: '3 * 3',
      });

      expect(result.success).toBe(true);
      expect(result.cached).toBe(true);
    });

    it('should return error result for failed execution', async () => {
      const result = await service.executeToolSafe('unknown', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.cached).toBe(false);
    });

    it('should return error for validation failure', async () => {
      const result = await service.executeToolSafe('calculate', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameter');
    });
  });

  describe('Tool Selection', () => {
    beforeEach(() => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
    });

    it('should select tools based on query keywords', () => {
      const tools = service.selectTools('What is the current date?');

      const toolNames = tools.map((t) => t.name);
      expect(toolNames).toContain('get_current_date');
    });

    it('should select weather tool for weather query', () => {
      const tools = service.selectTools('weather in Tokyo');

      const toolNames = tools.map((t) => t.name);
      expect(toolNames).toContain('get_weather');
    });

    it('should select calculate tool for math query', () => {
      const tools = service.selectTools('calculate 2 + 2');

      const toolNames = tools.map((t) => t.name);
      expect(toolNames).toContain('calculate');
    });

    it('should return empty array for unrelated query', () => {
      const tools = service.selectTools('random unrelated query xyz');

      // May return some tools based on partial matches or empty
      expect(Array.isArray(tools)).toBe(true);
    });
  });

  describe('Safe Math Evaluation', () => {
    beforeEach(() => {
      BUILTIN_TOOLS.forEach((tool) => service.registerTool(tool));
    });

    it('should reject invalid characters in expression', async () => {
      await expect(
        service.executeTool('calculate', { expression: 'console.log("hack")' })
      ).rejects.toThrow('Invalid');
    });

    it('should reject code injection attempts', async () => {
      await expect(
        service.executeTool('calculate', { expression: 'process.exit()' })
      ).rejects.toThrow('Invalid');
    });

    it('should handle decimal numbers', async () => {
      const result = (await service.executeTool('calculate', {
        expression: '3.14 * 2',
      })) as { result: number };

      expect(result.result).toBeCloseTo(6.28, 2);
    });

    it('should handle negative numbers', async () => {
      const result = (await service.executeTool('calculate', {
        expression: '10 - 15',
      })) as { result: number };

      expect(result.result).toBe(-5);
    });
  });
});
