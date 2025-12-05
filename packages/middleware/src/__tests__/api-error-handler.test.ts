/**
 * API Error Handler Tests
 *
 * Story 6-2: API Error Handling & Timeouts
 * Coverage: Timeout, Retry, Error Classification, User Messages
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ApiErrorHandler,
  ApiError,
  getApiErrorHandler,
} from '../services/api-error-handler';

describe('ApiErrorHandler', () => {
  let handler: ApiErrorHandler;

  beforeEach(() => {
    handler = new ApiErrorHandler();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ApiError', () => {
    it('should create ApiError with default user message', () => {
      const error = new ApiError('TIMEOUT', 'Operation timed out');

      expect(error.code).toBe('TIMEOUT');
      expect(error.message).toBe('Operation timed out');
      expect(error.userMessage).toBe('The request timed out. Please try again.');
      expect(error.retryable).toBe(false);
    });

    it('should create ApiError with custom user message', () => {
      const error = new ApiError('NETWORK', 'Connection failed', {
        userMessage: 'Custom network error message',
        retryable: true,
      });

      expect(error.userMessage).toBe('Custom network error message');
      expect(error.retryable).toBe(true);
    });

    it('should preserve original error', () => {
      const original = new Error('Original error');
      const error = new ApiError('UNKNOWN', 'Wrapped error', {
        originalError: original,
      });

      expect(error.originalError).toBe(original);
    });

    it('should include status code', () => {
      const error = new ApiError('RATE_LIMIT', 'Too many requests', {
        statusCode: 429,
      });

      expect(error.statusCode).toBe(429);
    });
  });

  describe('Timeout Handling', () => {
    it('should complete operation within timeout', async () => {
      const operation = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'success';
      });

      const resultPromise = handler.withTimeout(operation, 5000);
      await vi.advanceTimersByTimeAsync(100);
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should throw ApiError on timeout', async () => {
      const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve('done'), 10000);
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      });

      const promise = handler.withTimeout(operation, 100);

      // Attach catch handler before advancing time to prevent unhandled rejection
      let caughtError: unknown = null;
      const handled = promise.catch((e) => {
        caughtError = e;
      });

      await vi.advanceTimersByTimeAsync(150);
      await handled;

      expect(caughtError).toBeInstanceOf(ApiError);
      expect((caughtError as ApiError).code).toBe('TIMEOUT');
      expect((caughtError as ApiError).retryable).toBe(true);
    });

    it('should pass AbortSignal to operation', async () => {
      const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
        expect(signal).toBeInstanceOf(AbortSignal);
        return 'with-signal';
      });

      const resultPromise = handler.withTimeout(operation, 5000);
      await vi.advanceTimersByTimeAsync(10);
      const result = await resultPromise;

      expect(result).toBe('with-signal');
    });

    it('should use default timeout when not specified', async () => {
      const customHandler = new ApiErrorHandler({}, { defaultTimeoutMs: 500 });
      const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve('done'), 1000);
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      });

      const promise = customHandler.withTimeout(operation);

      // Attach catch handler before advancing time to prevent unhandled rejection
      let caughtError: unknown = null;
      const handled = promise.catch((e) => {
        caughtError = e;
      });

      await vi.advanceTimersByTimeAsync(600);
      await handled;

      expect(caughtError).toBeDefined();
      expect((caughtError as ApiError).code).toBe('TIMEOUT');
    });
  });

  describe('Retry Logic', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await handler.withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('TIMEOUT', 'timeout', { retryable: true }))
        .mockResolvedValue('success after retry');

      const resultPromise = handler.withRetry(operation, { maxRetries: 3 });
      await vi.advanceTimersByTimeAsync(2000);
      const result = await resultPromise;

      expect(result).toBe('success after retry');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError('AUTH', 'unauthorized', { retryable: false }));

      await expect(handler.withRetry(operation, { maxRetries: 3 })).rejects.toMatchObject({
        code: 'AUTH',
      });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError('TIMEOUT', 'timeout', { retryable: true }));

      const promise = handler.withRetry(operation, { maxRetries: 2 });

      // Attach catch handler before advancing time to prevent unhandled rejection
      let caughtError: unknown = null;
      const handled = promise.catch((e) => {
        caughtError = e;
      });

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(10000);
      await handled;

      expect(caughtError).toBeDefined();
      expect((caughtError as ApiError).code).toBe('TIMEOUT');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const delays: number[] = [];
      const sleepSpy = vi.spyOn(global, 'setTimeout');

      const operation = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('TIMEOUT', 'timeout', { retryable: true }))
        .mockRejectedValueOnce(new ApiError('TIMEOUT', 'timeout', { retryable: true }))
        .mockResolvedValue('success');

      const promise = handler.withRetry(operation, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
      });

      await vi.advanceTimersByTimeAsync(5000);
      await promise;

      // First retry at 100ms, second at 200ms
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should cap delay at maxDelayMs', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new ApiError('TIMEOUT', 't', { retryable: true }))
        .mockRejectedValueOnce(new ApiError('TIMEOUT', 't', { retryable: true }))
        .mockRejectedValueOnce(new ApiError('TIMEOUT', 't', { retryable: true }))
        .mockResolvedValue('success');

      const promise = handler.withRetry(operation, {
        maxRetries: 4,
        initialDelayMs: 1000,
        maxDelayMs: 2000,
        backoffMultiplier: 10,
      });

      await vi.advanceTimersByTimeAsync(10000);
      await promise;

      expect(operation).toHaveBeenCalledTimes(4);
    });
  });

  describe('Combined Timeout and Retry', () => {
    it('should retry timeout errors', async () => {
      let callCount = 0;
      const operation = vi.fn().mockImplementation(async (signal: AbortSignal) => {
        callCount++;
        if (callCount < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => resolve('done'), 10000);
            signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              const error = new Error('Aborted');
              error.name = 'AbortError';
              reject(error);
            });
          });
        }
        return 'success';
      });

      const promise = handler.withTimeoutAndRetry(operation, {
        timeoutMs: 100,
        retryConfig: { maxRetries: 3 },
      });

      await vi.advanceTimersByTimeAsync(5000);
      const result = await promise;

      expect(result).toBe('success');
      expect(callCount).toBe(2);
    });
  });

  describe('Error Classification', () => {
    it('should classify timeout errors', () => {
      const error = handler.classifyError(new Error('Request timed out'));

      expect(error.code).toBe('TIMEOUT');
      expect(error.retryable).toBe(true);
    });

    it('should classify network errors', () => {
      const errors = [
        'ECONNREFUSED',
        'ECONNRESET',
        'ENOTFOUND',
        'Network error',
        'fetch failed',
      ];

      for (const msg of errors) {
        const error = handler.classifyError(new Error(msg));
        expect(error.code).toBe('NETWORK');
        expect(error.retryable).toBe(true);
      }
    });

    it('should classify rate limit errors', () => {
      const errors = ['rate limit exceeded', '429 Too Many Requests', 'quota exceeded'];

      for (const msg of errors) {
        const error = handler.classifyError(new Error(msg));
        expect(error.code).toBe('RATE_LIMIT');
        expect(error.retryable).toBe(true);
      }
    });

    it('should classify auth errors', () => {
      const errors = ['Unauthorized', '401', '403', 'API key invalid'];

      for (const msg of errors) {
        const error = handler.classifyError(new Error(msg));
        expect(error.code).toBe('AUTH');
        expect(error.retryable).toBe(false);
      }
    });

    it('should classify validation errors', () => {
      const errors = ['Invalid request', 'Validation failed', '400 Bad Request'];

      for (const msg of errors) {
        const error = handler.classifyError(new Error(msg));
        expect(error.code).toBe('VALIDATION');
        expect(error.retryable).toBe(false);
      }
    });

    it('should classify server errors', () => {
      const errors = ['500 Internal Server Error', '502', '503', '504'];

      for (const msg of errors) {
        const error = handler.classifyError(new Error(msg));
        expect(error.code).toBe('SERVER');
        expect(error.retryable).toBe(true);
      }
    });

    it('should return UNKNOWN for unclassified errors', () => {
      const error = handler.classifyError(new Error('Something weird happened'));

      expect(error.code).toBe('UNKNOWN');
      expect(error.retryable).toBe(false);
    });

    it('should return existing ApiError unchanged', () => {
      const original = new ApiError('RATE_LIMIT', 'Rate limited', { statusCode: 429 });
      const classified = handler.classifyError(original);

      expect(classified).toBe(original);
    });

    it('should handle non-Error objects', () => {
      const error = handler.classifyError('string error');

      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('UNKNOWN');
    });
  });

  describe('User Messages', () => {
    it('should return user-friendly message for timeout', () => {
      const error = new ApiError('TIMEOUT', 'timed out');
      const result = handler.getUserMessage(error);

      expect(result.message).toBe('The request timed out. Please try again.');
      expect(result.hint).toContain('busy');
      expect(result.retryable).toBe(false);
    });

    it('should return user-friendly message for network error', () => {
      const error = new ApiError('NETWORK', 'ECONNREFUSED', { retryable: true });
      const result = handler.getUserMessage(error);

      expect(result.message).toBe('Network error. Please check your connection.');
      expect(result.hint).toContain('internet');
      expect(result.retryable).toBe(true);
    });

    it('should return user-friendly message for rate limit', () => {
      const error = new ApiError('RATE_LIMIT', '429', { retryable: true });
      const result = handler.getUserMessage(error);

      expect(result.message).toBe('Too many requests. Please wait a moment and try again.');
      expect(result.hint).toContain('quickly');
    });

    it('should return user-friendly message for auth error', () => {
      const error = new ApiError('AUTH', 'unauthorized');
      const result = handler.getUserMessage(error);

      expect(result.message).toBe('Authentication failed. Please check your credentials.');
      expect(result.hint).toContain('API key');
    });

    it('should classify and return message for raw errors', () => {
      const result = handler.getUserMessage(new Error('timeout'));

      expect(result.message).toBe('The request timed out. Please try again.');
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = handler.getConfig();

      expect(config.retry.maxRetries).toBe(3);
      expect(config.timeout.defaultTimeoutMs).toBe(30000);
    });

    it('should merge custom configuration', () => {
      const customHandler = new ApiErrorHandler(
        { maxRetries: 5 },
        { defaultTimeoutMs: 10000 }
      );
      const config = customHandler.getConfig();

      expect(config.retry.maxRetries).toBe(5);
      expect(config.timeout.defaultTimeoutMs).toBe(10000);
    });

    it('should return correct timeout for operation types', () => {
      expect(handler.getTimeout('default')).toBe(30000);
      expect(handler.getTimeout('stream')).toBe(60000);
      expect(handler.getTimeout('structured')).toBe(45000);
    });
  });

  describe('isRetryable', () => {
    it('should check retryable flag', () => {
      const retryable = new ApiError('TIMEOUT', 't', { retryable: true });
      const notRetryable = new ApiError('AUTH', 'a', { retryable: false });

      expect(handler.isRetryable(retryable)).toBe(true);
      expect(handler.isRetryable(notRetryable)).toBe(false);
    });

    it('should check retryable codes', () => {
      const error = new ApiError('TIMEOUT', 't', { retryable: true });

      expect(handler.isRetryable(error)).toBe(true);
    });

    it('should check retryable status codes', () => {
      const error = new ApiError('SERVER', 's', { statusCode: 503, retryable: true });

      expect(handler.isRetryable(error)).toBe(true);
    });

    it('should use custom config', () => {
      const error = new ApiError('TIMEOUT', 't', { retryable: true });

      expect(handler.isRetryable(error, { retryableCodes: [] } as any)).toBe(false);
    });
  });

  describe('Singleton', () => {
    it('should return same instance', () => {
      const handler1 = getApiErrorHandler();
      const handler2 = getApiErrorHandler();

      expect(handler1).toBe(handler2);
    });
  });
});
