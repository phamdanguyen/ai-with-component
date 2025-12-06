/**
 * DualRequestHandler
 *
 * Core orchestrator for 2-request architecture
 * Coordinates all services to generate both text summary and component spec in parallel
 *
 * Workflow (10 steps - adapted from Odoo AI Chat pattern):
 * 1. Parse user request
 * 2. Load conversation context (TODO: Phase 2)
 * 3. Select relevant tools
 * 4. Execute tools ONCE (with caching)
 * 5. PARALLEL generation:
 *    5a. Text summary (Gemini Flash)
 *    5b. Component spec (Gemini Pro)
 * 6. Validate outputs
 * 7. Execute output actions (TODO: Phase 4)
 * 8. Update conversation memory (TODO: Phase 2)
 * 9. Return dual response
 * 10. Log metrics
 *
 * SOLID Principles:
 * - Dependency Injection: All services injected via constructor
 * - Single Responsibility: Orchestration only, delegates to services
 * - Open/Closed: Easy to extend without modification
 *
 * Pattern learned from: Odoo AI Chat - ai_agent_service.py process_chat_message()
 */
import type { IToolCaller, ITextGenerator, IStructuredGenerator } from '../services/interfaces';
import type { DualResponse, RequestContext, StreamChunk } from '../types/core.types';
import type { SessionManagementService } from '../services/session-management.service';
import { ResponseCacheService } from '../services/ResponseCacheService';
export declare class DualRequestHandler {
    private toolExecutor;
    private sessionManagement?;
    private responseCache?;
    private textSummaryService;
    private componentGenerationService;
    constructor(textGenerator: ITextGenerator, componentGenerator: IStructuredGenerator, toolExecutor: IToolCaller, sessionManagement?: SessionManagementService | undefined, responseCache?: ResponseCacheService | undefined);
    /**
     * Main entry point: Process user request and return dual response
     *
     * @param context - Request context with user message and options
     * @returns DualResponse with text summary and component spec
     */
    handle(context: RequestContext): Promise<DualResponse>;
    /**
     * Streaming entry point: Process request and stream results to client
     * Sends text chunks in real-time, component spec when ready
     *
     * @param context - Request context with user message and options
     * @param onChunk - Callback to send each chunk to client
     * @returns Complete DualResponse after streaming finishes
     */
    handleStream(context: RequestContext, onChunk: (chunk: StreamChunk) => void): Promise<DualResponse>;
    /**
     * Execute tools based on user query
     * Simple implementation - can be enhanced with AI-powered tool selection
     */
    private executeTools;
    /**
     * Infer tool arguments from user query
     * Simple implementation - in production, LLM would provide arguments
     */
    /**
     * Infer tool arguments from user query (Enriched for Odoo Tools)
     */
    private inferToolArgs;
    private removeKeywords;
    /**
     * Format tool results for response
     */
    private formatToolResults;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
    /**
     * Classify error type for metrics
     */
    private classifyError;
}
//# sourceMappingURL=dual-request-handler.d.ts.map