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
export type ApiErrorCode =
  | 'TIMEOUT'
  | 'NETWORK'
  | 'RATE_LIMIT'
  | 'AUTH'
  | 'VALIDATION'
  | 'SERVER'
  | 'UNKNOWN';

/**
 * Custom API Error
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode?: number;
  readonly retryable: boolean;
  readonly userMessage: string;
  readonly originalError?: Error;

  constructor(
    code: ApiErrorCode,
    message: string,
    options?: {
      statusCode?: number;
      retryable?: boolean;
      userMessage?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = options?.statusCode;
    this.retryable = options?.retryable ?? false;
    this.userMessage = options?.userMessage ?? this.getDefaultUserMessage(code);
    this.originalError = options?.originalError;
  }

  private getDefaultUserMessage(code: ApiErrorCode): string {
    switch (code) {
      case 'TIMEOUT':
        return 'The request timed out. Please try again.';
      case 'NETWORK':
        return 'Network error. Please check your connection.';
      case 'RATE_LIMIT':
        return 'Too many requests. Please wait a moment and try again.';
      case 'AUTH':
        return 'Authentication failed. Please check your credentials.';
      case 'VALIDATION':
        return 'Invalid request. Please check your input.';
      case 'SERVER':
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
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

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableCodes: ['TIMEOUT', 'NETWORK', 'RATE_LIMIT', 'SERVER'],
};

/**
 * Timeout Configuration
 */
export interface TimeoutConfig {
  defaultTimeoutMs: number;
  streamTimeoutMs: number;
  structuredTimeoutMs: number;
}

const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  defaultTimeoutMs: 30000, // 30 seconds
  streamTimeoutMs: 60000, // 60 seconds for streaming
  structuredTimeoutMs: 45000, // 45 seconds for structured generation
};

/**
 * API Error Handler Service
 */
export class ApiErrorHandler {
  private retryConfig: RetryConfig;
  private timeoutConfig: TimeoutConfig;

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    timeoutConfig: Partial<TimeoutConfig> = {}
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.timeoutConfig = { ...DEFAULT_TIMEOUT_CONFIG, ...timeoutConfig };
  }

  /**
   * Execute with timeout using AbortController
   */
  async withTimeout<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs ?? this.timeoutConfig.defaultTimeoutMs;
    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const result = await operation(signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', `Operation timed out after ${timeout}ms`, {
          retryable: true,
          userMessage: `The request took too long (>${Math.round(timeout / 1000)}s). Please try again.`,
        });
      }

      throw this.classifyError(error);
    }
  }

  /**
   * Execute with retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.retryConfig, ...config };
    let lastError: Error | null = null;
    let delay = retryConfig.initialDelayMs;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const apiError = this.classifyError(lastError);

        // Check if error is retryable
        if (!this.isRetryable(apiError, retryConfig) || attempt >= retryConfig.maxRetries) {
          throw apiError;
        }

        // Log retry attempt
        console.log(
          `[ApiErrorHandler] Retry attempt ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`
        );

        // Wait with exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * retryConfig.backoffMultiplier, retryConfig.maxDelayMs);
      }
    }

    throw lastError || new ApiError('UNKNOWN', 'Retry operation failed');
  }

  /**
   * Execute with both timeout and retry
   */
  async withTimeoutAndRetry<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    options?: {
      timeoutMs?: number;
      retryConfig?: Partial<RetryConfig>;
    }
  ): Promise<T> {
    return this.withRetry(
      () => this.withTimeout(operation, options?.timeoutMs),
      options?.retryConfig
    );
  }

  /**
   * Classify error into ApiError
   */
  classifyError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    const err = error instanceof Error ? error : new Error(String(error));
    const message = err.message.toLowerCase();

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      err.name === 'AbortError'
    ) {
      return new ApiError('TIMEOUT', err.message, {
        retryable: true,
        originalError: err,
      });
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('fetch failed')
    ) {
      return new ApiError('NETWORK', err.message, {
        retryable: true,
        originalError: err,
      });
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('429') || message.includes('quota')) {
      return new ApiError('RATE_LIMIT', err.message, {
        statusCode: 429,
        retryable: true,
        originalError: err,
      });
    }

    // Auth errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('api key')
    ) {
      return new ApiError('AUTH', err.message, {
        statusCode: 401,
        retryable: false,
        originalError: err,
      });
    }

    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('400')
    ) {
      return new ApiError('VALIDATION', err.message, {
        statusCode: 400,
        retryable: false,
        originalError: err,
      });
    }

    // Server errors
    if (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('internal server')
    ) {
      return new ApiError('SERVER', err.message, {
        statusCode: 500,
        retryable: true,
        originalError: err,
      });
    }

    // Unknown
    return new ApiError('UNKNOWN', err.message, {
      retryable: false,
      originalError: err,
    });
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: ApiError, config?: RetryConfig): boolean {
    const retryConfig = config || this.retryConfig;

    if (!error.retryable) {
      return false;
    }

    if (retryConfig.retryableCodes.includes(error.code)) {
      return true;
    }

    if (error.statusCode && retryConfig.retryableStatusCodes.includes(error.statusCode)) {
      return true;
    }

    return false;
  }

  /**
   * Get user-friendly error message with recovery hints
   */
  getUserMessage(error: unknown): {
    message: string;
    hint?: string;
    retryable: boolean;
  } {
    const apiError = this.classifyError(error);

    const hints: Record<ApiErrorCode, string | undefined> = {
      TIMEOUT: 'The server might be busy. Try again in a few seconds.',
      NETWORK: 'Check your internet connection and try again.',
      RATE_LIMIT: 'You\'re sending requests too quickly. Wait a moment before trying again.',
      AUTH: 'Please check your API key configuration.',
      VALIDATION: 'Please check your input and try again.',
      SERVER: 'The server is experiencing issues. Try again later.',
      UNKNOWN: undefined,
    };

    return {
      message: apiError.userMessage,
      hint: hints[apiError.code],
      retryable: apiError.retryable,
    };
  }

  /**
   * Get timeout for specific operation type
   */
  getTimeout(type: 'default' | 'stream' | 'structured'): number {
    switch (type) {
      case 'stream':
        return this.timeoutConfig.streamTimeoutMs;
      case 'structured':
        return this.timeoutConfig.structuredTimeoutMs;
      default:
        return this.timeoutConfig.defaultTimeoutMs;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): { retry: RetryConfig; timeout: TimeoutConfig } {
    return {
      retry: { ...this.retryConfig },
      timeout: { ...this.timeoutConfig },
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Default singleton instance
let defaultHandler: ApiErrorHandler | null = null;

export function getApiErrorHandler(): ApiErrorHandler {
  if (!defaultHandler) {
    defaultHandler = new ApiErrorHandler();
  }
  return defaultHandler;
}
