"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LLM_CONFIG = exports.LLMFactory = void 0;
const GeminiLLMService_1 = require("./llm/GeminiLLMService");
const MockLLMService_1 = require("./llm/MockLLMService");
class LLMFactory {
    /**
     * Create text generator for fast summaries
     * Uses: Gemini Flash (fastest, cheapest)
     * Falls back to MockLLMService if apiKey is invalid or 'mock'
     */
    static createTextGenerator(apiKey) {
        if (!this.isValidApiKey(apiKey)) {
            return new MockLLMService_1.MockLLMService(apiKey, 'gemini-2.0-flash');
        }
        return new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash');
    }
    /**
     * Create structured generator for component specs
     * Uses: Gemini Pro (better reasoning, more accurate)
     * Falls back to MockLLMService if apiKey is invalid or 'mock'
     */
    static createComponentGenerator(apiKey) {
        if (!this.isValidApiKey(apiKey)) {
            return new MockLLMService_1.MockLLMService(apiKey, 'gemini-2.0-flash');
        }
        return new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash');
    }
    /**
     * Check if API key is valid for real Gemini API
     * Returns false for empty, placeholder, or mock keys
     */
    static isValidApiKey(apiKey) {
        if (!apiKey)
            return false;
        if (apiKey === 'mock')
            return false;
        if (apiKey.includes('your_') || apiKey.includes('_here'))
            return false;
        if (apiKey.includes('mock') || apiKey.includes('demo') || apiKey.includes('test'))
            return false;
        return true;
    }
    /**
     * Create optimized generator based on priority
     * Allows flexible model selection
     */
    static createOptimized(priority, apiKey) {
        switch (priority) {
            case 'speed':
                return {
                    text: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                    component: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                };
            case 'accuracy':
                return {
                    text: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                    component: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash-exp'),
                };
            case 'cost':
                return {
                    text: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                    component: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                };
            default:
                return {
                    text: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                    component: new GeminiLLMService_1.GeminiLLMService(apiKey, 'gemini-2.0-flash'),
                };
        }
    }
    /**
     * Create custom generator with specific model
     * Full flexibility for advanced use cases
     */
    static createCustom(config) {
        switch (config.provider) {
            case 'gemini':
                return new GeminiLLMService_1.GeminiLLMService(config.apiKey, config.model);
            case 'openai':
                // TODO: Implement OpenAI provider
                throw new Error('OpenAI provider not yet implemented');
            case 'claude':
                // TODO: Implement Claude provider
                throw new Error('Claude provider not yet implemented');
            default:
                throw new Error(`Unknown provider: ${config.provider}`);
        }
    }
}
exports.LLMFactory = LLMFactory;
/**
 * Default configuration
 * Used when no custom config is provided
 */
exports.DEFAULT_LLM_CONFIG = {
    text: {
        model: 'gemini-2.0-flash',
        temperature: 0.7,
    },
    component: {
        model: 'gemini-2.0-flash',
        temperature: 0.3,
        responseMimeType: 'application/json',
    },
};
//# sourceMappingURL=llm-factory.js.map