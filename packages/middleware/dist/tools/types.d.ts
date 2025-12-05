export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    description: string;
    required: boolean;
    default?: any;
}
export interface Tool {
    name: string;
    description: string;
    parameters: ToolParameter[];
    execute: (params: Record<string, any>) => Promise<ToolResult>;
}
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
}
export interface ToolRegistryInterface {
    register(tool: Tool): void;
    unregister(name: string): void;
    get(name: string): Tool | undefined;
    list(): Tool[];
    execute(name: string, params: Record<string, any>): Promise<ToolResult>;
}
//# sourceMappingURL=types.d.ts.map