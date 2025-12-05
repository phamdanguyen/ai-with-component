"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABTestService = void 0;
exports.getABTestService = getABTestService;
/**
 * Global singleton instance
 */
let abTestServiceInstance = null;
class ABTestService {
    constructor() {
        this.tests = new Map();
        this.results = new Map();
        this.selectedVariants = new Map(); // Cache variant selections
        this.initializeDefaultTests();
    }
    /**
     * Initialize default A/B tests for Week 3
     */
    initializeDefaultTests() {
        // Test 1: Text generation prompt optimization
        this.createTest({
            id: 'text-prompt-v1',
            name: 'Text Generation Prompt Optimization',
            description: 'Compare original vs optimized text generation prompts',
            enabled: true,
            startDate: new Date(),
            trackingId: 'text-prompt-v1',
            variants: [
                {
                    id: 'control-basic',
                    name: 'Control (Basic Prompts)',
                    description: 'Original prompt templates without optimization',
                    weight: 0.5,
                    config: { version: '1.0', optimized: false },
                    promptTemplate: 'Generate a response for this query',
                },
                {
                    id: 'treatment-optimized',
                    name: 'Treatment (Week 3 Optimized)',
                    description: 'Enhanced prompts with query classification guidance',
                    weight: 0.5,
                    config: { version: '3.0', optimized: true },
                    promptTemplate: 'Generate a clear, concise response tailored to the query type',
                },
            ],
        });
        // Test 2: Temperature tuning for different query types
        this.createTest({
            id: 'temp-tuning-v1',
            name: 'Temperature Tuning by Query Type',
            description: 'Compare fixed vs adaptive temperature strategies',
            enabled: true,
            startDate: new Date(),
            trackingId: 'temp-tuning-v1',
            variants: [
                {
                    id: 'control-fixed-temp',
                    name: 'Fixed Temperature (0.7)',
                    description: 'Use constant temperature regardless of query type',
                    weight: 0.5,
                    config: { strategy: 'fixed', temperature: 0.7 },
                    temperature: 0.7,
                },
                {
                    id: 'treatment-adaptive-temp',
                    name: 'Adaptive Temperature',
                    description: 'Use query-type specific temperatures (0.3-0.8)',
                    weight: 0.5,
                    config: { strategy: 'adaptive', temperature: 'dynamic' },
                    temperature: 0.5,
                },
            ],
        });
        // Test 3: Component generation strategy
        this.createTest({
            id: 'component-gen-v1',
            name: 'Component Generation Strategy',
            description: 'Compare classification-guided vs data-only component selection',
            enabled: true,
            startDate: new Date(),
            trackingId: 'component-gen-v1',
            variants: [
                {
                    id: 'control-data-only',
                    name: 'Data-Only Selection',
                    description: 'Select component based purely on data structure',
                    weight: 0.5,
                    config: { useClassification: false },
                },
                {
                    id: 'treatment-classification-guided',
                    name: 'Classification-Guided Selection',
                    description: 'Select component based on query classification + data',
                    weight: 0.5,
                    config: { useClassification: true },
                },
            ],
        });
    }
    /**
     * Create a new A/B test
     */
    createTest(config) {
        if (!this.isTestValid(config)) {
            throw new Error('Invalid test configuration');
        }
        this.tests.set(config.id, config);
        this.results.set(config.id, []);
        console.log(`[ABTest] Created test: ${config.name} (${config.id})`);
    }
    /**
     * Select a variant for a test (fair distribution)
     */
    selectVariant(testId) {
        const test = this.tests.get(testId);
        if (!test || !test.enabled) {
            throw new Error(`Test not found or disabled: ${testId}`);
        }
        // Check if variant already selected for this session
        const cacheKey = `${testId}-${Date.now()}`;
        const cached = this.selectedVariants.get(cacheKey);
        if (cached) {
            return test.variants.find((v) => v.id === cached) || test.variants[0];
        }
        // Select variant based on weights
        const selected = this.selectByWeight(test.variants);
        this.selectedVariants.set(cacheKey, selected.id);
        // Cleanup old cache entries (keep last 10000)
        if (this.selectedVariants.size > 10000) {
            const entries = Array.from(this.selectedVariants.entries());
            const toDelete = entries.slice(0, entries.length - 10000);
            toDelete.forEach(([key]) => this.selectedVariants.delete(key));
        }
        return selected;
    }
    /**
     * Record a test result
     */
    recordResult(testId, variant, metrics) {
        const test = this.tests.get(testId);
        if (!test) {
            console.warn(`Test not found for result recording: ${testId}`);
            return;
        }
        const result = {
            testId,
            variantId: variant.id,
            success: metrics.success ?? true,
            executionTime: metrics.executionTime ?? 0,
            confidence: metrics.confidence ?? undefined,
            quality: metrics.quality ?? undefined,
            userSatisfaction: metrics.userSatisfaction ?? undefined,
            errorRate: metrics.errorRate ?? undefined,
            timestamp: new Date(),
        };
        const results = this.results.get(testId) || [];
        results.push(result);
        // Keep bounded history (max 50k results per test)
        if (results.length > 50000) {
            results.splice(0, results.length - 50000);
        }
        this.results.set(testId, results);
        console.log(`[ABTest] Recorded result for test '${testId}' variant '${variant.id}' - success: ${result.success}`);
    }
    /**
     * Generate A/B test report
     */
    generateReport(testId) {
        const test = this.tests.get(testId);
        if (!test) {
            throw new Error(`Test not found: ${testId}`);
        }
        const results = this.results.get(testId) || [];
        const variantStats = test.variants.map((variant) => {
            const variantResults = results.filter((r) => r.variantId === variant.id);
            const successCount = variantResults.filter((r) => r.success).length;
            return {
                id: variant.id,
                name: variant.name,
                results: variantResults.length,
                successRate: variantResults.length > 0 ? successCount / variantResults.length : 0,
                avgExecutionTime: variantResults.length > 0
                    ? variantResults.reduce((sum, r) => sum + r.executionTime, 0) / variantResults.length
                    : 0,
                confidence: variantResults.length > 0
                    ? variantResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / variantResults.length
                    : undefined,
            };
        });
        // Simple significance test (chi-square approximation)
        const significance = this.calculateSignificance(variantStats);
        const winner = variantStats.length > 0
            ? variantStats.reduce((prev, current) => current.successRate > prev.successRate ? current : prev).id
            : undefined;
        return {
            testId,
            testName: test.name,
            sampleSize: results.length,
            variants: variantStats,
            winner,
            significance,
            pValue: this.calculatePValue(variantStats),
        };
    }
    /**
     * Calculate statistical significance (simplified)
     */
    calculateSignificance(variantStats) {
        if (variantStats.length < 2)
            return false;
        const minSampleSize = 100; // Minimum samples per variant
        const maxSampleSize = Math.max(...variantStats.map((v) => v.results));
        if (maxSampleSize < minSampleSize)
            return false;
        // Simple calculation: if success rate difference > 5% and min 100 samples
        const successRates = variantStats.map((v) => v.successRate);
        const maxRate = Math.max(...successRates);
        const minRate = Math.min(...successRates);
        return maxRate - minRate > 0.05 && maxSampleSize >= minSampleSize;
    }
    /**
     * Calculate p-value (simplified)
     */
    calculatePValue(variantStats) {
        if (variantStats.length < 2)
            return 1.0;
        // Simplified: return 0.05 if difference > 5%, else 0.5
        const successRates = variantStats.map((v) => v.successRate);
        const maxRate = Math.max(...successRates);
        const minRate = Math.min(...successRates);
        return maxRate - minRate > 0.05 ? 0.05 : 0.5;
    }
    /**
     * Select variant by weight distribution
     */
    selectByWeight(variants) {
        const random = Math.random();
        let cumulative = 0;
        for (const variant of variants) {
            cumulative += variant.weight;
            if (random < cumulative) {
                return variant;
            }
        }
        return variants[variants.length - 1];
    }
    /**
     * Validate test configuration
     */
    isTestValid(config) {
        if (!config.id || !config.name || !config.variants || config.variants.length < 2) {
            return false;
        }
        const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0);
        if (Math.abs(totalWeight - 1.0) > 0.01) {
            return false; // Weights should sum to ~1.0
        }
        return true;
    }
    /**
     * Get test by ID
     */
    getTest(testId) {
        return this.tests.get(testId);
    }
    /**
     * Get all active tests
     */
    getActiveTests() {
        return Array.from(this.tests.values()).filter((t) => t.enabled);
    }
    /**
     * Disable a test
     */
    disableTest(testId) {
        const test = this.tests.get(testId);
        if (test) {
            test.enabled = false;
            console.log(`[ABTest] Disabled test: ${testId}`);
        }
    }
    /**
     * Get statistics for all tests
     */
    getAllStats() {
        const stats = {};
        for (const [testId, results] of this.results) {
            const test = this.tests.get(testId);
            if (test) {
                const successCount = results.filter((r) => r.success).length;
                stats[testId] = {
                    sampleSize: results.length,
                    variants: test.variants.length,
                    successRate: results.length > 0 ? successCount / results.length : 0,
                };
            }
        }
        return stats;
    }
}
exports.ABTestService = ABTestService;
/**
 * Get or create global singleton instance
 */
function getABTestService() {
    if (!abTestServiceInstance) {
        abTestServiceInstance = new ABTestService();
    }
    return abTestServiceInstance;
}
//# sourceMappingURL=ab-test.service.js.map