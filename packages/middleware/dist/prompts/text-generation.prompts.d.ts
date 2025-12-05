/**
 * Text Generation Prompts
 *
 * Query-specific prompts for consistent, high-quality text generation
 * Categorized by query type for better accuracy
 *
 * Week 3: Prompt Engineering & Optimization
 */
export type QueryType = 'data-analysis' | 'code-explanation' | 'instruction' | 'visualization' | 'question' | 'chat' | 'unknown';
/**
 * Base system instruction - applies to all queries
 */
export declare const BASE_SYSTEM_INSTRUCTION = "You are a helpful AI assistant providing clear, concise insights.\n\nCore Principles:\n- Be direct and conversational\n- Focus on what matters to the user\n- Avoid unnecessary jargon\n- Use plain language explanations\n- Provide actionable insights when possible\n\nResponse Format:\n- 2-3 sentences maximum (short and punchy)\n- Start with the main insight/answer\n- Mention key patterns or implications\n- End with a recommendation or next step (if applicable)\n- Plain text only - no markdown formatting";
/**
 * Query-type specific prompts
 */
export declare const TEXT_PROMPTS: Record<QueryType, string>;
/**
 * System instructions by query type
 * More specific than the base instruction
 */
export declare const SYSTEM_INSTRUCTIONS: Record<QueryType, string>;
/**
 * Helper function to get system instruction by query type
 */
export declare function getSystemInstructionForQueryType(queryType: QueryType): string;
/**
 * Helper function to get prompt by query type
 */
export declare function getPromptForQueryType(queryType: QueryType): string;
/**
 * Keywords that help identify query types
 * Used by QueryClassifierService
 */
export declare const QUERY_TYPE_KEYWORDS: Record<QueryType, string[]>;
/**
 * Classification confidence thresholds
 * Used by QueryClassifierService for determining confidence
 */
export declare const CLASSIFICATION_CONFIG: {
    heuristicMinConfidence: number;
    multiKeywordBoost: number;
    fallbackType: QueryType;
    enableCache: boolean;
    cacheSize: number;
};
//# sourceMappingURL=text-generation.prompts.d.ts.map