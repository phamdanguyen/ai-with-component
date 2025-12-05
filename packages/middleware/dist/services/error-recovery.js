"use strict";
/**
 * Error Recovery Service
 *
 * Handles component generation failures with targeted recovery strategies
 * Different approaches for different error types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorRecoveryService = void 0;
/**
 * Analyze component generation errors and suggest recovery approaches
 */
class ErrorRecoveryService {
    /**
     * Analyze validation errors to determine error type and recovery strategy
     */
    static analyzeValidationError(errors, componentType) {
        const analysis = {
            errorType: 'schema_validation',
            severity: 'medium',
            errors,
            recoveryStrategies: [],
        };
        if (!errors || errors.length === 0) {
            return analysis;
        }
        // Classify errors (case-insensitive)
        const schemaErrors = errors.filter((e) => e.toLowerCase().includes('schema validation') || e.toLowerCase().includes('validation error'));
        const semanticErrors = errors.filter((e) => {
            const lower = e.toLowerCase();
            return !lower.includes('schema validation') &&
                (lower.includes('not found') || lower.includes('missing') ||
                    lower.includes('invalid') || lower.includes('duplicate'));
        });
        // Determine error type and severity
        if (semanticErrors.length > 0) {
            analysis.errorType = 'semantic_validation';
            analysis.severity = 'high';
        }
        else if (schemaErrors.length > 0) {
            analysis.errorType = 'schema_validation';
            analysis.severity = 'medium';
        }
        // Suggest recovery strategies based on error patterns
        analysis.recoveryStrategies = this.getSuggestedStrategies(analysis.errorType, componentType, errors);
        // Suggest a specific fix if detectable
        analysis.suggestedFix = this.suggestFix(componentType, errors);
        return analysis;
    }
    /**
     * Get suggested recovery strategies based on error type
     */
    static getSuggestedStrategies(errorType, componentType, errors) {
        const strategies = [];
        if (errorType === 'schema_validation') {
            strategies.push({
                strategy: 'retry_with_higher_temperature',
                description: 'Increase LLM temperature to encourage variation',
                action: async () => ({ retryWithTemperature: 0.6 }),
            });
            strategies.push({
                strategy: 'use_component_specific_prompt',
                description: 'Use specialized prompt for this component type',
                action: async () => ({ useComponentSpecificPrompt: true }),
            });
        }
        if (errorType === 'semantic_validation') {
            // Common semantic issues
            if (errors.some((e) => e.includes('not found in') || e.includes('missing'))) {
                strategies.push({
                    strategy: 'fix_field_mapping',
                    description: 'Regenerate with explicit field mapping instruction',
                    action: async () => ({ addFieldMappingInstruction: true }),
                });
            }
            if (componentType === 'table' &&
                errors.some((e) => e.toLowerCase().includes('column'))) {
                strategies.push({
                    strategy: 'simplify_table_columns',
                    description: 'Regenerate with fewer columns for clarity',
                    action: async () => ({ simplifyColumns: true }),
                });
            }
            if (componentType === 'form' &&
                errors.some((e) => e.toLowerCase().includes('field'))) {
                strategies.push({
                    strategy: 'simplify_form_fields',
                    description: 'Regenerate with essential fields only',
                    action: async () => ({ simplifyForm: true }),
                });
            }
        }
        // Always offer retry with modified prompt
        strategies.push({
            strategy: 'retry_with_fallback_prompt',
            description: 'Retry with simpler, more explicit instructions',
            action: async () => ({ useFallbackPrompt: true }),
        });
        // Offer fallback component as last resort
        strategies.push({
            strategy: 'use_fallback_component',
            description: 'Create safe fallback component with available data',
            action: async () => ({ useFallback: true }),
        });
        return strategies;
    }
    /**
     * Suggest specific fix based on error pattern
     */
    static suggestFix(componentType, errors) {
        // Chart errors
        if (componentType === 'chart') {
            if (errors.some((e) => e.includes('axis') && e.includes('not found'))) {
                return 'Ensure xAxis.key and yAxis.key match actual data field names';
            }
            if (errors.some((e) => e.includes('data') && e.includes('empty'))) {
                return 'Chart data array cannot be empty - provide at least one data point';
            }
        }
        // Table errors
        if (componentType === 'table') {
            if (errors.some((e) => e.includes('Column keys'))) {
                return 'All column keys must exist in every row of the data array';
            }
            if (errors.some((e) => e.includes('Duplicate column'))) {
                return 'Remove duplicate column definitions - each column key must be unique';
            }
        }
        // Form errors
        if (componentType === 'form') {
            if (errors.some((e) => e.includes('Duplicate field'))) {
                return 'Field names must be unique within the form';
            }
            if (errors.some((e) => e.includes('options'))) {
                return 'Select and radio fields must have at least one option defined';
            }
        }
        // List errors
        if (componentType === 'list') {
            if (errors.some((e) => e.includes('Duplicate item'))) {
                return 'All list item IDs must be unique';
            }
        }
        // Report errors
        if (componentType === 'report') {
            if (errors.some((e) => e.includes('title'))) {
                return 'Report and all sections must have non-empty titles';
            }
        }
        return 'Review error details and ensure all required fields are properly configured';
    }
    /**
     * Create a recovery-focused prompt amendment
     * Added to retry prompts to help LLM fix specific issues
     */
    static getRecoveryPromptAmendment(errors, componentType) {
        const amendment = `

## IMPORTANT - Fix Previous Errors
The previous attempt had these issues:
${errors.map((e) => `- ${e}`).join('\n')}

To fix these issues:
1. Double-check all field names match exactly (case-sensitive)
2. Ensure array fields (data, items, fields, slides, sections) are never empty
3. Verify all cross-references are valid (e.g., column keys exist in data)
4. For select/radio fields, always include options array
5. Use simple, descriptive field names`;
        return amendment;
    }
    /**
     * Extract data structure hints from tool results for targeted regeneration
     */
    static extractDataHints(toolResults) {
        const hints = [];
        for (const result of toolResults) {
            const data = result.result;
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    hints.push('- Data array is empty, use card component as fallback');
                }
                else {
                    const firstItem = data[0];
                    const keys = Object.keys(firstItem);
                    hints.push(`- Data has ${data.length} items with fields: ${keys.join(', ')}`);
                    // Detect data patterns
                    if (keys.includes('date') || keys.includes('timestamp') || keys.includes('month') || keys.includes('quarter')) {
                        hints.push('  Detected time-series data, consider line/area charts');
                    }
                    if (keys.includes('category') || keys.length > 3) {
                        hints.push('  Detected categorical data, consider table or bar chart');
                    }
                    if (keys.length === 2 && (keys.includes('value') || keys.includes('amount'))) {
                        hints.push('  Detected simple pair data, consider pie or bar chart');
                    }
                }
            }
            else if (typeof data === 'object' && data !== null) {
                const keys = Object.keys(data);
                hints.push(`- Single object with fields: ${keys.join(', ')}`);
            }
        }
        if (hints.length === 0)
            return '';
        return `\n## Data Hints for Accurate Generation:\n${hints.join('\n')}`;
    }
    /**
     * Determine if error is recoverable or should immediately fallback
     */
    static isRecoverable(error, attemptNumber) {
        // Schema validation errors are always worth retrying
        if (error.includes('Schema validation')) {
            return attemptNumber < 2; // But only up to max retries
        }
        // Semantic errors with clear fixes are recoverable
        const recoverablePatterns = [
            'not found in',
            'Duplicate',
            'missing',
            'invalid',
            'must have',
        ];
        const isSemanticError = recoverablePatterns.some((pattern) => error.includes(pattern));
        return isSemanticError && attemptNumber < 2;
    }
    /**
     * Log error for monitoring and debugging
     */
    static logError(componentType, attemptNumber, analysis, context) {
        const severity = analysis.severity === 'high' ? '🔴' : '⚠️';
        console.log(`${severity} Error Recovery [${componentType}] Attempt ${attemptNumber + 1}:`);
        console.log(`   Type: ${analysis.errorType}`);
        console.log(`   Errors: ${analysis.errors.length} issue(s)`);
        if (analysis.suggestedFix) {
            console.log(`   Fix: ${analysis.suggestedFix}`);
        }
        if (analysis.recoveryStrategies.length > 0) {
            console.log(`   Strategies: ${analysis.recoveryStrategies[0].strategy}`);
        }
        if (context) {
            console.log(`   Context:`, context);
        }
    }
    /**
     * Generate error report for debugging
     */
    static generateErrorReport(componentType, userQuery, totalAttempts, errors) {
        const timestamp = new Date().toISOString();
        return `
=== Component Generation Error Report ===
Timestamp: ${timestamp}
Component Type: ${componentType}
User Query: ${userQuery}
Attempts: ${totalAttempts}
Errors: ${errors.length}

Details:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

This error has been logged for monitoring.
    `;
    }
}
exports.ErrorRecoveryService = ErrorRecoveryService;
//# sourceMappingURL=error-recovery.js.map