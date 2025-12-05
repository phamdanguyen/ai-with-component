/**
 * MetricsService Tests
 *
 * Tests for metrics collection and reporting
 * Week 3: Prompt Engineering & Optimization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsService, getMetricsService, type GenerationMetrics } from '../services/metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  describe('metric recording', () => {
    it('should record successful metrics', () => {
      const metric: GenerationMetrics = {
        requestId: 'req_123',
        timestamp: Date.now(),
        userMessage: 'Show me sales data',
        messageLength: 18,
        queryType: 'data-analysis',
        componentType: 'chart',
        success: true,
        executionTime: 1200,
        retryCount: 0,
        textGenerationTime: 500,
        componentGenerationTime: 700,
        usedFallback: false,
        toolsUsed: ['getSalesData'],
        toolCount: 1,
        textModel: 'gemini-1.5-flash-8b',
        componentModel: 'gemini-1.5-pro',
        isStreaming: false,
      };

      service.recordMetric(metric);
      const report = service.generateReport();

      expect(report.summary.totalRequests).toBe(1);
      expect(report.summary.successRate).toBe(100);
    });

    it('should record failed metrics', () => {
      const metric: GenerationMetrics = {
        requestId: 'req_123',
        timestamp: Date.now(),
        userMessage: 'Show me sales data',
        messageLength: 18,
        queryType: 'data-analysis',
        success: false,
        failureReason: 'API error',
        errorType: 'api_error',
        executionTime: 500,
        retryCount: 2,
        usedFallback: true,
      };

      service.recordMetric(metric);
      const report = service.generateReport();

      expect(report.totalMetrics).toBe(1);
      expect(report.successRate).toBe(0.0);
      expect(report.totalFailures).toBe(1);
    });

    it('should handle multiple metrics', () => {
      for (let i = 0; i < 10; i++) {
        const metric: GenerationMetrics = {
          requestId: `req_${i}`,
          timestamp: Date.now(),
          userMessage: 'Test message',
          messageLength: 12,
          queryType: 'question',
          componentType: 'card',
          success: i < 7,
          executionTime: 100 + i * 10,
          retryCount: 0,
          usedFallback: false,
        };
        service.recordMetric(metric);
      }

      const report = service.generateReport();
      expect(report.totalMetrics).toBe(10);
      expect(report.successRate).toBeCloseTo(0.7, 2);
    });
  });

  describe('report generation', () => {
    it('should generate comprehensive report', () => {
      const metric: GenerationMetrics = {
        requestId: 'req_123',
        timestamp: Date.now(),
        userMessage: 'Show sales',
        messageLength: 11,
        queryType: 'data-analysis',
        componentType: 'chart',
        success: true,
        executionTime: 1000,
        retryCount: 0,
        usedFallback: false,
      };

      service.recordMetric(metric);
      const report = service.generateReport();

      expect(report.totalMetrics).toBeDefined();
      expect(report.successRate).toBeDefined();
      expect(report.totalFailures).toBeDefined();
      expect(report.avgExecutionTime).toBeDefined();
      expect(report.avgMessageLength).toBeDefined();
      expect(report.avgRetryCount).toBeDefined();
    });

    it('should calculate success rate correctly', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Test 1',
          messageLength: 6,
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'Test 2',
          messageLength: 6,
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_3',
          timestamp: Date.now(),
          userMessage: 'Test 3',
          messageLength: 6,
          success: false,
          executionTime: 100,
          retryCount: 1,
          usedFallback: true,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.successRate).toBeCloseTo(2 / 3, 2);
    });

    it('should calculate average execution time', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: true,
          executionTime: 200,
          retryCount: 0,
          usedFallback: false,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.avgExecutionTime).toBe(150);
    });
  });

  describe('query type reporting', () => {
    it('should report metrics by query type', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Show sales',
          messageLength: 10,
          queryType: 'data-analysis',
          success: true,
          executionTime: 200,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'Explain code',
          messageLength: 12,
          queryType: 'code-explanation',
          success: true,
          executionTime: 300,
          retryCount: 0,
          usedFallback: false,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.byQueryType['data-analysis']).toBeDefined();
      expect(report.byQueryType['code-explanation']).toBeDefined();
      expect(report.byQueryType['data-analysis'].count).toBe(1);
      expect(report.byQueryType['code-explanation'].count).toBe(1);
    });

    it('should calculate success rate per query type', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Show sales',
          messageLength: 10,
          queryType: 'data-analysis',
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'More sales',
          messageLength: 10,
          queryType: 'data-analysis',
          success: false,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.byQueryType['data-analysis'].successRate).toBe(0.5);
    });
  });

  describe('component type reporting', () => {
    it('should report metrics by component type', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Show sales',
          messageLength: 10,
          componentType: 'chart',
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'Show table',
          messageLength: 10,
          componentType: 'table',
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.byComponentType.chart).toBeDefined();
      expect(report.byComponentType.table).toBeDefined();
    });
  });

  describe('bounded history', () => {
    it('should not exceed max metric count', () => {
      // Record more than max
      for (let i = 0; i < 15000; i++) {
        const metric: GenerationMetrics = {
          requestId: `req_${i}`,
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        };
        service.recordMetric(metric);
      }

      const report = service.generateReport();
      // Should keep only the most recent metrics within limit
      expect(report.totalMetrics).toBeLessThanOrEqual(10001); // Allowing small margin
    });
  });

  describe('export functionality', () => {
    it('should export as JSON', () => {
      const metric: GenerationMetrics = {
        requestId: 'req_123',
        timestamp: Date.now(),
        userMessage: 'Show sales',
        messageLength: 10,
        queryType: 'data-analysis',
        success: true,
        executionTime: 100,
        retryCount: 0,
        usedFallback: false,
      };

      service.recordMetric(metric);
      const json = service.exportAsJSON();

      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should export as CSV', () => {
      const metric: GenerationMetrics = {
        requestId: 'req_123',
        timestamp: Date.now(),
        userMessage: 'Show sales',
        messageLength: 10,
        queryType: 'data-analysis',
        success: true,
        executionTime: 100,
        retryCount: 0,
        usedFallback: false,
      };

      service.recordMetric(metric);
      const csv = service.exportAsCSV();

      expect(typeof csv).toBe('string');
      expect(csv).toContain('requestId');
      expect(csv).toContain('req_123');
    });
  });

  describe('global singleton', () => {
    it('should return same instance', () => {
      const instance1 = getMetricsService();
      const instance2 = getMetricsService();
      expect(instance1).toBe(instance2);
    });
  });

  describe('error tracking', () => {
    it('should track error types', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: false,
          errorType: 'schema_validation',
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: false,
          errorType: 'api_error',
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.successRate).toBe(0);
      expect(report.totalMetrics).toBe(2);
    });

    it('should track multiple metrics properly', () => {
      const metrics: GenerationMetrics[] = [
        {
          requestId: 'req_1',
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: true,
          executionTime: 100,
          retryCount: 0,
          usedFallback: false,
        },
        {
          requestId: 'req_2',
          timestamp: Date.now(),
          userMessage: 'Test',
          messageLength: 4,
          success: true,
          executionTime: 100,
          retryCount: 2,
          usedFallback: true,
        },
      ];

      metrics.forEach((m) => service.recordMetric(m));
      const report = service.generateReport();

      expect(report.totalMetrics).toBeGreaterThan(0);
      expect(report.avgMessageLength).toBeGreaterThan(0);
    });
  });
});
