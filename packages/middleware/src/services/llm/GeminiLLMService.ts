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

import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import type {
  ITextGenerator,
  IStructuredGenerator,
  TextGenerationOptions,
  StructuredGenerationOptions,
  JSONSchema,
} from '../interfaces';
import { ApiErrorHandler, getApiErrorHandler } from '../api-error-handler';

export class GeminiLLMService implements ITextGenerator, IStructuredGenerator {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;
  private errorHandler: ApiErrorHandler;

  constructor(
    apiKey: string,
    defaultModel: string = 'gemini-2.0-flash',
    errorHandler?: ApiErrorHandler
  ) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = defaultModel;
    this.errorHandler = errorHandler || getApiErrorHandler();
  }

  /**
   * Generate plain text response
   * Used for: Fast text summaries
   * Story 6-2: Wrapped with timeout and retry
   */
  async generateText(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<string> {
    const timeout = this.errorHandler.getTimeout('default');

    return this.errorHandler.withTimeoutAndRetry(
      async () => {
        const modelName = options?.model || this.defaultModel;
        const model = this.genAI.getGenerativeModel({ model: modelName });

        const generationConfig: GenerationConfig = {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens,
        };

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
          systemInstruction: options?.systemInstruction,
        });

        const response = result.response;
        return response.text();
      },
      { timeoutMs: timeout }
    );
  }

  /**
   * Stream text response
   * Used for: Real-time text generation
   * Story 6-2: Wrapped with timeout (retry not applicable for streaming)
   */
  async *streamText(
    prompt: string,
    options?: TextGenerationOptions
  ): AsyncGenerator<string, void, unknown> {
    const timeout = this.errorHandler.getTimeout('stream');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const modelName = options?.model || this.defaultModel;
      const model = this.genAI.getGenerativeModel({ model: modelName });

      const generationConfig: GenerationConfig = {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens,
      };

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        systemInstruction: options?.systemInstruction,
      });

      for await (const chunk of result.stream) {
        // Check if aborted
        if (controller.signal.aborted) {
          throw this.errorHandler.classifyError(new Error('Stream timed out'));
        }

        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      throw this.errorHandler.classifyError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Generate structured JSON response
   * Used for: Component spec generation
   * Story 6-2: Wrapped with timeout and retry
   *
   * NOTE: Gemini API's responseSchema has issues with empty properties in nested objects
   * Using text generation with JSON parsing instead for reliability
   */
  async generateStructured<T = unknown>(
    prompt: string,
    schema: JSONSchema,
    options?: StructuredGenerationOptions
  ): Promise<T> {
    const timeout = this.errorHandler.getTimeout('structured');

    return this.errorHandler.withTimeoutAndRetry(
      async () => {
        const modelName = options?.model || this.defaultModel;

        // Build prompt with schema instructions
        const schemaInstructions = `
You must respond with ONLY valid JSON that conforms to this schema:
${JSON.stringify(schema, null, 2)}

Important:
- Output ONLY valid JSON, no markdown, no explanations
- Ensure all required fields are present
- Use the exact field names from the schema
`;

        const fullPrompt = `${prompt}\n\n${schemaInstructions}`;

        const generationConfig: GenerationConfig = {
          temperature: options?.temperature ?? 0.3, // Lower for more deterministic
          // Note: NOT using responseMimeType to avoid Gemini's schema validation
        };

        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          systemInstruction: options?.systemInstruction,
        });

        const response = result.response;
        const text = response.text();

        try {
          // Clean potential markdown code blocks
          const cleanedText = text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

          return JSON.parse(cleanedText) as T;
        } catch (error) {
          console.error('[GeminiLLM] JSON parse error, raw text:', text);
          throw new Error(`Failed to parse JSON response: ${text.substring(0, 200)}...`);
        }
      },
      { timeoutMs: timeout }
    );
  }

  /**
   * Validate output against schema
   * Basic validation - can be enhanced with Zod
   */
  validateOutput(data: unknown, schema: JSONSchema): boolean {
    // TODO: Implement full schema validation with Zod
    // For now, just check if data matches expected type
    if (schema.type === 'object' && typeof data === 'object' && data !== null) {
      return true;
    }
    return false;
  }

  /**
   * Convert our JSONSchema format to Gemini's schema format
   * Gemini uses a specific schema format for structured output
   * IMPORTANT: Gemini requires OBJECT types to have non-empty properties
   */
  private convertToGeminiSchema(schema: JSONSchema): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Map type - Gemini uses uppercase TYPE names
    if (schema.type) {
      result.type = schema.type.toUpperCase();
    }

    // Add description if present
    if (schema.description) {
      result.description = schema.description;
    }

    // Add enum if present
    if (schema.enum) {
      result.enum = schema.enum;
    }

    // Handle properties recursively for OBJECT type
    if (schema.properties && typeof schema.properties === 'object') {
      const convertedProperties: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        if (typeof value === 'object' && value !== null) {
          const converted = this.convertToGeminiSchema(value as JSONSchema);
          // Skip objects that have OBJECT type but empty properties (Gemini requirement)
          if (converted.type === 'OBJECT' && !converted.properties) {
            // Convert to STRING type as fallback to avoid Gemini error
            converted.type = 'STRING';
            converted.description = (converted.description || '') + ' (JSON string)';
          }
          convertedProperties[key] = converted;
        }
      }
      // Only add properties if non-empty
      if (Object.keys(convertedProperties).length > 0) {
        result.properties = convertedProperties;
      }
    }

    // CRITICAL: Gemini requires OBJECT types to have non-empty properties
    // If this is an OBJECT type without properties, add a placeholder or change type
    if (result.type === 'OBJECT' && !result.properties) {
      // Add a placeholder property to satisfy Gemini's requirement
      result.properties = {
        _placeholder: {
          type: 'STRING',
          description: 'Placeholder for dynamic object properties',
        },
      };
    }

    // Add required if present
    if (schema.required && Array.isArray(schema.required)) {
      result.required = schema.required;
    }

    // Handle items recursively for ARRAY type
    if (schema.items) {
      if (typeof schema.items === 'object' && !Array.isArray(schema.items)) {
        const convertedItems = this.convertToGeminiSchema(schema.items as JSONSchema);
        // Same fix for array items
        if (convertedItems.type === 'OBJECT' && !convertedItems.properties) {
          convertedItems.properties = {
            _placeholder: {
              type: 'STRING',
              description: 'Placeholder for dynamic object properties',
            },
          };
        }
        result.items = convertedItems;
      }
    }

    return result;
  }
}
