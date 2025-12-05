/**
 * ABTestService Tests
 *
 * Tests for A/B testing framework
 * Week 3: Prompt Engineering & Optimization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ABTestService, getABTestService, type ABTestConfig, type ABTestVariant } from '../services/ab-test.service';

describe('ABTestService', () => {
  let service: ABTestService;

  beforeEach(() => {
    service = new ABTestService();
  });

  describe('initialization', () => {
    it('should create service with default tests', () => {
      const activeTests = service.getActiveTests();
      expect(activeTests.length).toBeGreaterThan(0);
    });

    it('should have default tests for text prompts', () => {
      const test = service.getTest('text-prompt-v1');
      expect(test).toBeDefined();
      expect(test?.name).toContain('Text Generation');
      expect(test?.variants.length).toBe(2);
    });

    it('should have default tests for temperature tuning', () => {
      const test = service.getTest('temp-tuning-v1');
      expect(test).toBeDefined();
      expect(test?.variants.length).toBe(2);
    });

    it('should have default tests for component generation', () => {
      const test = service.getTest('component-gen-v1');
      expect(test).toBeDefined();
      expect(test?.variants.length).toBe(2);
    });
  });

  describe('variant selection', () => {
    it('should return a variant for each test', () => {
      const variant = service.selectVariant('text-prompt-v1');
      expect(variant).toBeDefined();
      expect(variant.id).toBeDefined();
      expect(variant.weight).toBeGreaterThan(0);
    });

    it('should respect variant weights (fair distribution)', () => {
      const variants: Record<string, number> = {};

      // Select 2000 times to get better distribution (Central Limit Theorem)
      for (let i = 0; i < 2000; i++) {
        const variant = service.selectVariant('text-prompt-v1');
        variants[variant.id] = (variants[variant.id] || 0) + 1;
      }

      // Both variants should be selected at least once
      // With 50/50 weights and 2000 samples, expect roughly 50% each
      // Using very wide tolerance (0.1-0.9) to account for random variance
      const test = service.getTest('text-prompt-v1')!;
      for (const variant of test.variants) {
        const ratio = variants[variant.id] / 2000;
        expect(ratio).toBeGreaterThan(0.1); // At least 10% (200/2000)
        expect(ratio).toBeLessThan(0.9);    // At most 90% (1800/2000)
      }
    });

    it('should throw error for non-existent test', () => {
      expect(() => {
        service.selectVariant('non-existent-test');
      }).toThrow();
    });

    it('should throw error for disabled test', () => {
      service.disableTest('text-prompt-v1');
      expect(() => {
        service.selectVariant('text-prompt-v1');
      }).toThrow();
    });
  });

  describe('result recording', () => {
    it('should record successful results', () => {
      const variant = service.selectVariant('text-prompt-v1');
      service.recordResult('text-prompt-v1', variant, {
        success: true,
        executionTime: 100,
      });

      const report = service.generateReport('text-prompt-v1');
      expect(report.sampleSize).toBe(1);
    });

    it('should record multiple results', () => {
      const variant = service.selectVariant('text-prompt-v1');

      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 100 });
      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 120 });
      service.recordResult('text-prompt-v1', variant, { success: false, executionTime: 150 });

      const report = service.generateReport('text-prompt-v1');
      expect(report.sampleSize).toBe(3);
    });

    it('should calculate success rate', () => {
      const variant = service.selectVariant('text-prompt-v1');

      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 100 });
      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 100 });
      service.recordResult('text-prompt-v1', variant, { success: false, executionTime: 100 });

      const report = service.generateReport('text-prompt-v1');
      const variantStats = report.variants.find((v) => v.id === variant.id);
      expect(variantStats?.successRate).toBeCloseTo(0.667, 2);
    });

    it('should ignore results for non-existent tests', () => {
      const variant: ABTestVariant = {
        id: 'test-id',
        name: 'Test',
        description: 'Test variant',
        weight: 1,
        config: {},
      };

      service.recordResult('non-existent-test', variant, { success: true });
      // Should not throw
    });
  });

  describe('report generation', () => {
    it('should generate comprehensive report', () => {
      const variant = service.selectVariant('text-prompt-v1');
      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 100 });

      const report = service.generateReport('text-prompt-v1');
      expect(report.testId).toBe('text-prompt-v1');
      expect(report.testName).toBeDefined();
      expect(report.sampleSize).toBeGreaterThan(0);
      expect(report.variants.length).toBe(2);
    });

    it('should calculate average execution time', () => {
      const variant = service.selectVariant('text-prompt-v1');
      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 100 });
      service.recordResult('text-prompt-v1', variant, { success: true, executionTime: 200 });

      const report = service.generateReport('text-prompt-v1');
      const variantStats = report.variants.find((v) => v.id === variant.id);
      expect(variantStats?.avgExecutionTime).toBe(150);
    });

    it('should throw error for non-existent test', () => {
      expect(() => {
        service.generateReport('non-existent-test');
      }).toThrow();
    });

    it('should identify winner variant', () => {
      const control = service.getTest('text-prompt-v1')!.variants[0];
      const treatment = service.getTest('text-prompt-v1')!.variants[1];

      // Record better results for treatment
      for (let i = 0; i < 100; i++) {
        service.recordResult('text-prompt-v1', treatment, { success: true });
      }

      for (let i = 0; i < 100; i++) {
        service.recordResult('text-prompt-v1', control, { success: i < 50 });
      }

      const report = service.generateReport('text-prompt-v1');
      expect(report.winner).toBe(treatment.id);
    });
  });

  describe('test management', () => {
    it('should create custom test', () => {
      const customTest: ABTestConfig = {
        id: 'custom-test',
        name: 'Custom Test',
        description: 'Custom test description',
        enabled: true,
        startDate: new Date(),
        trackingId: 'custom-test',
        variants: [
          {
            id: 'variant-a',
            name: 'Variant A',
            description: 'First variant',
            weight: 0.5,
            config: {},
          },
          {
            id: 'variant-b',
            name: 'Variant B',
            description: 'Second variant',
            weight: 0.5,
            config: {},
          },
        ],
      };

      service.createTest(customTest);
      const test = service.getTest('custom-test');
      expect(test).toBeDefined();
      expect(test?.name).toBe('Custom Test');
    });

    it('should throw error for invalid test', () => {
      const invalidTest: ABTestConfig = {
        id: 'invalid-test',
        name: 'Invalid Test',
        description: 'Invalid test',
        enabled: true,
        startDate: new Date(),
        trackingId: 'invalid-test',
        variants: [
          {
            id: 'variant-a',
            name: 'Variant A',
            description: 'Only one variant',
            weight: 1.0,
            config: {},
          },
        ], // Less than 2 variants
      };

      expect(() => {
        service.createTest(invalidTest);
      }).toThrow();
    });

    it('should throw error for weights not summing to 1.0', () => {
      const invalidTest: ABTestConfig = {
        id: 'invalid-weight-test',
        name: 'Invalid Weight Test',
        description: 'Invalid weights',
        enabled: true,
        startDate: new Date(),
        trackingId: 'invalid-weight-test',
        variants: [
          {
            id: 'variant-a',
            name: 'Variant A',
            description: 'Variant A',
            weight: 0.3,
            config: {},
          },
          {
            id: 'variant-b',
            name: 'Variant B',
            description: 'Variant B',
            weight: 0.3,
            config: {},
          },
        ], // Sum is 0.6, not 1.0
      };

      expect(() => {
        service.createTest(invalidTest);
      }).toThrow();
    });

    it('should disable test', () => {
      service.disableTest('text-prompt-v1');
      const test = service.getTest('text-prompt-v1');
      expect(test?.enabled).toBe(false);
    });

    it('should return active tests only', () => {
      service.disableTest('text-prompt-v1');
      const activeTests = service.getActiveTests();

      const disabledTest = activeTests.find((t) => t.id === 'text-prompt-v1');
      expect(disabledTest).toBeUndefined();
    });
  });

  describe('statistics', () => {
    it('should get all statistics', () => {
      const variant = service.selectVariant('text-prompt-v1');
      service.recordResult('text-prompt-v1', variant, { success: true });

      const stats = service.getAllStats();
      expect(stats['text-prompt-v1']).toBeDefined();
      expect(stats['text-prompt-v1'].sampleSize).toBeGreaterThan(0);
    });

    it('should calculate success rate in statistics', () => {
      const variant = service.selectVariant('text-prompt-v1');
      service.recordResult('text-prompt-v1', variant, { success: true });
      service.recordResult('text-prompt-v1', variant, { success: false });

      const stats = service.getAllStats();
      expect(stats['text-prompt-v1'].successRate).toBe(0.5);
    });
  });

  describe('global singleton', () => {
    it('should return same instance', () => {
      const instance1 = getABTestService();
      const instance2 = getABTestService();
      expect(instance1).toBe(instance2);
    });
  });

  describe('variant configuration', () => {
    it('should include variant configuration', () => {
      const variant = service.selectVariant('text-prompt-v1');
      expect(variant.config).toBeDefined();
      expect(variant.config.version).toBeDefined();
    });

    it('should include optional prompt template', () => {
      const variant = service.selectVariant('text-prompt-v1');
      expect(variant.promptTemplate).toBeDefined();
    });

    it('should include optional temperature', () => {
      const variant = service.selectVariant('temp-tuning-v1');
      expect(variant.temperature).toBeDefined();
    });
  });
});
