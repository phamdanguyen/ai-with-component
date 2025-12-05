/**
 * Error Recovery Service
 *
 * Handles component generation failures with targeted recovery strategies
 * Different approaches for different error types
 */
import type { ToolCallResult } from '../types/core.types';
export interface RecoveryStrategy {
    strategy: string;
    description: string;
    action: () => Promise<any>;
}
export interface ErrorAnalysis {
    errorType: 'schema_validation' | 'semantic_validation' | 'generation_error' | 'unknown';
    severity: 'low' | 'medium' | 'high';
    errors: string[];
    suggestedFix?: string;
    recoveryStrategies: RecoveryStrategy[];
}
/**
 * Analyze component generation errors and suggest recovery approaches
 */
export declare class ErrorRecoveryService {
    /**
     * Analyze validation errors to determine error type and recovery strategy
     */
    static analyzeValidationError(errors: string[], componentType: string): ErrorAnalysis;
    /**
     * Get suggested recovery strategies based on error type
     */
    private static getSuggestedStrategies;
    /**
     * Suggest specific fix based on error pattern
     */
    private static suggestFix;
    /**
     * Create a recovery-focused prompt amendment
     * Added to retry prompts to help LLM fix specific issues
     */
    static getRecoveryPromptAmendment(errors: string[], componentType: string): string;
    /**
     * Extract data structure hints from tool results for targeted regeneration
     */
    static extractDataHints(toolResults: ToolCallResult[]): string;
    /**
     * Determine if error is recoverable or should immediately fallback
     */
    static isRecoverable(error: string, attemptNumber: number): boolean;
    /**
     * Log error for monitoring and debugging
     */
    static logError(componentType: string, attemptNumber: number, analysis: ErrorAnalysis, context?: Record<string, any>): void;
    /**
     * Generate error report for debugging
     */
    static generateErrorReport(componentType: string, userQuery: string, totalAttempts: number, errors: string[]): string;
}
//# sourceMappingURL=error-recovery.d.ts.map