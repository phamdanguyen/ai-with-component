import { Tool, ToolRegistryInterface, ToolResult } from './types';
export declare class ToolRegistry implements ToolRegistryInterface {
    private static instance;
    private tools;
    private executor;
    private constructor();
    static getInstance(): ToolRegistry;
    register(tool: Tool): void;
    unregister(name: string): void;
    get(name: string): Tool | undefined;
    list(): Tool[];
    execute(name: string, params: Record<string, any>): Promise<ToolResult>;
}
//# sourceMappingURL=tool-registry.d.ts.map