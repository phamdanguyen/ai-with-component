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

import type {
  IToolCaller,
  ITextGenerator,
  IStructuredGenerator,
} from '../services/interfaces';
import type {
  DualResponse,
  RequestContext,
  ToolCallResult,
  StreamChunk,
  GenerationMetrics,
} from '../types/core.types';
import { TextSummaryService } from '../services/text-summary.service';
import { ComponentGenerationService } from '../services/component-generation.service';
import type { SessionManagementService } from '../services/session-management.service';
import { getMetricsService } from '../services/metrics.service';
import { getQueryClassifier } from '../services/query-classifier.service';
import { ResponseCacheService } from '../services/ResponseCacheService';

export class DualRequestHandler {
  private textSummaryService: TextSummaryService;
  private componentGenerationService: ComponentGenerationService;

  constructor(
    textGenerator: ITextGenerator,
    componentGenerator: IStructuredGenerator,
    private toolExecutor: IToolCaller,
    private sessionManagement?: SessionManagementService,
    private responseCache?: ResponseCacheService
  ) {
    // Initialize specialized services
    this.textSummaryService = new TextSummaryService(textGenerator);
    this.componentGenerationService = new ComponentGenerationService(
      componentGenerator
    );
  }

  /**
   * Main entry point: Process user request and return dual response
   *
   * @param context - Request context with user message and options
   * @returns DualResponse with text summary and component spec
   */
  async handle(context: RequestContext): Promise<DualResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Parse user request (already done in context)
      const userMessage = context.message;

      // Step 2: Load conversation context
      let conversationHistory = context.conversationHistory || [];

      // CHECK CACHE
      if (this.responseCache) {
        const cacheKey = this.responseCache.generateKey(userMessage, conversationHistory.map(m => m.content));
        const cachedResponse = await this.responseCache.getResponse<DualResponse>(cacheKey);

        if (cachedResponse) {
          console.log(`[Cache] HIT for query: "${userMessage}"`);

          // Log metrics for cache hit
          const metric: GenerationMetrics = {
            requestId: this.generateRequestId(),
            timestamp: startTime,
            sessionId: context.sessionId,
            userMessage: context.message,
            messageLength: context.message.length,
            queryType: 'cached',
            componentType: cachedResponse.componentSpec?.type || 'unknown',
            success: true,
            executionTime: Date.now() - startTime,
            retryCount: 0,
            textGenerationTime: 0,
            componentGenerationTime: 0,
            usedFallback: false,
            toolsUsed: cachedResponse.metadata?.toolsUsed,
            toolCount: 0,
            textModel: 'cache',
            componentModel: 'cache',
            isStreaming: false,
          };
          getMetricsService().recordMetric(metric);

          return cachedResponse;
        }
        console.log(`[Cache] MISS for query: "${userMessage}"`);
      }

      // If session management is available, load context from session
      if (this.sessionManagement && context.sessionId) {
        const contextWindow = await this.sessionManagement.getContextWindow(
          context.sessionId,
          5 // Context window size
        );
        conversationHistory = contextWindow;

        // Store user message in session
        await this.sessionManagement.addUserMessage(
          context.sessionId,
          userMessage
        );
      }

      // Step 3: Select relevant tools
      const relevantTools = this.toolExecutor.selectTools(userMessage);
      console.log(`Selected ${relevantTools.length} relevant tools`);

      // Step 4: Execute tools ONCE (with caching)
      const toolResults = await this.executeTools(relevantTools, userMessage);

      // Step 5: PARALLEL generation (THE CORE INNOVATION!)
      const [textSummary, componentSpec] = await Promise.all([
        // 5a. Text summary (fast)
        this.textSummaryService.generateSummary(
          userMessage,
          toolResults,
          conversationHistory
        ),

        // 5b. Component spec (accurate)
        this.componentGenerationService.generateComponent(
          userMessage,
          toolResults
        ),
      ]);

      // Step 6: Validate outputs
      if (!textSummary || textSummary.length === 0) {
        throw new Error('Text summary generation failed');
      }

      if (
        !componentSpec ||
        !this.componentGenerationService.validateComponent(componentSpec)
      ) {
        throw new Error('Component generation failed or invalid');
      }

      // Step 7: Execute output actions (TODO: Phase 4 - Action system)

      // Step 8: Update conversation memory (Phase 2 - Memory system)
      // Create DualResponse first for storage
      const response: DualResponse = {
        textSummary,
        componentSpec,
        toolResults: this.formatToolResults(toolResults),
        metadata: {
          textModel: 'gemini-2.0-flash',
          componentModel: 'gemini-2.0-flash',
          executionTime: Date.now() - startTime,
          toolsUsed: toolResults.map((r) => r.name),
        },
      };

      // Store assistant response in session if available
      if (this.sessionManagement && context.sessionId) {
        await this.sessionManagement.storeAssistantResponse(
          context.sessionId,
          response,
          response.toolResults
        );
      }

      // CACHE RESPONSE
      if (this.responseCache) {
        const cacheKey = this.responseCache.generateKey(userMessage, conversationHistory.map(m => m.content));
        await this.responseCache.cacheResponse(cacheKey, response);
        console.log(`[Cache] Saved response for query: "${userMessage}"`);
      }

      // Step 9: Return dual response

      // Step 10: Log metrics
      console.log(
        `Dual request completed in ${response.metadata?.executionTime}ms`
      );
      console.log(`Tools used: ${response.metadata?.toolsUsed.join(', ') || 'none'}`);
      if (context.sessionId) {
        console.log(`Session: ${context.sessionId}`);
      }

      // Classify query for metrics (Week 3 enhancement)
      const classifier = getQueryClassifier();
      const classification = await classifier.classify(context.message);

      // Record metrics for Week 3 analysis
      const metric: GenerationMetrics = {
        requestId: this.generateRequestId(),
        timestamp: startTime,
        sessionId: context.sessionId,
        userMessage: context.message,
        messageLength: context.message.length,
        queryType: classification.type,
        componentType: componentSpec.type,
        success: true,
        executionTime: response.metadata?.executionTime || 0,
        retryCount: 0,
        textGenerationTime: response.metadata?.executionTime,
        componentGenerationTime: response.metadata?.executionTime,
        usedFallback: false,
        toolsUsed: response.metadata?.toolsUsed,
        toolCount: toolResults.length,
        textModel: response.metadata?.textModel,
        componentModel: response.metadata?.componentModel,
        isStreaming: false,
      };
      getMetricsService().recordMetric(metric);

      return response;
    } catch (error) {
      // Error handling
      console.error('Dual request handler error:', error);

      // Record failed metric
      const metric: GenerationMetrics = {
        requestId: this.generateRequestId(),
        timestamp: startTime,
        sessionId: context.sessionId,
        userMessage: context.message,
        messageLength: context.message.length,
        queryType: 'unknown',
        success: false,
        failureReason: (error as Error).message,
        errorType: this.classifyError(error),
        executionTime: Date.now() - startTime,
        retryCount: 0,
        usedFallback: false,
      };
      getMetricsService().recordMetric(metric);

      throw error;
    }
  }

  /**
   * Streaming entry point: Process request and stream results to client
   * Sends text chunks in real-time, component spec when ready
   *
   * @param context - Request context with user message and options
   * @param onChunk - Callback to send each chunk to client
   * @returns Complete DualResponse after streaming finishes
   */
  async handleStream(
    context: RequestContext,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<DualResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Parse user request
      const userMessage = context.message;

      // Step 2: Load conversation context
      let conversationHistory = context.conversationHistory || [];

      // CHECK CACHE
      if (this.responseCache) {
        const cacheKey = this.responseCache.generateKey(userMessage, conversationHistory.map(m => m.content));
        const cachedResponse = await this.responseCache.getResponse<DualResponse>(cacheKey);

        if (cachedResponse) {
          console.log(`[Cache] HIT (Stream) for query: "${userMessage}"`);

          // Replay cached response as chunks
          if (cachedResponse.textSummary) {
            onChunk({
              type: 'text',
              data: cachedResponse.textSummary,
              timestamp: Date.now(),
              id: 'cache-text-0',
              metadata: { chunkIndex: 0, model: 'cache' }
            });
          }

          if (cachedResponse.componentSpec) {
            onChunk({
              type: 'component',
              data: cachedResponse.componentSpec,
              timestamp: Date.now(),
              id: 'cache-comp-0',
              metadata: { model: 'cache' }
            });
          }

          onChunk({
            type: 'complete',
            data: { totalChunks: 1, executionTime: Date.now() - startTime },
            timestamp: Date.now(),
            id: 'cache-done'
          });

          return cachedResponse;
        }
      }

      if (this.sessionManagement && context.sessionId) {
        const contextWindow = await this.sessionManagement.getContextWindow(
          context.sessionId,
          5
        );
        conversationHistory = contextWindow;

        await this.sessionManagement.addUserMessage(
          context.sessionId,
          userMessage
        );
      }

      // Step 3: Select relevant tools
      const relevantTools = this.toolExecutor.selectTools(userMessage);
      console.log(`Selected ${relevantTools.length} relevant tools`);

      // Step 4: Execute tools ONCE
      const toolResults = await this.executeTools(relevantTools, userMessage);

      // Step 5a: STREAM text summary
      let textSummary = '';
      const textChunkIndex = { current: 0 };

      textSummary = await this.textSummaryService.generateSummaryStreaming(
        userMessage,
        toolResults,
        conversationHistory,
        (chunk: string) => {
          // Send each text chunk to client
          const streamChunk: StreamChunk = {
            type: 'text',
            data: chunk,
            timestamp: Date.now(),
            id: `text-${textChunkIndex.current++}`,
            metadata: {
              chunkIndex: textChunkIndex.current - 1,
              model: 'gemini-2.0-flash',
            },
          };
          onChunk(streamChunk);
        }
      );

      // Step 5b: Generate component spec (in parallel after text starts)
      const componentSpec = await this.componentGenerationService.generateComponent(
        userMessage,
        toolResults
      );

      // Validate component
      if (
        !componentSpec ||
        !this.componentGenerationService.validateComponent(componentSpec)
      ) {
        throw new Error('Component generation failed or invalid');
      }

      // Send component chunk
      const componentChunk: StreamChunk = {
        type: 'component',
        data: componentSpec,
        timestamp: Date.now(),
        id: 'component-0',
        metadata: {
          model: 'gemini-2.0-flash',
        },
      };
      onChunk(componentChunk);

      // Create final response
      const response: DualResponse = {
        textSummary,
        componentSpec,
        toolResults: this.formatToolResults(toolResults),
        metadata: {
          textModel: 'gemini-2.0-flash',
          componentModel: 'gemini-2.0-flash',
          executionTime: Date.now() - startTime,
          toolsUsed: toolResults.map((r) => r.name),
        },
      };

      // Store in session if available
      if (this.sessionManagement && context.sessionId) {
        await this.sessionManagement.storeAssistantResponse(
          context.sessionId,
          response,
          response.toolResults
        );
      }

      // CACHE RESPONSE
      if (this.responseCache) {
        const cacheKey = this.responseCache.generateKey(userMessage, conversationHistory.map(m => m.content));
        await this.responseCache.cacheResponse(cacheKey, response);
      }

      // Send completion chunk
      const completeChunk: StreamChunk = {
        type: 'complete',
        data: {
          totalChunks: textChunkIndex.current + 1,
          executionTime: Date.now() - startTime,
        },
        timestamp: Date.now(),
        id: 'complete-0',
      };
      onChunk(completeChunk);

      // Log metrics
      console.log(
        `Streaming completed in ${response.metadata?.executionTime}ms`
      );

      return response;
    } catch (error) {
      console.error('Streaming handler error:', error);

      // Send error chunk to client
      const errorChunk: StreamChunk = {
        type: 'error',
        data: {
          error: (error as Error).message,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      };
      onChunk(errorChunk);

      throw error;
    }
  }

  /**
   * Execute tools based on user query
   * Simple implementation - can be enhanced with AI-powered tool selection
   */
  private async executeTools(
    tools: any[],
    userQuery: string
  ): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = [];

    // For MVP, we'll execute tools that seem relevant
    // In production, this would be decided by the LLM
    for (const tool of tools.slice(0, 3)) {
      // Limit to 3 tools
      try {
        const startTime = Date.now();

        // Execute tool (with caching)
        const result = await this.toolExecutor.executeTool(
          tool.name,
          this.inferToolArgs(tool, userQuery)
        );

        results.push({
          name: tool.name,
          result,
          executionTime: Date.now() - startTime,
        });
      } catch (error) {
        console.error(`Tool execution failed: ${tool.name}`, error);
        results.push({
          name: tool.name,
          result: null,
          error: (error as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * Infer tool arguments from user query
   * Simple implementation - in production, LLM would provide arguments
   */
  private inferToolArgs(tool: any, userQuery: string): Record<string, unknown> {
    // For built-in tools, provide default arguments
    if (tool.name === 'get_current_date') {
      return { format: 'iso' };
    }

    if (tool.name === 'calculate') {
      // Try to extract mathematical expression from query
      const match = userQuery.match(/\d+\s*[\+\-\*\/]\s*\d+/);
      if (match) {
        return { expression: match[0] };
      }
    }

    return {};
  }

  /**
   * Format tool results for response
   */
  private formatToolResults(
    results: ToolCallResult[]
  ): Record<string, unknown> {
    const formatted: Record<string, unknown> = {};

    for (const result of results) {
      formatted[result.name] = {
        result: result.result,
        error: result.error,
        executionTime: result.executionTime,
      };
    }

    return formatted;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Classify error type for metrics
   */
  private classifyError(
    error: unknown
  ): 'schema_validation' | 'semantic_validation' | 'api_error' | 'retry_exhausted' | 'timeout' | 'unknown' {
    const msg = (error as Error).message?.toLowerCase() || '';

    if (msg.includes('schema') || msg.includes('validation')) {
      return 'schema_validation';
    }
    if (msg.includes('semantic') || msg.includes('field')) {
      return 'semantic_validation';
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return 'timeout';
    }
    if (msg.includes('retry') || msg.includes('exhausted')) {
      return 'retry_exhausted';
    }
    if (msg.includes('api') || msg.includes('gemini') || msg.includes('network')) {
      return 'api_error';
    }

    return 'unknown';
  }
}
