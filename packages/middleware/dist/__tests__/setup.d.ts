/**
 * Test Setup & Utilities
 *
 * Common utilities and mocks for E2E testing
 */
import type { IStructuredGenerator, JSONSchema } from '../services/interfaces';
import type { ComponentSpec, ToolCallResult } from '../types/core.types';
/**
 * Mock LLM Generator for testing
 */
export declare class MockLLMGenerator implements IStructuredGenerator {
    private responses;
    private callCount;
    /**
     * Register a mock response for a specific prompt pattern
     */
    registerResponse(promptPattern: string, response: any): void;
    /**
     * Generate structured response from mock data
     */
    generateStructured<T>(prompt: string, schema: JSONSchema, options?: any): Promise<T>;
    /**
     * Get call count for assertions
     */
    getCallCount(): number;
    /**
     * Reset mock for next test
     */
    reset(): void;
    /**
     * Validate output against schema
     * Mock implementation: always returns true
     */
    validateOutput<T>(output: any, schema: JSONSchema): output is T;
}
/**
 * Sample test data generators
 */
export declare const testData: {
    /**
     * Sample sales data for testing
     */
    salesData: () => ToolCallResult[];
    /**
     * Sample employee data for testing
     */
    employeeData: () => ToolCallResult[];
    /**
     * Sample product data for testing
     */
    productData: () => ToolCallResult[];
    /**
     * Sample survey responses
     */
    surveyData: () => ToolCallResult[];
    /**
     * Sample market data with trends
     */
    marketData: () => ToolCallResult[];
    /**
     * Empty data for testing fallback
     */
    emptyData: () => ToolCallResult[];
    /**
     * Single object data (not array)
     */
    singleObject: () => ToolCallResult[];
};
/**
 * Sample valid component responses for mocking
 */
export declare const validComponentResponses: {
    chart: () => ComponentSpec;
    table: () => ComponentSpec;
    card: () => ComponentSpec;
    form: () => ComponentSpec;
    list: () => ComponentSpec;
    slides: () => ComponentSpec;
    report: () => ComponentSpec;
};
/**
 * Invalid component responses for testing validation failures
 */
export declare const invalidComponentResponses: {
    /**
     * Chart with missing data
     */
    chartMissingData: () => ComponentSpec;
    /**
     * Chart with missing axis keys
     */
    chartBadAxisKeys: () => ComponentSpec;
    /**
     * Table with duplicate column keys
     */
    tableDuplicateColumns: () => ComponentSpec;
    /**
     * Form with duplicate field names
     */
    formDuplicateFields: () => ComponentSpec;
    /**
     * Select field without options
     */
    formSelectNoOptions: () => ComponentSpec;
    /**
     * List with duplicate IDs
     */
    listDuplicateIds: () => ComponentSpec;
    /**
     * Slides with missing content
     */
    slidesMissingContent: () => ComponentSpec;
    /**
     * Missing required field (content)
     */
    cardMissingContent: () => ComponentSpec;
};
//# sourceMappingURL=setup.d.ts.map