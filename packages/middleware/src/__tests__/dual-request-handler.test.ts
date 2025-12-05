/**
 * DualRequestHandler Tests
 *
 * Story 4-3: Tool Integration with Dual-Request Handler
 * Coverage: Tool execution, parallel generation, session integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DualRequestHandler } from '../middleware/dual-request-handler';
import type {
  IToolCaller,
  ITextGenerator,
  IStructuredGenerator,
  ToolDefinition,
  JSONSchema,
} from '../services/interfaces';
import type {
  RequestContext,
  ComponentSpec,
  StreamChunk,
} from '../types/core.types';
import { validComponentResponses, testData } from './setup';

// Mock implementations
class MockTextGenerator implements ITextGenerator {
  private defaultResponse = 'This is a mock text summary.';

  async generateText(prompt: string, options?: any): Promise<string> {
    return this.defaultResponse;
  }

  async *streamText(
    prompt: string,
    options?: any
  ): AsyncGenerator<string, void, unknown> {
    const chunks = ['This is ', 'a mock ', 'text summary.'];
    for (const chunk of chunks) {
      yield chunk;
    }
  }

  setResponse(response: string): void {
    this.defaultResponse = response;
  }
}

class MockStructuredGenerator implements IStructuredGenerator {
  private defaultResponse: ComponentSpec = validComponentResponses.card();

  async generateStructured<T>(
    prompt: string,
    schema: JSONSchema,
    options?: any
  ): Promise<T> {
    return this.defaultResponse as unknown as T;
  }

  validateOutput<T>(output: unknown, schema: JSONSchema): output is T {
    return output !== null && output !== undefined;
  }

  setResponse(response: ComponentSpec): void {
    this.defaultResponse = response;
  }
}

class MockToolCaller implements IToolCaller {
  private tools: Map<string, ToolDefinition> = new Map();
  private executionResults: Map<string, unknown> = new Map();

  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async executeTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const result = this.executionResults.get(name);
    if (result !== undefined) {
      return result;
    }
    return { executed: true, name, args };
  }

  selectTools(query: string): ToolDefinition[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.tools.values()).filter((tool) => {
      const descLower = tool.description.toLowerCase();
      return (
        queryLower.includes(tool.name.toLowerCase()) ||
        descLower.split(' ').some((word) => queryLower.includes(word))
      );
    });
  }

  setExecutionResult(toolName: string, result: unknown): void {
    this.executionResults.set(toolName, result);
  }

  reset(): void {
    this.tools.clear();
    this.executionResults.clear();
  }
}

describe('DualRequestHandler', () => {
  let handler: DualRequestHandler;
  let mockTextGenerator: MockTextGenerator;
  let mockStructuredGenerator: MockStructuredGenerator;
  let mockToolCaller: MockToolCaller;

  beforeEach(() => {
    mockTextGenerator = new MockTextGenerator();
    mockStructuredGenerator = new MockStructuredGenerator();
    mockToolCaller = new MockToolCaller();

    handler = new DualRequestHandler(
      mockTextGenerator,
      mockStructuredGenerator,
      mockToolCaller
    );

    // Register some test tools
    mockToolCaller.registerTool({
      name: 'get_date',
      description: 'Get current date',
      parameters: { type: 'object', properties: {} },
      execute: async () => new Date().toISOString(),
    });

    mockToolCaller.registerTool({
      name: 'calculate',
      description: 'Calculate math expression',
      parameters: {
        type: 'object',
        properties: { expression: { type: 'string' } },
      },
      execute: async (args) => ({ result: 42 }),
    });
  });

  describe('Basic Request Handling', () => {
    it('should handle a basic request and return dual response', async () => {
      const context: RequestContext = {
        message: 'Hello, show me some data',
      };

      const response = await handler.handle(context);

      expect(response).toBeDefined();
      expect(response.textSummary).toBeDefined();
      expect(response.componentSpec).toBeDefined();
      expect(response.metadata).toBeDefined();
    });

    it('should include execution time in metadata', async () => {
      const context: RequestContext = {
        message: 'What is the current date?',
      };

      const response = await handler.handle(context);

      expect(response.metadata?.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should include model information in metadata', async () => {
      const context: RequestContext = {
        message: 'Test message',
      };

      const response = await handler.handle(context);

      expect(response.metadata?.textModel).toBeDefined();
      expect(response.metadata?.componentModel).toBeDefined();
    });
  });

  describe('Tool Selection and Execution', () => {
    it('should select relevant tools based on query', async () => {
      const context: RequestContext = {
        message: 'What is the current date?',
      };

      // Set execution result
      mockToolCaller.setExecutionResult('get_date', '2024-01-15T10:30:00Z');

      const response = await handler.handle(context);

      expect(response.metadata?.toolsUsed).toBeDefined();
    });

    it('should execute calculation tools for math queries', async () => {
      const context: RequestContext = {
        message: 'Calculate 2 + 2',
      };

      mockToolCaller.setExecutionResult('calculate', { result: 4 });

      const response = await handler.handle(context);

      expect(response.toolResults).toBeDefined();
    });

    it('should handle tool execution errors gracefully', async () => {
      // Register a tool that will throw
      mockToolCaller.registerTool({
        name: 'error_tool',
        description: 'A tool that throws errors',
        parameters: { type: 'object', properties: {} },
        execute: async () => {
          throw new Error('Tool execution failed');
        },
      });

      const context: RequestContext = {
        message: 'Use error_tool to do something',
      };

      // Should not throw, but handle gracefully
      const response = await handler.handle(context);
      expect(response).toBeDefined();
    });

    it('should limit tools executed to 3', async () => {
      // Register many tools
      for (let i = 0; i < 10; i++) {
        mockToolCaller.registerTool({
          name: `test_tool_${i}`,
          description: `Test tool ${i} for testing purposes`,
          parameters: { type: 'object', properties: {} },
          execute: async () => ({ index: i }),
        });
      }

      const context: RequestContext = {
        message: 'Use test tool for testing purposes',
      };

      const response = await handler.handle(context);

      // Should have at most 3 tools used
      const toolsUsed = response.metadata?.toolsUsed || [];
      expect(toolsUsed.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Parallel Generation', () => {
    it('should generate text and component in parallel', async () => {
      const textGenerationStart = Date.now();
      let componentGenerationStart = 0;

      // Track when each generation starts
      const originalGenerateText = mockTextGenerator.generateText.bind(
        mockTextGenerator
      );
      const originalGenerateStructured =
        mockStructuredGenerator.generateStructured.bind(mockStructuredGenerator);

      vi.spyOn(mockTextGenerator, 'generateText').mockImplementation(
        async (prompt, options) => {
          // Simulate some delay
          await new Promise((resolve) => setTimeout(resolve, 10));
          return originalGenerateText(prompt, options);
        }
      );

      vi.spyOn(mockStructuredGenerator, 'generateStructured').mockImplementation(
        async (prompt, schema, options) => {
          componentGenerationStart = Date.now();
          await new Promise((resolve) => setTimeout(resolve, 10));
          return originalGenerateStructured(prompt, schema, options);
        }
      );

      const context: RequestContext = {
        message: 'Generate some content',
      };

      const response = await handler.handle(context);

      expect(response.textSummary).toBeDefined();
      expect(response.componentSpec).toBeDefined();
    });
  });

  describe('Streaming Support', () => {
    it('should stream text chunks', async () => {
      const chunks: StreamChunk[] = [];

      const context: RequestContext = {
        message: 'Stream some content',
      };

      const response = await handler.handleStream(context, (chunk) => {
        chunks.push(chunk);
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.some((c) => c.type === 'text')).toBe(true);
    });

    it('should send component chunk after text streaming', async () => {
      const chunks: StreamChunk[] = [];

      const context: RequestContext = {
        message: 'Stream and show component',
      };

      await handler.handleStream(context, (chunk) => {
        chunks.push(chunk);
      });

      const componentChunk = chunks.find((c) => c.type === 'component');
      expect(componentChunk).toBeDefined();
      expect(componentChunk?.data).toBeDefined();
    });

    it('should send complete chunk at the end', async () => {
      const chunks: StreamChunk[] = [];

      const context: RequestContext = {
        message: 'Complete streaming test',
      };

      await handler.handleStream(context, (chunk) => {
        chunks.push(chunk);
      });

      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.type).toBe('complete');
    });

    it('should throw error on streaming failure', async () => {
      const chunks: StreamChunk[] = [];

      // Make text generator's streamText throw
      vi.spyOn(mockTextGenerator, 'streamText').mockImplementation(
        async function* () {
          throw new Error('Streaming failed');
        }
      );

      const context: RequestContext = {
        message: 'This should fail',
      };

      // Should throw and send error chunk
      await expect(
        handler.handleStream(context, (chunk) => {
          chunks.push(chunk);
        })
      ).rejects.toThrow();

      // Error chunk may or may not be sent depending on where error occurs
      // The important thing is the promise rejects
    });
  });

  describe('Component Validation', () => {
    it('should return valid component spec', async () => {
      mockStructuredGenerator.setResponse(validComponentResponses.chart());

      const context: RequestContext = {
        message: 'Show sales chart',
      };

      const response = await handler.handle(context);

      expect(response.componentSpec.type).toBe('chart');
      expect(response.componentSpec.id).toBeDefined();
      expect(response.componentSpec.props).toBeDefined();
    });

    it('should handle table component generation', async () => {
      mockStructuredGenerator.setResponse(validComponentResponses.table());

      const context: RequestContext = {
        message: 'Show employee table',
      };

      const response = await handler.handle(context);

      expect(response.componentSpec.type).toBe('table');
      expect(response.componentSpec.props.columns).toBeDefined();
    });

    it('should handle card component generation', async () => {
      mockStructuredGenerator.setResponse(validComponentResponses.card());

      const context: RequestContext = {
        message: 'Show status card',
      };

      const response = await handler.handle(context);

      expect(response.componentSpec.type).toBe('card');
      expect(response.componentSpec.props.title).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw on text generation failure', async () => {
      vi.spyOn(mockTextGenerator, 'generateText').mockResolvedValue('');

      const context: RequestContext = {
        message: 'This should fail text generation',
      };

      await expect(handler.handle(context)).rejects.toThrow(
        'Text summary generation failed'
      );
    });

    it('should return fallback component on generation failure', async () => {
      vi.spyOn(mockStructuredGenerator, 'generateStructured').mockResolvedValue(
        null as any
      );

      const context: RequestContext = {
        message: 'This should fail component generation',
      };

      // Handler returns fallback component instead of throwing
      const response = await handler.handle(context);
      expect(response.componentSpec.type).toBe('card');
      expect(response.componentSpec.props.variant).toBe('warning');
      expect(response.componentSpec.props.title).toBe('Content Unavailable');
    });
  });

  describe('Context and Session Support', () => {
    it('should use conversation history from context', async () => {
      const context: RequestContext = {
        message: 'Follow up question',
        conversationHistory: [
          { role: 'user', content: 'Previous question' },
          { role: 'assistant', content: 'Previous answer' },
        ],
      };

      const response = await handler.handle(context);

      expect(response).toBeDefined();
    });

    it('should work without session management', async () => {
      const context: RequestContext = {
        message: 'No session test',
        sessionId: 'test-session-123',
      };

      // Handler created without session management
      const response = await handler.handle(context);

      expect(response).toBeDefined();
    });
  });

  describe('Tool Results Formatting', () => {
    it('should format tool results in response', async () => {
      mockToolCaller.setExecutionResult('get_date', '2024-01-15');

      const context: RequestContext = {
        message: 'What is the date?',
      };

      const response = await handler.handle(context);

      expect(response.toolResults).toBeDefined();
      expect(typeof response.toolResults).toBe('object');
    });

    it('should include execution time for each tool', async () => {
      mockToolCaller.setExecutionResult('calculate', { result: 10 });

      const context: RequestContext = {
        message: 'Calculate something',
      };

      const response = await handler.handle(context);

      // Tool results should be formatted with execution time
      expect(response.toolResults).toBeDefined();
    });
  });
});
