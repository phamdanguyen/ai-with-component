/**
 * QueryClassifierService
 *
 * Classifies user queries into types for targeted prompt selection
 * Week 3: Prompt Engineering & Optimization
 *
 * Classification Types:
 * - data-analysis: "Show sales by region"
 * - code-explanation: "Explain this function"
 * - instruction: "How to setup..."
 * - visualization: "Create a chart"
 * - question: "What is...?"
 * - chat: General conversation
 * - unknown: Fallback
 */
import type { QueryType } from '../prompts/text-generation.prompts';
export interface ClassificationResult {
    type: QueryType;
    confidence: number;
    keywords: string[];
    suggestedComponent?: string;
    method: 'heuristic' | 'llm' | 'fallback';
}
export declare class QueryClassifierService {
    private classificationCache;
    /**
     * Classify a user query into a query type
     * Uses fast heuristic first, falls back to LLM for complex cases
     */
    classify(message: string): Promise<ClassificationResult>;
    /**
     * Fast heuristic classification using keyword matching
     */
    private heuristicClassify;
    /**
     * Suggest a component type based on query type
     */
    private suggestComponentType;
    /**
     * Cache a classification result
     */
    private cacheResult;
    /**
     * Get cache stats
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
    };
    /**
     * Clear classification cache
     */
    clearCache(): void;
    /**
     * Get classification for all query types (for analysis)
     */
    classifyAll(message: string): Record<QueryType, number>;
    /**
     * Get detailed classification analysis (for debugging)
     */
    analyzeClassification(message: string): {
        message: string;
        length: number;
        keywords: string[];
        scores: Record<QueryType, number>;
        topTypes: Array<{
            type: QueryType;
            score: number;
        }>;
    };
}
export declare function getQueryClassifier(): QueryClassifierService;
//# sourceMappingURL=query-classifier.service.d.ts.map