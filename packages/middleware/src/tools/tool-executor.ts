
import { Tool, ToolResult } from './types';

export class ToolExecutor {
    async execute(tool: Tool, params: Record<string, any>, timeoutMs: number = 10000): Promise<ToolResult> {
        const startTime = Date.now();

        // 1. Validate parameters
        const validationError = this.validateParams(tool, params);
        if (validationError) {
            return {
                success: false,
                error: validationError,
                executionTime: 0
            };
        }

        try {
            // 2. Execute with timeout
            const result = await this.executeWithTimeout(tool, params, timeoutMs);

            // Ensure executionTime is set if not provided by tool or if we want to enforce our measurement
            if (result.executionTime === undefined || result.executionTime === 0) {
                result.executionTime = Date.now() - startTime;
            }
            return result;

        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Execution failed',
                executionTime: Date.now() - startTime
            };
        }
    }

    private validateParams(tool: Tool, params: Record<string, any>): string | null {
        for (const param of tool.parameters) {
            if (param.required) {
                if (params[param.name] === undefined || params[param.name] === null) {
                    return `Missing required parameter: ${param.name}`;
                }
            }
            // TODO: Add type checking logic here
        }
        return null;
    }

    private async executeWithTimeout(tool: Tool, params: Record<string, any>, timeoutMs: number): Promise<ToolResult> {
        let timer: NodeJS.Timeout;

        const timeoutPromise = new Promise<ToolResult>((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });

        try {
            const result = await Promise.race([
                tool.execute(params),
                timeoutPromise
            ]);
            clearTimeout(timer!);
            return result;
        } catch (error) {
            clearTimeout(timer!);
            throw error;
        }
    }
}
