/**
 * Component Validators - Unit Tests
 *
 * Tests for semantic validation logic
 */

import { describe, it, expect } from 'vitest';
import {
  validateChart,
  validateTable,
  validateCard,
  validateForm,
  validateList,
  validateSlides,
  validateReport,
  validateComponentFull,
  formatValidationErrors,
} from '../types/component-validators';

describe('Component Validators - Unit Tests', () => {
  describe('Chart Validator', () => {
    it('should validate correct chart props', () => {
      const result = validateChart({
        chartType: 'line',
        data: [
          { date: '2024-01', value: 100 },
          { date: '2024-02', value: 150 },
        ],
        xAxis: { key: 'date' },
        yAxis: { key: 'value' },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty data', () => {
      const result = validateChart({
        chartType: 'line',
        data: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('empty');
    });

    it('should detect missing axis keys in data', () => {
      const result = validateChart({
        chartType: 'line',
        data: [{ date: '2024-01', value: 100 }],
        xAxis: { key: 'nonexistent' },
        yAxis: { key: 'value' },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not found');
    });

    it('should validate pie chart requirements', () => {
      const result = validateChart({
        chartType: 'pie',
        data: [{ name: 'Category A', value: 100 }], // Only 1 key - needs 2
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('2 data fields');
    });

    it('should require xAxis and yAxis for scatter chart', () => {
      const result = validateChart({
        chartType: 'scatter',
        data: [{ x: 10, y: 20 }],
        // Missing axes
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('requires both');
    });
  });

  describe('Table Validator', () => {
    it('should validate correct table props', () => {
      const result = validateTable({
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
        ],
        data: [
          { name: 'John', email: 'john@example.com' },
          { name: 'Jane', email: 'jane@example.com' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    it('should reject empty columns', () => {
      const result = validateTable({
        columns: [],
        data: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one column');
    });

    it('should reject empty data', () => {
      const result = validateTable({
        columns: [{ key: 'name', label: 'Name' }],
        data: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one row');
    });

    it('should detect missing column keys in data', () => {
      const result = validateTable({
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
        ],
        data: [
          { name: 'John' }, // Missing 'phone' key
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not found in data');
    });

    it('should detect duplicate column keys', () => {
      const result = validateTable({
        columns: [
          { key: 'name', label: 'Name 1' },
          { key: 'name', label: 'Name 2' }, // Duplicate
        ],
        data: [{ name: 'John' }],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Duplicate');
    });

    it('should validate number column types', () => {
      const result = validateTable({
        columns: [{ key: 'age', label: 'Age', type: 'number' }],
        data: [
          { age: 'not_a_number' }, // Invalid
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-numeric');
    });

    it('should validate date column types', () => {
      const result = validateTable({
        columns: [{ key: 'date', label: 'Date', type: 'date' }],
        data: [
          { date: 'invalid-date' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('invalid date');
    });
  });

  describe('Card Validator', () => {
    it('should validate correct card props', () => {
      const result = validateCard({
        content: 'Card content here',
        title: 'Card Title',
        variant: 'success',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject empty content', () => {
      const result = validateCard({
        content: '',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('empty');
    });

    it('should reject invalid variant', () => {
      const result = validateCard({
        content: 'Content',
        variant: 'invalid_variant' as any,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid');
    });

    it('should validate image URL format', () => {
      const result = validateCard({
        content: 'Content',
        image: 'not_a_valid_url',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid image URL');
    });

    it('should accept valid image URLs', () => {
      const result = validateCard({
        content: 'Content',
        image: 'https://example.com/image.jpg',
      });

      expect(result.valid).toBe(true);
    });

    it('should validate action labels', () => {
      const result = validateCard({
        content: 'Content',
        actions: [
          { label: '', onClick: 'action' }, // Empty label
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('missing a label');
    });
  });

  describe('Form Validator', () => {
    it('should validate correct form props', () => {
      const result = validateForm({
        fields: [
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'message', label: 'Message', type: 'textarea' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    it('should reject empty fields array', () => {
      const result = validateForm({
        fields: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one field');
    });

    it('should detect duplicate field names', () => {
      const result = validateForm({
        fields: [
          { name: 'email', label: 'Email 1', type: 'email' },
          { name: 'email', label: 'Email 2', type: 'text' }, // Duplicate
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Duplicate field name');
    });

    it('should require options for select fields', () => {
      const result = validateForm({
        fields: [
          { name: 'role', label: 'Role', type: 'select', options: [] },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must have options');
    });

    it('should require options for radio fields', () => {
      const result = validateForm({
        fields: [
          { name: 'choice', label: 'Choice', type: 'radio', options: [] },
        ],
      });

      expect(result.valid).toBe(false);
    });

    it('should validate option structure', () => {
      const result = validateForm({
        fields: [
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [{ label: 'Admin', value: '' }], // Missing value
          },
        ],
      });

      expect(result.valid).toBe(false);
    });

    it('should validate number field defaults', () => {
      const result = validateForm({
        fields: [
          { name: 'age', label: 'Age', type: 'number', defaultValue: 'not_a_number' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not a valid number');
    });

    it('should validate textarea rows', () => {
      const result = validateForm({
        fields: [
          { name: 'bio', label: 'Bio', type: 'textarea', rows: 1 },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 2');
    });
  });

  describe('List Validator', () => {
    it('should validate correct list props', () => {
      const result = validateList({
        items: [
          { id: '1', title: 'Item 1' },
          { id: '2', title: 'Item 2' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    it('should reject empty items', () => {
      const result = validateList({
        items: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one item');
    });

    it('should require item IDs', () => {
      const result = validateList({
        items: [
          { id: '', title: 'Item 1' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('id is required');
    });

    it('should detect duplicate item IDs', () => {
      const result = validateList({
        items: [
          { id: '1', title: 'Item 1' },
          { id: '1', title: 'Item 2' }, // Duplicate
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Duplicate item id');
    });

    it('should require item titles', () => {
      const result = validateList({
        items: [
          { id: '1', title: '' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('title is required');
    });
  });

  describe('Slides Validator', () => {
    it('should validate correct slides props', () => {
      const result = validateSlides({
        slides: [
          { id: '1', title: 'Slide 1', content: 'Content' },
          { id: '2', title: 'Slide 2', content: 'More content' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    it('should reject empty slides', () => {
      const result = validateSlides({
        slides: [],
      });

      expect(result.valid).toBe(false);
    });

    it('should detect duplicate slide IDs', () => {
      const result = validateSlides({
        slides: [
          { id: '1', title: 'Slide 1', content: 'Content' },
          { id: '1', title: 'Slide 2', content: 'Content' }, // Duplicate
        ],
      });

      expect(result.valid).toBe(false);
    });

    it('should require slide content', () => {
      const result = validateSlides({
        slides: [
          { id: '1', title: 'Slide', content: '' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('content is required');
    });

    it('should validate autoPlayInterval minimum', () => {
      const result = validateSlides({
        slides: [
          { id: '1', title: 'Slide', content: 'Content' },
        ],
        autoPlayInterval: 500, // Too low
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 1000ms');
    });
  });

  describe('Report Validator', () => {
    it('should validate correct report props', () => {
      const result = validateReport({
        title: 'Report',
        sections: [
          { id: '1', title: 'Section 1', content: 'Content' },
        ],
      });

      expect(result.valid).toBe(true);
    });

    it('should require title', () => {
      const result = validateReport({
        title: '',
        sections: [{ id: '1', title: 'Section', content: 'Content' }],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('title is required');
    });

    it('should require sections', () => {
      const result = validateReport({
        title: 'Report',
        sections: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one section');
    });

    it('should detect duplicate section IDs', () => {
      const result = validateReport({
        title: 'Report',
        sections: [
          { id: '1', title: 'Section 1', content: 'Content' },
          { id: '1', title: 'Section 2', content: 'Content' }, // Duplicate
        ],
      });

      expect(result.valid).toBe(false);
    });

    it('should validate metric statuses', () => {
      const result = validateReport({
        title: 'Report',
        sections: [
          {
            id: '1',
            title: 'Section',
            metrics: [
              { label: 'Metric', value: 100, status: 'invalid_status' as any },
            ],
          },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('invalid status');
    });

    it('should validate date format', () => {
      const result = validateReport({
        title: 'Report',
        sections: [{ id: '1', title: 'Section', content: 'Content' }],
        generatedDate: 'invalid-date',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid generatedDate');
    });
  });

  describe('Master Validator - validateComponentFull', () => {
    it('should validate chart components', () => {
      const result = validateComponentFull('chart', {
        chartType: 'line',
        data: [{ x: 1, y: 2 }],
      });

      expect(result.valid).toBe(true);
    });

    it('should reject unknown component type', () => {
      const result = validateComponentFull('unknown', {});

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Unknown component type');
    });

    it('should handle validation errors gracefully', () => {
      const result = validateComponentFull('table', null as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length > 0).toBe(true);
    });
  });

  describe('Error Formatting', () => {
    it('should format single error', () => {
      const formatted = formatValidationErrors(['Single error']);

      expect(formatted).toBe('Single error');
    });

    it('should format multiple errors', () => {
      const formatted = formatValidationErrors(['Error 1', 'Error 2', 'Error 3']);

      expect(formatted).toContain('1. Error 1');
      expect(formatted).toContain('2. Error 2');
      expect(formatted).toContain('3. Error 3');
    });

    it('should return empty string for no errors', () => {
      const formatted = formatValidationErrors([]);

      expect(formatted).toBe('');
    });
  });
});
