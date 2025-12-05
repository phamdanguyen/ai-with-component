/**
 * ComponentGenerationService
 *
 * Enhanced component generation with:
 * - Zod schema validation (type-safe)
 * - Component-specific prompts (better accuracy)
 * - Error recovery (retry with fallback)
 * - Full validation per component type
 *
 * Purpose: Generate valid ComponentSpec JSON from user query and data
 * Model: Gemini Pro (better reasoning)
 * Temperature: 0.3 (deterministic)
 *
 * Pattern: Service with error handling & validation
 */
import type { IStructuredGenerator } from './interfaces';
import type { ComponentSpec, ToolCallResult } from '../types/core.types';
export declare class ComponentGenerationService {
    private structuredGenerator;
    private readonly MAX_RETRIES;
    private classifier;
    constructor(structuredGenerator: IStructuredGenerator);
    /**
     * Generate component spec with validation and error recovery
     * Uses query classification to guide component type selection
     *
     * @param userQuery - Original user question
     * @param toolResults - Results from tool execution
     * @returns Valid ComponentSpec or fallback component
     */
    generateComponent(userQuery: string, toolResults: ToolCallResult[]): Promise<ComponentSpec>;
    /**
     * Build context-aware prompt with component-specific instructions
     * Optionally includes query classification hints for better component selection
     */
    private buildComponentPrompt;
    /**
     * Get ComponentSpec JSON schema for LLM
     * Note: Gemini API requires OBJECT types to have non-empty properties
     */
    private getComponentSchema;
    /**
     * System instruction for component generation
     * Returns the optimized system instruction from component-prompts
     */
    private getSystemInstruction;
    /**
     * Full validation: Zod schema + semantic validation
     * Returns structured validation result with all errors
     */
    private validateComponentFull;
    /**
     * Create fallback component when generation fails
     */
    private createFallbackComponent;
    private createFallbackCard;
    private createFallbackTable;
    private createFallbackList;
    /**
     * Public validation method
     * Validates a component spec against semantic rules
     */
    validateComponent(componentSpec: ComponentSpec | null | undefined): boolean;
}
//# sourceMappingURL=component-generation.service.d.ts.map