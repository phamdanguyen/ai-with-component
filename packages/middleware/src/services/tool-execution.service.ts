/**
 * ToolExecutionService
 *
 * Tool registry, selection, and execution with LRU caching
 *
 * Pattern learned from: Odoo AI Chat - ToolService
 * Key features:
 * - Tool registry (register, get, select)
 * - LRU cache for tool results (5min TTL)
 * - AI-powered tool selection (based on query relevance)
 * - Timeout support for tool execution
 * - Parameter validation
 *
 * SOLID: Implements IToolCaller interface
 */

import { LRUCache } from 'lru-cache';
import type {
  IToolCaller,
  ToolDefinition,
  ToolExecutionResult,
  ToolExecutionOptions,
} from './interfaces';

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly code: 'NOT_FOUND' | 'TIMEOUT' | 'VALIDATION' | 'EXECUTION'
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

export class ToolExecutionService implements IToolCaller {
  private registry: Map<string, ToolDefinition> = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache: LRUCache<string, any>;
  private defaultTimeout: number;

  constructor(
    options: {
      maxCacheSize?: number;
      cacheTTL?: number;
      defaultTimeout?: number;
    } = {}
  ) {
    // Initialize LRU cache (learned from Odoo pattern)
    this.cache = new LRUCache<string, any>({
      max: options.maxCacheSize || 100,
      ttl: options.cacheTTL || 300000, // 5 minutes default
    });
    this.defaultTimeout = options.defaultTimeout || DEFAULT_TIMEOUT;
  }

  /**
   * Register a new tool
   */
  registerTool(tool: ToolDefinition): void {
    this.registry.set(tool.name, tool);
  }

  /**
   * Get all registered tools
   */
  getTools(): ToolDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Execute a tool by name (with caching, timeout, validation)
   */
  async executeTool(
    name: string,
    args: Record<string, unknown>,
    options: ToolExecutionOptions = {}
  ): Promise<unknown> {
    const tool = this.registry.get(name);
    if (!tool) {
      throw new ToolExecutionError(
        `Tool not found: ${name}`,
        name,
        'NOT_FOUND'
      );
    }

    // Validate parameters if enabled (default: true)
    if (options.validateParams !== false) {
      this.validateParameters(tool, args);
    }

    // Check cache first (if tool is cacheable)
    const cacheable = tool.cacheable !== false; // Default: true
    if (cacheable) {
      const cacheKey = this.getCacheKey(name, args);
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Execute tool with timeout
    const timeout = options.timeout || this.defaultTimeout;
    const result = await this.executeWithTimeout(tool, args, timeout);

    // Cache result (if cacheable)
    if (cacheable) {
      const cacheKey = this.getCacheKey(name, args);
      this.cache.set(cacheKey, result, {
        ttl: tool.cacheTTL || 300000,
      });
    }

    return result;
  }

  /**
   * Execute tool with standardized result format
   */
  async executeToolSafe(
    name: string,
    args: Record<string, unknown>,
    options: ToolExecutionOptions = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    let cached = false;

    try {
      const tool = this.registry.get(name);
      if (!tool) {
        return {
          success: false,
          error: `Tool not found: ${name}`,
          executionTime: Date.now() - startTime,
          cached: false,
        };
      }

      // Check cache
      const cacheable = tool.cacheable !== false;
      if (cacheable) {
        const cacheKey = this.getCacheKey(name, args);
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult !== undefined) {
          cached = true;
          return {
            success: true,
            data: cachedResult,
            executionTime: Date.now() - startTime,
            cached: true,
          };
        }
      }

      // Validate and execute
      if (options.validateParams !== false) {
        this.validateParameters(tool, args);
      }

      const timeout = options.timeout || this.defaultTimeout;
      const result = await this.executeWithTimeout(tool, args, timeout);

      // Cache result
      if (cacheable) {
        const cacheKey = this.getCacheKey(name, args);
        this.cache.set(cacheKey, result, { ttl: tool.cacheTTL || 300000 });
      }

      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        cached: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        cached,
      };
    }
  }

  /**
   * Execute tool with timeout protection
   */
  private async executeWithTimeout(
    tool: ToolDefinition,
    args: Record<string, unknown>,
    timeout: number
  ): Promise<unknown> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new ToolExecutionError(
            `Tool execution timed out after ${timeout}ms`,
            tool.name,
            'TIMEOUT'
          )
        );
      }, timeout);
    });

    try {
      return await Promise.race([tool.execute(args), timeoutPromise]);
    } catch (error) {
      if (error instanceof ToolExecutionError) {
        throw error;
      }
      throw new ToolExecutionError(
        error instanceof Error ? error.message : 'Execution failed',
        tool.name,
        'EXECUTION'
      );
    }
  }

  /**
   * Validate tool parameters against schema
   */
  private validateParameters(
    tool: ToolDefinition,
    args: Record<string, unknown>
  ): void {
    const { parameters } = tool;

    // Check required parameters
    if (parameters.required) {
      for (const requiredParam of parameters.required) {
        if (args[requiredParam] === undefined || args[requiredParam] === null) {
          throw new ToolExecutionError(
            `Missing required parameter: ${requiredParam}`,
            tool.name,
            'VALIDATION'
          );
        }
      }
    }

    // Validate parameter types
    for (const [paramName, paramValue] of Object.entries(args)) {
      const schema = parameters.properties[paramName];
      if (!schema) continue; // Unknown params allowed

      // Type validation
      if (schema.type === 'string' && typeof paramValue !== 'string') {
        throw new ToolExecutionError(
          `Parameter '${paramName}' must be a string`,
          tool.name,
          'VALIDATION'
        );
      }
      if (schema.type === 'number' && typeof paramValue !== 'number') {
        throw new ToolExecutionError(
          `Parameter '${paramName}' must be a number`,
          tool.name,
          'VALIDATION'
        );
      }
      if (schema.type === 'boolean' && typeof paramValue !== 'boolean') {
        throw new ToolExecutionError(
          `Parameter '${paramName}' must be a boolean`,
          tool.name,
          'VALIDATION'
        );
      }

      // Enum validation
      if (schema.enum && !schema.enum.includes(paramValue as string | number)) {
        throw new ToolExecutionError(
          `Parameter '${paramName}' must be one of: ${schema.enum.join(', ')}`,
          tool.name,
          'VALIDATION'
        );
      }
    }
  }

  /**
   * Select relevant tools based on query
   * Simple keyword matching for now - can be enhanced with AI
   *
   * Pattern learned from: Odoo's AI-powered tool selection
   */
  selectTools(query: string): ToolDefinition[] {
    const queryLower = query.toLowerCase();
    const tools = this.getTools();

    // Score each tool based on relevance
    const scored = tools.map((tool) => {
      let score = 0;

      // Check tool name
      if (queryLower.includes(tool.name.toLowerCase())) {
        score += 10;
      }

      // Check tool description
      const descWords = tool.description.toLowerCase().split(/\s+/);
      const queryWords = queryLower.split(/\s+/);

      for (const queryWord of queryWords) {
        for (const descWord of descWords) {
          if (descWord.includes(queryWord) || queryWord.includes(descWord)) {
            score += 1;
          }
        }
      }

      return { tool, score };
    });

    // Return tools with score > 0, sorted by score
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.tool);
  }

  /**
   * Generate cache key from tool name and arguments
   */
  private getCacheKey(name: string, args: Record<string, unknown>): string {
    return `${name}:${JSON.stringify(args)}`;
  }

  /**
   * Clear cache (for testing/debugging)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    max: number;
    ttl: number;
  } {
    return {
      size: this.cache.size,
      max: this.cache.max,
      ttl: this.cache.ttl || 0,
    };
  }
}

/**
 * Safe math expression evaluator
 * Only allows numbers and basic operators
 */
function safeMathEval(expression: string): number {
  // Remove whitespace
  const expr = expression.replace(/\s+/g, '');

  // Validate: only allow numbers, operators, parentheses, decimal points
  if (!/^[\d+\-*/().]+$/.test(expr)) {
    throw new Error('Invalid characters in expression');
  }

  // Validate: no empty parentheses or consecutive operators
  if (/\(\)/.test(expr) || /[+\-*/]{2,}/.test(expr)) {
    throw new Error('Invalid expression syntax');
  }

  // Use Function constructor for safer evaluation than eval
  try {
    const fn = new Function(`return (${expr})`);
    const result = fn();
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Result is not a valid number');
    }
    return result;
  } catch {
    throw new Error('Failed to evaluate expression');
  }
}

/**
 * Built-in Tools
 * Example tools that can be registered
 */
export const BUILTIN_TOOLS: ToolDefinition[] = [
  {
    name: 'get_current_date',
    description: 'Get the current date and time',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'Date format (iso, full, short)',
          enum: ['iso', 'full', 'short'],
          default: 'iso',
        },
      },
      required: [],
    },
    execute: async (args) => {
      const format = (args.format as string) || 'iso';
      const now = new Date();

      switch (format) {
        case 'iso':
          return now.toISOString();
        case 'full':
          return now.toLocaleString();
        case 'short':
          return now.toLocaleDateString();
        default:
          return now.toISOString();
      }
    },
    cacheable: true,
    cacheTTL: 60000, // 1 minute
  },

  {
    name: 'calculate',
    description: 'Perform basic mathematical calculations (+, -, *, /, parentheses)',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate (e.g., "2 + 2", "(5 * 3) / 2")',
        },
      },
      required: ['expression'],
    },
    execute: async (args) => {
      const expr = args.expression as string;
      try {
        const result = safeMathEval(expr);
        return { expression: expr, result };
      } catch (error) {
        throw new Error(
          `Invalid expression: ${expr}. ${error instanceof Error ? error.message : ''}`
        );
      }
    },
    cacheable: true,
  },

  {
    name: 'get_weather',
    description: 'Get current weather for a city (mock data)',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name (e.g., "Tokyo", "New York", "London")',
        },
        unit: {
          type: 'string',
          description: 'Temperature unit',
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius',
        },
      },
      required: ['city'],
    },
    execute: async (args) => {
      const city = args.city as string;
      const unit = (args.unit as string) || 'celsius';

      // Mock weather data based on city
      const weatherData: Record<
        string,
        { temp: number; condition: string; humidity: number }
      > = {
        tokyo: { temp: 22, condition: 'Partly Cloudy', humidity: 65 },
        'new york': { temp: 18, condition: 'Sunny', humidity: 50 },
        london: { temp: 14, condition: 'Rainy', humidity: 80 },
        paris: { temp: 16, condition: 'Cloudy', humidity: 70 },
        sydney: { temp: 28, condition: 'Sunny', humidity: 45 },
        seoul: { temp: 20, condition: 'Clear', humidity: 55 },
        hanoi: { temp: 30, condition: 'Hot', humidity: 75 },
        'ho chi minh': { temp: 32, condition: 'Sunny', humidity: 70 },
      };

      const cityLower = city.toLowerCase();
      const data = weatherData[cityLower] || {
        temp: 20,
        condition: 'Unknown',
        humidity: 60,
      };

      const temperature =
        unit === 'fahrenheit' ? Math.round(data.temp * 1.8 + 32) : data.temp;

      return {
        city,
        temperature,
        unit,
        condition: data.condition,
        humidity: data.humidity,
        timestamp: new Date().toISOString(),
      };
    },
    cacheable: true,
    cacheTTL: 300000, // 5 minutes
  },

  {
    name: 'translate',
    description: 'Translate text between languages (mock translation)',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to translate',
        },
        from: {
          type: 'string',
          description: 'Source language code',
          enum: ['en', 'vi', 'ja', 'ko', 'zh'],
          default: 'en',
        },
        to: {
          type: 'string',
          description: 'Target language code',
          enum: ['en', 'vi', 'ja', 'ko', 'zh'],
          default: 'vi',
        },
      },
      required: ['text'],
    },
    execute: async (args) => {
      const text = args.text as string;
      const from = (args.from as string) || 'en';
      const to = (args.to as string) || 'vi';

      // Mock translation (in production, use actual translation API)
      const mockTranslations: Record<string, Record<string, string>> = {
        hello: { vi: 'Xin chào', ja: 'こんにちは', ko: '안녕하세요', zh: '你好' },
        goodbye: { vi: 'Tạm biệt', ja: 'さようなら', ko: '안녕히 가세요', zh: '再见' },
        'thank you': { vi: 'Cảm ơn', ja: 'ありがとう', ko: '감사합니다', zh: '谢谢' },
      };

      const textLower = text.toLowerCase();
      const translation = mockTranslations[textLower]?.[to] || `[${to}] ${text}`;

      return {
        original: text,
        translated: translation,
        from,
        to,
      };
    },
    cacheable: true,
  },
];
