/**
 * GeminiLLMService
 *
 * Concrete implementation of ITextGenerator and IStructuredGenerator
 * Uses Google Gemini API for both text and structured generation
 *
 * SOLID Principles:
 * - Implements multiple interfaces (ITextGenerator + IStructuredGenerator)
 * - Single Responsibility: LLM communication only
 * - Open/Closed: Can be extended without modification
 *
 * Pattern learned from: Odoo AI Chat - GeminiProvider
 *
 * Story 6-2: API Error Handling & Timeouts
 * - Integrated with ApiErrorHandler for timeout and retry
 */
import type { ITextGenerator, IStructuredGenerator, TextGenerationOptions, StructuredGenerationOptions, JSONSchema } from '../interfaces';
import { ApiErrorHandler } from '../api-error-handler';
export declare class GeminiLLMService implements ITextGenerator, IStructuredGenerator {
    private genAI;
    private defaultModel;
    private errorHandler;
    constructor(apiKey: string, defaultModel?: string, errorHandler?: ApiErrorHandler);
    /**
     * Generate plain text response
     * Used for: Fast text summaries
     * Story 6-2: Wrapped with timeout and retry
     */
    generateText(prompt: string, options?: TextGenerationOptions): Promise<string>;
    /**
     * Stream text response
     * Used for: Real-time text generation
     * Story 6-2: Wrapped with timeout (retry not applicable for streaming)
     */
    streamText(prompt: string, options?: TextGenerationOptions): AsyncGenerator<string, void, unknown>;
    /**
     * Generate structured JSON response
     * Used for: Component spec generation
     * Story 6-2: Wrapped with timeout and retry
     *
     * NOTE: Gemini API's responseSchema has issues with empty properties in nested objects
     * Using text generation with JSON parsing instead for reliability
     */
    generateStructured<T = unknown>(prompt: string, schema: JSONSchema, options?: StructuredGenerationOptions): Promise<T>;
    /**
     * Validate output against schema
     * Basic validation - can be enhanced with Zod
     */
    validateOutput(data: unknown, schema: JSONSchema): boolean;
    /**
     * Convert our JSONSchema format to Gemini's schema format
     * Gemini uses a specific schema format for structured output
     * IMPORTANT: Gemini requires OBJECT types to have non-empty properties
     */
    private convertToGeminiSchema;
}
//# sourceMappingURL=GeminiLLMService.d.ts.map