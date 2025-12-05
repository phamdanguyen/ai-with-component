import { Tool, ToolResult } from './types';
export declare class ToolExecutor {
    execute(tool: Tool, params: Record<string, any>, timeoutMs?: number): Promise<ToolResult>;
    private validateParams;
    private executeWithTimeout;
}
//# sourceMappingURL=tool-executor.d.ts.map