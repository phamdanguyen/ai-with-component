/**
 * LLMFactory
 *
 * Factory pattern for creating LLM service instances
 * Allows easy model selection and swapping
 *
 * SOLID Principles:
 * - Open/Closed Principle: Easy to add new providers without modifying existing code
 * - Dependency Inversion: Returns abstractions (ITextGenerator, IStructuredGenerator)
 * - Strategy Pattern: Different models for different use cases
 *
 * Pattern learned from: Odoo AI Chat - Provider selection strategy
 */
import type { ITextGenerator, IStructuredGenerator } from './interfaces';
export interface LLMConfig {
    provider: 'gemini' | 'openai' | 'claude';
    model: string;
    apiKey: string;
    capabilities?: ('text' | 'structured' | 'tools')[];
}
export declare class LLMFactory {
    /**
     * Create text generator for fast summaries
     * Uses: Gemini Flash (fastest, cheapest)
     * Falls back to MockLLMService if apiKey is invalid or 'mock'
     */
    static createTextGenerator(apiKey: string): ITextGenerator;
    /**
     * Create structured generator for component specs
     * Uses: Gemini Pro (better reasoning, more accurate)
     * Falls back to MockLLMService if apiKey is invalid or 'mock'
     */
    static createComponentGenerator(apiKey: string): IStructuredGenerator;
    /**
     * Check if API key is valid for real Gemini API
     * Returns false for empty, placeholder, or mock keys
     */
    private static isValidApiKey;
    /**
     * Create optimized generator based on priority
     * Allows flexible model selection
     */
    static createOptimized(priority: 'speed' | 'accuracy' | 'cost', apiKey: string): {
        text: ITextGenerator;
        component: IStructuredGenerator;
    };
    /**
     * Create custom generator with specific model
     * Full flexibility for advanced use cases
     */
    static createCustom(config: LLMConfig): ITextGenerator & IStructuredGenerator;
}
/**
 * Default configuration
 * Used when no custom config is provided
 */
export declare const DEFAULT_LLM_CONFIG: {
    text: {
        model: string;
        temperature: number;
    };
    component: {
        model: string;
        temperature: number;
        responseMimeType: string;
    };
};
//# sourceMappingURL=llm-factory.d.ts.map