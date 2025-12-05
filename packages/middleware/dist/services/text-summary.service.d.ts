/**
 * TextSummaryService
 *
 * Fast text summary generation for dual-request architecture
 * Uses Gemini Flash for speed
 *
 * Purpose: Generate 2-3 sentence summaries with insights and recommendations
 * Model: Gemini Flash (fast, cheap)
 * Temperature: 0.7 (balanced)
 *
 * Pattern: Specialized service (SRP - Single Responsibility Principle)
 */
import type { ITextGenerator } from './interfaces';
import type { ToolCallResult, ChatMessage } from '../types/core.types';
export declare class TextSummaryService {
    private textGenerator;
    private readonly serviceName;
    private classifier;
    constructor(textGenerator: ITextGenerator);
    /**
     * Generate text summary from user query and tool results
     *
     * @param userQuery - Original user question
     * @param toolResults - Results from tool execution
     * @param context - Optional conversation context
     * @returns Text summary (2-3 sentences)
     */
    generateSummary(userQuery: string, toolResults: ToolCallResult[], context?: ChatMessage[]): Promise<string>;
    /**
     * Generate text summary with streaming (Phase 2 enhancement)
     * Streams text chunks in real-time to client
     *
     * @param userQuery - Original user question
     * @param toolResults - Results from tool execution
     * @param context - Optional conversation context
     * @param onChunk - Callback function for each text chunk
     * @returns Complete text summary after streaming finishes
     */
    generateSummaryStreaming(userQuery: string, toolResults: ToolCallResult[], context: ChatMessage[], onChunk: (chunk: string) => void): Promise<string>;
    /**
     * Build prompt for text summary based on query type
     * Week 3: Query-specific prompts for better accuracy
     */
    private buildSummaryPromptForType;
    /**
     * Get appropriate temperature based on query type
     * Lower temperature = more deterministic
     * Higher temperature = more creative
     */
    private getTemperatureForType;
    /**
     * Generate unique request ID for tracking
     */
    private generateRequestId;
}
//# sourceMappingURL=text-summary.service.d.ts.map