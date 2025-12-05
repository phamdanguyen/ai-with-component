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
import type { IToolCaller, ToolDefinition, ToolExecutionResult, ToolExecutionOptions } from './interfaces';
export declare class ToolExecutionError extends Error {
    readonly toolName: string;
    readonly code: 'NOT_FOUND' | 'TIMEOUT' | 'VALIDATION' | 'EXECUTION';
    constructor(message: string, toolName: string, code: 'NOT_FOUND' | 'TIMEOUT' | 'VALIDATION' | 'EXECUTION');
}
export declare class ToolExecutionService implements IToolCaller {
    private registry;
    private cache;
    private defaultTimeout;
    constructor(options?: {
        maxCacheSize?: number;
        cacheTTL?: number;
        defaultTimeout?: number;
    });
    /**
     * Register a new tool
     */
    registerTool(tool: ToolDefinition): void;
    /**
     * Get all registered tools
     */
    getTools(): ToolDefinition[];
    /**
     * Execute a tool by name (with caching, timeout, validation)
     */
    executeTool(name: string, args: Record<string, unknown>, options?: ToolExecutionOptions): Promise<unknown>;
    /**
     * Execute tool with standardized result format
     */
    executeToolSafe(name: string, args: Record<string, unknown>, options?: ToolExecutionOptions): Promise<ToolExecutionResult>;
    /**
     * Execute tool with timeout protection
     */
    private executeWithTimeout;
    /**
     * Validate tool parameters against schema
     */
    private validateParameters;
    /**
     * Select relevant tools based on query
     * Simple keyword matching for now - can be enhanced with AI
     *
     * Pattern learned from: Odoo's AI-powered tool selection
     */
    selectTools(query: string): ToolDefinition[];
    /**
     * Generate cache key from tool name and arguments
     */
    private getCacheKey;
    /**
     * Clear cache (for testing/debugging)
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        max: number;
        ttl: number;
    };
}
/**
 * Built-in Tools
 * Example tools that can be registered
 */
export declare const BUILTIN_TOOLS: ToolDefinition[];
//# sourceMappingURL=tool-execution.service.d.ts.map