/**
 * Vitest Configuration for Middleware Package
 *
 * Used for running unit and E2E tests for backend services
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Include and exclude patterns
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/__tests__/**',
        'src/server.ts', // Server entry point
      ],
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },

    // Global test setup
    globals: true,

    // Reporters
    reporters: ['verbose'],

    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,

    // Run tests sequentially for better debugging
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // Isolate test environment
    isolate: true,

    // Clear mocks between tests
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
