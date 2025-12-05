/**
 * IToolCaller Interface
 *
 * Purpose: Tool registry, selection, and execution
 * Use Case: Execute tools (database queries, API calls, etc.) with caching
 *
 * SOLID Principle: Interface Segregation Principle (ISP)
 * - Separate interface for tool management
 * - Single responsibility: tool calling only
 *
 * Pattern learned from: Odoo AI Chat - ToolService (tool registry + caching)
 */
export interface IToolCaller {
    /**
     * Register a new tool
     *
     * @param tool - Tool definition
     */
    registerTool(tool: ToolDefinition): void;
    /**
     * Get all registered tools
     *
     * @returns Array of tool definitions
     */
    getTools(): ToolDefinition[];
    /**
     * Execute a tool by name
     *
     * @param name - Tool name
     * @param args - Tool arguments
     * @returns Tool execution result
     */
    executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
    /**
     * Select relevant tools based on query
     * (AI-powered tool selection - learned from Odoo)
     *
     * @param query - User query
     * @returns Array of relevant tool definitions
     */
    selectTools(query: string): ToolDefinition[];
}
/**
 * Tool Definition
 * Matches OpenAI function calling format
 */
export interface ToolDefinition {
    /**
     * Tool name (unique identifier)
     */
    name: string;
    /**
     * Human-readable description
     * AI uses this to decide when to call the tool
     */
    description: string;
    /**
     * Parameter schema (JSON Schema format)
     */
    parameters: {
        type: 'object';
        properties: Record<string, JSONSchemaProperty>;
        required?: string[];
    };
    /**
     * Execution function
     */
    execute: (args: Record<string, unknown>) => Promise<unknown>;
    /**
     * Optional: Enable caching for this tool
     * Default: true
     */
    cacheable?: boolean;
    /**
     * Optional: Cache TTL in milliseconds
     * Default: 300000 (5 minutes)
     */
    cacheTTL?: number;
}
export interface JSONSchemaProperty {
    type: string;
    description?: string;
    enum?: (string | number)[];
    default?: unknown;
    items?: JSONSchemaProperty;
}
/**
 * Tool Execution Result
 * Standardized result format for tool execution
 */
export interface ToolExecutionResult {
    success: boolean;
    data?: unknown;
    error?: string;
    executionTime: number;
    cached: boolean;
}
/**
 * Tool Execution Options
 */
export interface ToolExecutionOptions {
    timeout?: number;
    validateParams?: boolean;
}
//# sourceMappingURL=IToolCaller.d.ts.map