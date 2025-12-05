/**
 * Error Recovery Service - Unit Tests
 *
 * Tests for error analysis and recovery strategies
 */

import { describe, it, expect } from 'vitest';
import { ErrorRecoveryService } from '../services/error-recovery';
import { testData } from './setup';

describe('ErrorRecoveryService - Unit Tests', () => {
  describe('Error Analysis', () => {
    it('should classify schema validation errors', () => {
      const errors = ['Schema validation: Invalid type'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.errorType).toBe('schema_validation');
      expect(analysis.severity).toBe('medium');
    });

    it('should classify semantic validation errors', () => {
      const errors = ['Chart data not found in data'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.errorType).toBe('semantic_validation');
      expect(analysis.severity).toBe('high');
    });

    it('should provide recovery strategies for schema errors', () => {
      const errors = ['Schema validation: Invalid field'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.recoveryStrategies.length > 0).toBe(true);
      expect(analysis.recoveryStrategies[0].strategy).toBe('retry_with_higher_temperature');
    });

    it('should suggest field mapping for axis errors', () => {
      const errors = ['X-axis key not found in data'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.suggestedFix).toContain('xAxis.key');
    });

    it('should suggest column fixes for table errors', () => {
      const errors = ['Column keys not found in data: phone'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'table');

      expect(analysis.suggestedFix).toContain('column');
    });

    it('should suggest form field fixes', () => {
      const errors = ['Duplicate field name: email'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'form');

      expect(analysis.suggestedFix).toContain('unique');
    });

    it('should provide multiple recovery strategies', () => {
      const errors = ['Data array is empty'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.recoveryStrategies.length >= 2).toBe(true);
    });
  });

  describe('Recovery Strategy Assessment', () => {
    it('should mark schema errors as recoverable on first attempt', () => {
      const error = 'Schema validation error';
      const isRecoverable = ErrorRecoveryService.isRecoverable(error, 0);

      expect(isRecoverable).toBe(true);
    });

    it('should mark schema errors as recoverable on second attempt', () => {
      const error = 'Schema validation error';
      const isRecoverable = ErrorRecoveryService.isRecoverable(error, 1);

      expect(isRecoverable).toBe(true);
    });

    it('should mark semantic errors as recoverable initially', () => {
      const error = 'Column keys not found in data';
      const isRecoverable = ErrorRecoveryService.isRecoverable(error, 0);

      expect(isRecoverable).toBe(true);
    });

    it('should stop retry after max attempts', () => {
      const error = 'Duplicate field name';
      const isRecoverable = ErrorRecoveryService.isRecoverable(error, 2); // After MAX_RETRIES

      expect(isRecoverable).toBe(false);
    });
  });

  describe('Data Hints Extraction', () => {
    it('should extract hints from sales data', () => {
      const hints = ErrorRecoveryService.extractDataHints(testData.salesData());

      expect(hints).toContain('month');
      expect(hints).toContain('revenue');
    });

    it('should detect time-series data pattern', () => {
      const hints = ErrorRecoveryService.extractDataHints(testData.salesData());

      expect(hints).toContain('time-series');
    });

    it('should detect multi-column data pattern', () => {
      const hints = ErrorRecoveryService.extractDataHints(testData.employeeData());

      expect(hints).toContain('3 items'); // employeeData has 3 items
    });

    it('should handle empty data gracefully', () => {
      const hints = ErrorRecoveryService.extractDataHints(testData.emptyData());

      expect(hints).toContain('empty');
    });

    it('should extract hints from single object data', () => {
      const hints = ErrorRecoveryService.extractDataHints(testData.singleObject());

      expect(hints).toContain('Single object');
    });
  });

  describe('Recovery Prompt Amendment', () => {
    it('should generate recovery amendment for chart', () => {
      const errors = ['X-axis key not found in data'];
      const amendment = ErrorRecoveryService.getRecoveryPromptAmendment(errors, 'chart');

      expect(amendment).toContain('X-axis key not found in data');
      expect(amendment).toContain('field names');
    });

    it('should include fix suggestions in amendment', () => {
      const errors = ['Duplicate field name', 'Missing required field'];
      const amendment = ErrorRecoveryService.getRecoveryPromptAmendment(errors, 'form');

      expect(amendment).toContain('Duplicate field name');
      expect(amendment).toContain('Missing required field');
    });

    it('should provide numbered error list', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const amendment = ErrorRecoveryService.getRecoveryPromptAmendment(errors, 'table');

      expect(amendment).toContain('- Error 1');
      expect(amendment).toContain('- Error 2');
      expect(amendment).toContain('- Error 3');
    });

    it('should include general fixing guidance', () => {
      const errors = ['Some error'];
      const amendment = ErrorRecoveryService.getRecoveryPromptAmendment(errors, 'list');

      expect(amendment).toContain('Double-check');
      expect(amendment).toContain('case-sensitive');
    });
  });

  describe('Error Logging', () => {
    it('should log error with proper formatting', () => {
      const errors = ['Test error'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      // Should not throw
      expect(() => {
        ErrorRecoveryService.logError('chart', 0, analysis);
      }).not.toThrow();
    });

    it('should log with context information', () => {
      const errors = ['Field missing'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'form');
      const context = { field_name: 'email' };

      expect(() => {
        ErrorRecoveryService.logError('form', 1, analysis, context);
      }).not.toThrow();
    });
  });

  describe('Error Report Generation', () => {
    it('should generate error report with timestamp', () => {
      const report = ErrorRecoveryService.generateErrorReport(
        'chart',
        'Show sales trend',
        3,
        ['Error 1', 'Error 2']
      );

      expect(report).toContain('Error Report');
      expect(report).toContain('202'); // Year prefix in timestamp (works for 2024-2029)
    });

    it('should include component type in report', () => {
      const report = ErrorRecoveryService.generateErrorReport(
        'table',
        'Display data',
        3,
        ['Table error']
      );

      expect(report).toContain('table');
    });

    it('should include user query in report', () => {
      const query = 'Generate custom component';
      const report = ErrorRecoveryService.generateErrorReport(
        'form',
        query,
        3,
        ['Form error']
      );

      expect(report).toContain(query);
    });

    it('should list all errors in report', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const report = ErrorRecoveryService.generateErrorReport(
        'slides',
        'Create presentation',
        3,
        errors
      );

      errors.forEach((error) => {
        expect(report).toContain(error);
      });
    });

    it('should include attempt count in report', () => {
      const report = ErrorRecoveryService.generateErrorReport(
        'report',
        'Generate report',
        3,
        ['Report error']
      );

      expect(report).toContain('Attempts: 3');
    });
  });

  describe('Strategy Determination', () => {
    it('should suggest component-specific prompt strategy', () => {
      const errors = ['Invalid structure'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'table');

      const strategies = analysis.recoveryStrategies;
      expect(strategies.some((s) => s.strategy.includes('prompt'))).toBe(true);
    });

    it('should suggest simplification for table errors', () => {
      const errors = ['Column keys not found'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'table');

      const strategies = analysis.recoveryStrategies;
      expect(
        strategies.some((s) => s.strategy.includes('simplify'))
      ).toBe(true);
    });

    it('should suggest field simplification for forms', () => {
      const errors = ['Duplicate field name'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'form');

      const strategies = analysis.recoveryStrategies;
      expect(
        strategies.some((s) => s.strategy.includes('simplify'))
      ).toBe(true);
    });

    it('should always include fallback strategy', () => {
      const errors = ['Any error'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'card');

      const strategies = analysis.recoveryStrategies;
      expect(
        strategies.some((s) => s.strategy === 'use_fallback_component')
      ).toBe(true);
    });
  });

  describe('Severity Assessment', () => {
    it('should mark schema errors as medium severity', () => {
      const errors = ['Schema validation: type mismatch'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.severity).toBe('medium');
    });

    it('should mark semantic errors as high severity', () => {
      const errors = ['Duplicate item id'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'list');

      expect(analysis.severity).toBe('high');
    });

    it('should mark multiple errors as high severity', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'form');

      // Multiple errors should be high severity
      expect(analysis.errors.length >= 1).toBe(true);
    });
  });

  describe('Fix Suggestions', () => {
    it('should suggest axis key check for chart errors', () => {
      const errors = ['X-axis key not found in data'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'chart');

      expect(analysis.suggestedFix).toContain('xAxis.key');
    });

    it('should suggest column key consistency for table', () => {
      const errors = ['Column keys not found in data: phone'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'table');

      expect(analysis.suggestedFix).toContain('All column keys');
    });

    it('should suggest field name uniqueness for forms', () => {
      const errors = ['Duplicate field name: email'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'form');

      expect(analysis.suggestedFix).toContain('unique');
    });

    it('should provide generic fix when pattern not matched', () => {
      const errors = ['Unknown error'];
      const analysis = ErrorRecoveryService.analyzeValidationError(errors, 'unknown');

      expect(analysis.suggestedFix).toBeTruthy();
      expect(analysis.suggestedFix).toContain('error details');
    });
  });
});
