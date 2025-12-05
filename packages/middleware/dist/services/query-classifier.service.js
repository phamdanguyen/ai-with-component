"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryClassifierService = void 0;
exports.getQueryClassifier = getQueryClassifier;
const text_generation_prompts_1 = require("../prompts/text-generation.prompts");
class QueryClassifierService {
    constructor() {
        this.classificationCache = new Map();
    }
    /**
     * Classify a user query into a query type
     * Uses fast heuristic first, falls back to LLM for complex cases
     */
    async classify(message) {
        // Check cache first
        if (text_generation_prompts_1.CLASSIFICATION_CONFIG.enableCache) {
            const cached = this.classificationCache.get(message);
            if (cached) {
                console.log(`[QueryClassifier] Cache hit: ${cached.type} (${cached.confidence.toFixed(2)})`);
                return cached;
            }
        }
        // Fast heuristic classification
        const heuristicResult = this.heuristicClassify(message);
        if (heuristicResult.confidence >= text_generation_prompts_1.CLASSIFICATION_CONFIG.heuristicMinConfidence) {
            this.cacheResult(message, heuristicResult);
            console.log(`[QueryClassifier] Heuristic: ${heuristicResult.type} (${heuristicResult.confidence.toFixed(2)})`);
            return heuristicResult;
        }
        // For production, would use LLM classification here
        // For now, return heuristic result or fallback
        if (heuristicResult.confidence > 0) {
            this.cacheResult(message, heuristicResult);
            return heuristicResult;
        }
        // Fallback to chat
        const fallback = {
            type: text_generation_prompts_1.CLASSIFICATION_CONFIG.fallbackType,
            confidence: 0.5,
            keywords: [],
            method: 'fallback',
        };
        this.cacheResult(message, fallback);
        console.log('[QueryClassifier] Fallback to chat');
        return fallback;
    }
    /**
     * Fast heuristic classification using keyword matching
     */
    heuristicClassify(message) {
        const lowerMessage = message.toLowerCase();
        const keywords = lowerMessage.split(/\s+/);
        // Score each query type
        const scores = {
            'data-analysis': { matches: 0, keywords: [] },
            'code-explanation': { matches: 0, keywords: [] },
            'instruction': { matches: 0, keywords: [] },
            'visualization': { matches: 0, keywords: [] },
            'question': { matches: 0, keywords: [] },
            'chat': { matches: 0, keywords: [] },
            'unknown': { matches: 0, keywords: [] },
        };
        // Count matching keywords
        for (const [type, typeKeywords] of Object.entries(text_generation_prompts_1.QUERY_TYPE_KEYWORDS)) {
            for (const keyword of typeKeywords) {
                if (lowerMessage.includes(keyword)) {
                    scores[type].matches++;
                    scores[type].keywords.push(keyword);
                }
            }
        }
        // Find the type with the most matches
        let maxType = 'unknown';
        let maxMatches = 0;
        for (const [type, score] of Object.entries(scores)) {
            if (score.matches > maxMatches) {
                maxMatches = score.matches;
                maxType = type;
            }
        }
        // Calculate confidence (0-1)
        let confidence = 0;
        if (maxMatches > 0) {
            // Confidence based on keyword match density
            const uniqueKeywords = new Set(scores[maxType].keywords).size;
            const matchDensity = (maxMatches / message.length) * 100;
            confidence = Math.min(0.95, (uniqueKeywords * 0.3) + (matchDensity * 0.01));
        }
        // Boost confidence if multiple keywords from same type
        if (new Set(scores[maxType].keywords).size > 1) {
            confidence = Math.min(1.0, confidence + text_generation_prompts_1.CLASSIFICATION_CONFIG.multiKeywordBoost);
        }
        // Suggest component type based on query type
        const suggestedComponent = this.suggestComponentType(maxType === 'unknown' ? 'chat' : maxType);
        return {
            type: maxType,
            confidence,
            keywords: [...new Set(scores[maxType].keywords)],
            suggestedComponent,
            method: 'heuristic',
        };
    }
    /**
     * Suggest a component type based on query type
     */
    suggestComponentType(queryType) {
        const suggestions = {
            'data-analysis': 'chart', // Often need visualization
            'code-explanation': 'card', // Code snippet in card
            'instruction': undefined, // Usually just text
            'visualization': 'chart', // Obviously a chart
            'question': undefined, // Depends on answer
            'chat': undefined, // Depends on content
            'unknown': undefined,
        };
        return suggestions[queryType];
    }
    /**
     * Cache a classification result
     */
    cacheResult(message, result) {
        if (text_generation_prompts_1.CLASSIFICATION_CONFIG.enableCache) {
            if (this.classificationCache.size >= text_generation_prompts_1.CLASSIFICATION_CONFIG.cacheSize) {
                // Remove oldest entry (simple FIFO)
                const firstKey = this.classificationCache.keys().next().value;
                if (firstKey) {
                    this.classificationCache.delete(firstKey);
                }
            }
            this.classificationCache.set(message, result);
        }
    }
    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.classificationCache.size,
            maxSize: text_generation_prompts_1.CLASSIFICATION_CONFIG.cacheSize,
        };
    }
    /**
     * Clear classification cache
     */
    clearCache() {
        this.classificationCache.clear();
    }
    /**
     * Get classification for all query types (for analysis)
     */
    classifyAll(message) {
        const lowerMessage = message.toLowerCase();
        const results = {
            'data-analysis': 0,
            'code-explanation': 0,
            'instruction': 0,
            'visualization': 0,
            'question': 0,
            'chat': 0,
            'unknown': 0,
        };
        for (const [type, keywords] of Object.entries(text_generation_prompts_1.QUERY_TYPE_KEYWORDS)) {
            let matches = 0;
            for (const keyword of keywords) {
                if (lowerMessage.includes(keyword)) {
                    matches++;
                }
            }
            results[type] = matches > 0 ? matches : 0;
        }
        return results;
    }
    /**
     * Get detailed classification analysis (for debugging)
     */
    analyzeClassification(message) {
        const lowerMessage = message.toLowerCase();
        const messageKeywords = lowerMessage.split(/\s+/);
        const scores = this.classifyAll(message);
        const topTypes = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([type, score]) => ({ type: type, score }));
        return {
            message,
            length: message.length,
            keywords: messageKeywords,
            scores,
            topTypes,
        };
    }
}
exports.QueryClassifierService = QueryClassifierService;
// Global singleton
let classifierInstance = null;
function getQueryClassifier() {
    if (!classifierInstance) {
        classifierInstance = new QueryClassifierService();
    }
    return classifierInstance;
}
//# sourceMappingURL=query-classifier.service.js.map