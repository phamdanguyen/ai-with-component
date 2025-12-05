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
import { getMetricsService } from './metrics.service';
import { getQueryClassifier } from './query-classifier.service';
import type { QueryType } from '../prompts/text-generation.prompts';
import {
  getPromptForQueryType,
  getSystemInstructionForQueryType,
} from '../prompts/text-generation.prompts';

export class TextSummaryService {
  private readonly serviceName = 'TextSummaryService';
  private classifier = getQueryClassifier();

  constructor(private textGenerator: ITextGenerator) { }

  /**
   * Generate text summary from user query and tool results
   *
   * @param userQuery - Original user question
   * @param toolResults - Results from tool execution
   * @param context - Optional conversation context
   * @returns Text summary (2-3 sentences)
   */
  async generateSummary(
    userQuery: string,
    toolResults: ToolCallResult[],
    context?: ChatMessage[]
  ): Promise<string> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Classify the query
      const classification = await this.classifier.classify(userQuery);
      const queryType = classification.type;
      const confidence = classification.confidence.toFixed(2);

      console.log(
        `[${requestId}] Classifying: ${queryType} (confidence: ${confidence}) - "${userQuery.substring(0, 40)}..."`
      );

      // Build prompt with type-specific template
      const prompt = this.buildSummaryPromptForType(
        userQuery,
        toolResults,
        context,
        queryType
      );

      // Get type-specific system instruction
      const systemInstruction = getSystemInstructionForQueryType(queryType);

      const summary = await this.textGenerator.generateText(prompt, {
        model: 'gemini-2.0-flash',
        temperature: this.getTemperatureForType(queryType),
        maxTokens: 200, // Keep it short
        systemInstruction,
      });

      const executionTime = Date.now() - startTime;
      console.log(
        `[${requestId}] ✅ [${queryType}] Generated ${summary.length} chars in ${executionTime}ms`
      );

      return summary;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = (error as Error).message;

      console.error(`[${requestId}] ❌ Text summary generation failed after ${executionTime}ms:`, errorMessage);
      console.error(`Query: "${userQuery.substring(0, 100)}"`);
      console.error(`Error details:`, error);

      throw error;
    }
  }

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
  async generateSummaryStreaming(
    userQuery: string,
    toolResults: ToolCallResult[],
    context: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    // Classify the query
    const classification = await this.classifier.classify(userQuery);
    const queryType = classification.type;

    // Build prompt with type-specific template
    const prompt = this.buildSummaryPromptForType(
      userQuery,
      toolResults,
      context,
      queryType
    );

    // Get type-specific system instruction
    const systemInstruction = getSystemInstructionForQueryType(queryType);

    let fullText = '';

    // Stream text chunks from generator
    const textStream = this.textGenerator.streamText(prompt, {
      model: 'gemini-2.0-flash',
      temperature: this.getTemperatureForType(queryType),
      maxTokens: 200,
      systemInstruction,
    });

    // Collect chunks and invoke callback
    for await (const chunk of textStream) {
      fullText += chunk;
      // Send each chunk to client
      onChunk(chunk);
    }

    return fullText;
  }

  /**
   * Build prompt for text summary based on query type
   * Week 3: Query-specific prompts for better accuracy
   */
  private buildSummaryPromptForType(
    userQuery: string,
    toolResults: ToolCallResult[],
    context: ChatMessage[] | undefined,
    queryType: QueryType
  ): string {
    let prompt = '';

    // Add context if available
    if (context && context.length > 0) {
      prompt += '## Conversation Context:\n';
      // Format messages with roles for better LLM understanding
      const formattedContext = context
        .slice(-5) // Use up to 5 messages (sliding window)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      prompt += formattedContext + '\n\n';
    }

    // Add user query
    prompt += `## User Question:\n${userQuery}\n\n`;

    // Add tool results (if any)
    if (toolResults.length > 0) {
      prompt += '## Data Retrieved:\n';
      for (const result of toolResults) {
        prompt += `### ${result.name}:\n`;
        const resultJson = JSON.stringify(result.result, null, 2);
        // Truncate very long results
        const truncated = resultJson.length > 1000
          ? resultJson.substring(0, 1000) + '\n...(truncated)'
          : resultJson;
        prompt += truncated + '\n\n';
      }
    }

    // Add query-type specific instruction
    const typeSpecificPrompt = getPromptForQueryType(queryType);
    prompt += `## Task:\n${typeSpecificPrompt}`;

    return prompt;
  }

  /**
   * Get appropriate temperature based on query type
   * Lower temperature = more deterministic
   * Higher temperature = more creative
   */
  private getTemperatureForType(queryType: QueryType): number {
    const temperatures: Record<QueryType, number> = {
      'data-analysis': 0.5, // Low - factual, precise
      'code-explanation': 0.3, // Very low - technical accuracy
      'instruction': 0.4, // Low - clear steps
      'visualization': 0.5, // Low - specific recommendations
      'question': 0.6, // Medium - informative but natural
      'chat': 0.8, // High - conversational, varied
      'unknown': 0.7, // Medium-high - balanced
    };

    return temperatures[queryType] || 0.7;
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `text_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
