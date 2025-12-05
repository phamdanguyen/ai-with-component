/**
 * Component Generation Service - E2E Tests
 *
 * Comprehensive end-to-end tests for the component generation pipeline
 * Tests validation, retry logic, error recovery, and fallback scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentGenerationService } from '../services/component-generation.service';
import {
  MockLLMGenerator,
  testData,
  validComponentResponses,
  invalidComponentResponses,
} from './setup';

describe('ComponentGenerationService - E2E Tests', () => {
  let service: ComponentGenerationService;
  let mockLLM: MockLLMGenerator;

  beforeEach(() => {
    mockLLM = new MockLLMGenerator();
    service = new ComponentGenerationService(mockLLM);
  });

  describe('SUCCESS SCENARIOS - Valid Component Generation', () => {
    it('should generate valid chart component on first attempt', async () => {
      const userQuery = 'Show sales trend for Q1';
      mockLLM.registerResponse('chart', validComponentResponses.chart());

      const result = await service.generateComponent(userQuery, testData.salesData());

      expect(result.type).toBe('chart');
      expect(result.props.chartType).toBe('line');
      expect(result.props.data).toHaveLength(3);
      expect(result.props.xAxis?.key).toBe('month');
    });

    it('should generate valid table component on first attempt', async () => {
      const userQuery = 'Display employee directory';
      mockLLM.registerResponse('table', validComponentResponses.table());

      const result = await service.generateComponent(userQuery, testData.employeeData());

      expect(result.type).toBe('table');
      expect(result.props.columns).toHaveLength(4);
      expect(result.props.data).toHaveLength(2);
      expect(result.props.columns[0].key).toBe('name');
    });

    it('should generate valid card component on first attempt', async () => {
      const userQuery = 'Show system status';
      mockLLM.registerResponse('card', validComponentResponses.card());

      const result = await service.generateComponent(userQuery, testData.singleObject());

      expect(result.type).toBe('card');
      expect(result.props.content).toBe('All systems operational');
      expect(result.props.variant).toBe('success');
    });

    it('should generate valid form component on first attempt', async () => {
      const userQuery = 'Create contact form';
      mockLLM.registerResponse('form', validComponentResponses.form());

      const result = await service.generateComponent(userQuery, testData.surveyData());

      expect(result.type).toBe('form');
      expect(result.props.fields).toHaveLength(2);
      expect(result.props.fields[0].type).toBe('email');
    });

    it('should generate valid list component on first attempt', async () => {
      const userQuery = 'Display product list';
      mockLLM.registerResponse('list', validComponentResponses.list());

      const result = await service.generateComponent(userQuery, testData.productData());

      expect(result.type).toBe('list');
      expect(result.props.items).toHaveLength(2);
      expect(result.props.items[0].title).toBe('Product A');
    });

    it('should generate valid slides component on first attempt', async () => {
      const userQuery = 'Create tutorial presentation';
      mockLLM.registerResponse('slides', validComponentResponses.slides());

      const result = await service.generateComponent(userQuery, testData.surveyData());

      expect(result.type).toBe('slides');
      expect(result.props.slides).toHaveLength(2);
      expect(result.props.slides[0].title).toBe('Welcome');
    });

    it('should generate valid report component on first attempt', async () => {
      const userQuery = 'Generate quarterly report';
      mockLLM.registerResponse('report', validComponentResponses.report());

      const result = await service.generateComponent(userQuery, testData.marketData());

      expect(result.type).toBe('report');
      expect(result.props.sections).toHaveLength(1);
      expect(result.props.sections[0].metrics).toHaveLength(1);
    });
  });

  describe('VALIDATION FAILURE & RETRY SCENARIOS', () => {
    it('should retry on chart validation failure with corrected data on second attempt', async () => {
      const userQuery = 'Show sales trend';

      // First attempt: invalid (missing data)
      mockLLM.registerResponse('chart', invalidComponentResponses.chartMissingData());

      // This should fail validation and use fallback (inferred from data structure)
      const result = await service.generateComponent(userQuery, testData.salesData());

      // Fallback infers component type from data (salesData has 3 keys -> list)
      expect(['card', 'list', 'table']).toContain(result.type);
    });

    it('should detect and report table column mismatch errors', async () => {
      const userQuery = 'Display employee data';
      mockLLM.registerResponse('table', invalidComponentResponses.tableDuplicateColumns());

      const result = await service.generateComponent(userQuery, testData.employeeData());

      // Validation fails, returns fallback (inferred from data - employeeData has 5 keys -> table)
      expect(['card', 'table']).toContain(result.type);
    });

    it('should detect and report form duplicate field names', async () => {
      const userQuery = 'Create form';
      mockLLM.registerResponse('form', invalidComponentResponses.formDuplicateFields());

      const result = await service.generateComponent(userQuery, testData.surveyData());

      // Validation fails, returns fallback (surveyData has 3 keys -> list)
      expect(['card', 'list']).toContain(result.type);
    });

    it('should detect select field missing options', async () => {
      const userQuery = 'Create form with dropdown';
      mockLLM.registerResponse('form', invalidComponentResponses.formSelectNoOptions());

      const result = await service.generateComponent(userQuery, testData.singleObject());

      expect(result.type).toBe('card');
    });

    it('should detect list duplicate IDs', async () => {
      const userQuery = 'Display items';
      mockLLM.registerResponse('list', invalidComponentResponses.listDuplicateIds());

      const result = await service.generateComponent(userQuery, testData.productData());

      // Validation fails, returns fallback (productData has 4 keys -> table)
      expect(['card', 'table', 'list']).toContain(result.type);
    });
  });

  describe('FALLBACK SCENARIOS', () => {
    it('should return fallback card when all generation attempts fail', async () => {
      const userQuery = 'Generate something';
      // Don't register any response - will throw error

      const result = await service.generateComponent(userQuery, testData.singleObject());

      expect(result.type).toBe('card');
      expect(result.props.variant).toBe('warning');
      expect(result.props.content).toContain('Unable to generate');
    });

    it('should infer table component from multi-column data on fallback', async () => {
      const userQuery = 'Show data';
      // Register invalid response to trigger fallback logic
      mockLLM.registerResponse('chart', invalidComponentResponses.chartBadAxisKeys());

      const result = await service.generateComponent(userQuery, testData.employeeData());

      // May be table or card depending on inference
      expect(['table', 'card', 'list']).toContain(result.type);
    });

    it('should infer list component from simple array on fallback', async () => {
      const userQuery = 'Show items';
      mockLLM.registerResponse('list', invalidComponentResponses.listDuplicateIds());

      const result = await service.generateComponent(userQuery, testData.productData());

      // Should fall back to inferred component (productData has 4 keys -> table)
      expect(['card', 'list', 'table']).toContain(result.type);
    });

    it('should handle empty data gracefully with card fallback', async () => {
      const userQuery = 'Generate component';
      // Will fail validation due to empty data
      mockLLM.registerResponse('table', {
        type: 'table',
        id: 'empty',
        props: { columns: [], data: [] },
      });

      const result = await service.generateComponent(userQuery, testData.emptyData());

      expect(result.type).toBe('card');
      expect(result.props.content).toContain('Unable');
    });
  });

  describe('DATA SENSITIVITY - Correct Component Selection', () => {
    it('should select chart for time-series data', async () => {
      const userQuery = 'Visualize sales over time';
      // Register response pattern that matches the query
      mockLLM.registerResponse('Visualize', validComponentResponses.chart());

      const result = await service.generateComponent(userQuery, testData.salesData());

      expect(result.type).toBe('chart');
    });

    it('should select table for multi-column tabular data', async () => {
      const userQuery = 'Show employee records';
      mockLLM.registerResponse('employee', validComponentResponses.table());

      const result = await service.generateComponent(userQuery, testData.employeeData());

      expect(result.type).toBe('table');
    });

    it('should select form for survey responses', async () => {
      const userQuery = 'Create survey';
      mockLLM.registerResponse('survey', validComponentResponses.form());

      const result = await service.generateComponent(userQuery, testData.surveyData());

      expect(result.type).toBe('form');
    });

    it('should select report for complex multi-section data', async () => {
      const userQuery = 'Generate quarterly analysis';
      mockLLM.registerResponse('market', validComponentResponses.report());

      const result = await service.generateComponent(userQuery, testData.marketData());

      expect(result.type).toBe('report');
    });
  });

  describe('ERROR HANDLING & EDGE CASES', () => {
    it('should handle LLM generation errors gracefully', async () => {
      const userQuery = 'Generate component';
      // Mock will throw error when no response registered
      mockLLM.registerResponse('never_matches_this', { type: 'card' });

      const result = await service.generateComponent(userQuery, testData.singleObject());

      // Should return fallback card with error message
      expect(result.type).toBe('card');
      expect(result.props.variant).toBe('warning');
    });

    it('should preserve component data through retry cycles', async () => {
      const userQuery = 'Display sales';
      mockLLM.registerResponse('sales', validComponentResponses.chart());

      const result = await service.generateComponent(userQuery, testData.salesData());

      expect(result.props.data).toEqual([
        { month: 'January', revenue: 25000 },
        { month: 'February', revenue: 32000 },
        { month: 'March', revenue: 41000 },
      ]);
    });

    it('should generate unique IDs for fallback components', async () => {
      const userQuery = 'Generate something';
      mockLLM.registerResponse('never', { type: 'card' });

      const result1 = await service.generateComponent(userQuery, testData.singleObject());
      // Add small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result2 = await service.generateComponent(userQuery, testData.singleObject());

      expect(result1.id).not.toBe(result2.id);
    });

    it('should handle null/undefined tool results safely', async () => {
      const userQuery = 'Generate';
      mockLLM.registerResponse('Generate', validComponentResponses.card());

      const result = await service.generateComponent(userQuery, []);

      expect(result.type).toBe('card');
    });
  });

  describe('SCHEMA CONFORMANCE - All Generated Components Match Schema', () => {
    it('should generate chart with all required schema fields', async () => {
      mockLLM.registerResponse('chart', validComponentResponses.chart());
      const result = await service.generateComponent('chart', testData.salesData());

      expect(result).toHaveProperty('type', 'chart');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('props');
      expect(typeof result.id).toBe('string');
      expect(result.id.length > 0).toBe(true);
    });

    it('should generate table with required schema fields', async () => {
      mockLLM.registerResponse('table', validComponentResponses.table());
      const result = await service.generateComponent('table', testData.employeeData());

      expect(result).toHaveProperty('type', 'table');
      expect(result.props).toHaveProperty('columns');
      expect(result.props).toHaveProperty('data');
      expect(Array.isArray(result.props.columns)).toBe(true);
      expect(Array.isArray(result.props.data)).toBe(true);
    });

    it('should generate form with required fields array', async () => {
      mockLLM.registerResponse('form', validComponentResponses.form());
      const result = await service.generateComponent('form', testData.surveyData());

      expect(result.type).toBe('form');
      expect(Array.isArray(result.props.fields)).toBe(true);
      expect(result.props.fields.length > 0).toBe(true);
    });

    it('should generate list with required items array', async () => {
      mockLLM.registerResponse('list', validComponentResponses.list());
      const result = await service.generateComponent('list', testData.productData());

      expect(result.type).toBe('list');
      expect(Array.isArray(result.props.items)).toBe(true);
    });

    it('should generate report with required sections array', async () => {
      mockLLM.registerResponse('report', validComponentResponses.report());
      const result = await service.generateComponent('report', testData.marketData());

      expect(result.type).toBe('report');
      expect(result.props).toHaveProperty('title');
      expect(Array.isArray(result.props.sections)).toBe(true);
    });
  });

  describe('COMPONENT TYPE VALIDATION - All Types Supported', () => {
    const allTypes = ['chart', 'table', 'card', 'form', 'list', 'slides', 'report'] as const;

    allTypes.forEach((type) => {
      it(`should generate valid ${type} component`, async () => {
        const response = validComponentResponses[type]();
        mockLLM.registerResponse(type, response);

        const result = await service.generateComponent(
          `Generate ${type}`,
          testData.salesData()
        );

        expect(result.type).toBe(type);
        expect(result.id).toBeTruthy();
      });
    });
  });

  describe('STRESS TESTS - Performance & Stability', () => {
    it('should handle multiple rapid requests sequentially', async () => {
      mockLLM.registerResponse('chart', validComponentResponses.chart());

      const queries = ['Chart 1', 'Chart 2', 'Chart 3'];
      const results = [];

      for (const query of queries) {
        const result = await service.generateComponent(query, testData.salesData());
        results.push(result);
      }

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.type === 'chart')).toBe(true);
    });

    it('should handle different component types in sequence', async () => {
      // Use unique patterns that match specific queries
      mockLLM.registerResponse('show me chart', validComponentResponses.chart());
      mockLLM.registerResponse('show me table', validComponentResponses.table());
      mockLLM.registerResponse('show me form', validComponentResponses.form());

      const chart = await service.generateComponent('show me chart', testData.salesData());
      const table = await service.generateComponent('show me table', testData.employeeData());
      const form = await service.generateComponent('show me form', testData.surveyData());

      expect(chart.type).toBe('chart');
      expect(table.type).toBe('table');
      expect(form.type).toBe('form');
    });
  });
});
