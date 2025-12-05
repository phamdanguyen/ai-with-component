/**
 * ITextGenerator Interface
 *
 * Purpose: Text generation (summaries, insights, recommendations)
 * Use Case: Fast text summaries using Gemini Flash
 *
 * SOLID Principle: Interface Segregation Principle (ISP)
 * - Separate interface for text generation only
 * - Services implementing this are NOT required to implement structured generation
 *
 * Pattern learned from: Odoo AI Chat - AIProvider abstraction
 */
export interface ITextGenerator {
    /**
     * Generate plain text response
     *
     * @param prompt - The prompt to send to the LLM
     * @param options - Optional generation parameters
     * @returns Generated text string
     */
    generateText(prompt: string, options?: TextGenerationOptions): Promise<string>;
    /**
     * Stream text response (for real-time updates)
     *
     * @param prompt - The prompt to send to the LLM
     * @param options - Optional generation parameters
     * @returns Async generator yielding text chunks
     */
    streamText(prompt: string, options?: TextGenerationOptions): AsyncGenerator<string, void, unknown>;
}
export interface TextGenerationOptions {
    /**
     * Model to use (e.g., 'gemini-2.0-flash')
     */
    model?: string;
    /**
     * Temperature (0.0-1.0)
     * Lower = more deterministic, Higher = more creative
     */
    temperature?: number;
    /**
     * Maximum tokens to generate
     */
    maxTokens?: number;
    /**
     * System instructions
     */
    systemInstruction?: string;
}
//# sourceMappingURL=ITextGenerator.d.ts.map