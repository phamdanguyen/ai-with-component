/**
 * ABTestService
 *
 * A/B Testing Framework for Week 3
 * Enables experimentation with different prompts, temperatures, and strategies
 *
 * Features:
 * - Variant management (control vs treatment)
 * - Fair distribution (50/50 by default)
 * - Result tracking and aggregation
 * - Statistical significance calculation
 * - Metrics integration for performance comparison
 *
 * Usage:
 * const service = getABTestService();
 * const variant = service.selectVariant('prompt-variation-v1');
 * // Use variant.promptTemplate in generation
 * service.recordResult(testId, variant, metrics);
 */
export interface ABTestVariant {
    id: string;
    name: string;
    description: string;
    weight: number;
    config: Record<string, unknown>;
    promptTemplate?: string;
    temperature?: number;
    systemInstruction?: string;
}
export interface ABTestConfig {
    id: string;
    name: string;
    description: string;
    queryType?: string;
    componentType?: string;
    variants: ABTestVariant[];
    startDate: Date;
    endDate?: Date;
    enabled: boolean;
    trackingId: string;
}
export interface ABTestResult {
    testId: string;
    variantId: string;
    success: boolean;
    executionTime: number;
    confidence?: number;
    quality?: number;
    userSatisfaction?: number;
    errorRate?: number;
    timestamp: Date;
}
export declare class ABTestService {
    private tests;
    private results;
    private selectedVariants;
    constructor();
    /**
     * Initialize default A/B tests for Week 3
     */
    private initializeDefaultTests;
    /**
     * Create a new A/B test
     */
    createTest(config: ABTestConfig): void;
    /**
     * Select a variant for a test (fair distribution)
     */
    selectVariant(testId: string): ABTestVariant;
    /**
     * Record a test result
     */
    recordResult(testId: string, variant: ABTestVariant, metrics: Record<string, unknown>): void;
    /**
     * Generate A/B test report
     */
    generateReport(testId: string): {
        testId: string;
        testName: string;
        sampleSize: number;
        variants: Array<{
            id: string;
            name: string;
            results: number;
            successRate: number;
            avgExecutionTime: number;
            confidence?: number;
        }>;
        winner?: string;
        significance: boolean;
        pValue?: number;
    };
    /**
     * Calculate statistical significance (simplified)
     */
    private calculateSignificance;
    /**
     * Calculate p-value (simplified)
     */
    private calculatePValue;
    /**
     * Select variant by weight distribution
     */
    private selectByWeight;
    /**
     * Validate test configuration
     */
    private isTestValid;
    /**
     * Get test by ID
     */
    getTest(testId: string): ABTestConfig | undefined;
    /**
     * Get all active tests
     */
    getActiveTests(): ABTestConfig[];
    /**
     * Disable a test
     */
    disableTest(testId: string): void;
    /**
     * Get statistics for all tests
     */
    getAllStats(): Record<string, {
        sampleSize: number;
        variants: number;
        successRate: number;
    }>;
}
/**
 * Get or create global singleton instance
 */
export declare function getABTestService(): ABTestService;
//# sourceMappingURL=ab-test.service.d.ts.map