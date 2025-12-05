/**
 * API Error Handler
 *
 * Story 6-2: API Error Handling & Timeouts
 * Provides:
 * - Timeout handling with AbortController
 * - Retry logic with exponential backoff
 * - User-friendly error messages
 * - Error classification and recovery hints
 *
 * Pattern: Strategy pattern for error recovery
 * SOLID: Single Responsibility - API error management
 */
/**
 * API Error Types
 */
export type ApiErrorCode = 'TIMEOUT' | 'NETWORK' | 'RATE_LIMIT' | 'AUTH' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';
/**
 * Custom API Error
 */
export declare class ApiError extends Error {
    readonly code: ApiErrorCode;
    readonly statusCode?: number;
    readonly retryable: boolean;
    readonly userMessage: string;
    readonly originalError?: Error;
    constructor(code: ApiErrorCode, message: string, options?: {
        statusCode?: number;
        retryable?: boolean;
        userMessage?: string;
        originalError?: Error;
    });
    private getDefaultUserMessage;
}
/**
 * Retry Configuration
 */
export interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableStatusCodes: number[];
    retryableCodes: ApiErrorCode[];
}
/**
 * Timeout Configuration
 */
export interface TimeoutConfig {
    defaultTimeoutMs: number;
    streamTimeoutMs: number;
    structuredTimeoutMs: number;
}
/**
 * API Error Handler Service
 */
export declare class ApiErrorHandler {
    private retryConfig;
    private timeoutConfig;
    constructor(retryConfig?: Partial<RetryConfig>, timeoutConfig?: Partial<TimeoutConfig>);
    /**
     * Execute with timeout using AbortController
     */
    withTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs?: number): Promise<T>;
    /**
     * Execute with retry logic
     */
    withRetry<T>(operation: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T>;
    /**
     * Execute with both timeout and retry
     */
    withTimeoutAndRetry<T>(operation: (signal: AbortSignal) => Promise<T>, options?: {
        timeoutMs?: number;
        retryConfig?: Partial<RetryConfig>;
    }): Promise<T>;
    /**
     * Classify error into ApiError
     */
    classifyError(error: unknown): ApiError;
    /**
     * Check if error is retryable
     */
    isRetryable(error: ApiError, config?: RetryConfig): boolean;
    /**
     * Get user-friendly error message with recovery hints
     */
    getUserMessage(error: unknown): {
        message: string;
        hint?: string;
        retryable: boolean;
    };
    /**
     * Get timeout for specific operation type
     */
    getTimeout(type: 'default' | 'stream' | 'structured'): number;
    /**
     * Get current configuration
     */
    getConfig(): {
        retry: RetryConfig;
        timeout: TimeoutConfig;
    };
    /**
     * Sleep helper
     */
    private sleep;
}
export declare function getApiErrorHandler(): ApiErrorHandler;
//# sourceMappingURL=api-error-handler.d.ts.map