import { Tool, ToolRegistryInterface, ToolResult } from './types';
import { ToolExecutor } from './tool-executor';

export class ToolRegistry implements ToolRegistryInterface {
    private static instance: ToolRegistry;
    private tools: Map<string, Tool> = new Map();
    private executor: ToolExecutor;

    private constructor() {
        this.executor = new ToolExecutor();
    }

    public static getInstance(): ToolRegistry {
        if (!ToolRegistry.instance) {
            ToolRegistry.instance = new ToolRegistry();
        }
        return ToolRegistry.instance;
    }

    register(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            console.warn(`[ToolRegistry] Tool ${tool.name} is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
    }

    unregister(name: string): void {
        if (this.tools.has(name)) {
            this.tools.delete(name);
        }
    }

    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    list(): Tool[] {
        return Array.from(this.tools.values());
    }

    async execute(name: string, params: Record<string, any>): Promise<ToolResult> {
        const tool = this.get(name);
        if (!tool) {
            return {
                success: false,
                error: `Tool ${name} not found`,
                executionTime: 0
            };
        }

        return this.executor.execute(tool, params);
    }
}
