/**
 * MockLLMService
 *
 * Mock LLM service for development and testing
 * Implements both ITextGenerator and IStructuredGenerator interfaces
 * Returns realistic demo responses without requiring API keys
 */
import type { ITextGenerator, TextGenerationOptions } from '../interfaces/ITextGenerator';
import type { IStructuredGenerator, StructuredGenerationOptions, JSONSchema } from '../interfaces/IStructuredGenerator';
export declare class MockLLMService implements ITextGenerator, IStructuredGenerator {
    constructor(apiKey?: string, model?: string);
    generateText(prompt: string, options?: TextGenerationOptions): Promise<string>;
    streamText(prompt: string, options?: TextGenerationOptions): AsyncGenerator<string, void, unknown>;
    generateStructured<T = unknown>(prompt: string, schema: JSONSchema, options?: StructuredGenerationOptions): Promise<T>;
    validateOutput(data: unknown, schema: JSONSchema): boolean;
    private generateMockComponentSpec;
}
//# sourceMappingURL=MockLLMService.d.ts.map