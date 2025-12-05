/**
 * Test Setup & Utilities
 *
 * Common utilities and mocks for E2E testing
 */

import type {
  IStructuredGenerator,
  JSONSchema,
} from '../services/interfaces';
import type { ComponentSpec, ToolCallResult } from '../types/core.types';

/**
 * Mock LLM Generator for testing
 */
export class MockLLMGenerator implements IStructuredGenerator {
  private responses: Map<string, any> = new Map();
  private callCount = 0;

  /**
   * Register a mock response for a specific prompt pattern
   */
  registerResponse(promptPattern: string, response: any): void {
    this.responses.set(promptPattern, response);
  }

  /**
   * Generate structured response from mock data
   */
  async generateStructured<T>(
    prompt: string,
    schema: JSONSchema,
    options?: any
  ): Promise<T> {
    this.callCount++;

    // Look for matching response pattern
    for (const [pattern, response] of this.responses.entries()) {
      if (prompt.includes(pattern)) {
        return response as T;
      }
    }

    // Default: throw error if no matching response
    throw new Error(`No mock response registered for prompt containing: "${prompt.substring(0, 50)}..."`);
  }

  /**
   * Get call count for assertions
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Reset mock for next test
   */
  reset(): void {
    this.responses.clear();
    this.callCount = 0;
  }

  /**
   * Validate output against schema
   * Mock implementation: always returns true
   */
  validateOutput<T>(output: any, schema: JSONSchema): output is T {
    return output !== null && output !== undefined;
  }
}

/**
 * Sample test data generators
 */
export const testData = {
  /**
   * Sample sales data for testing
   */
  salesData: (): ToolCallResult[] => [
    {
      name: 'sales_data',
      result: [
        { month: 'January', revenue: 25000, units: 150 },
        { month: 'February', revenue: 32000, units: 180 },
        { month: 'March', revenue: 41000, units: 220 },
        { month: 'April', revenue: 38000, units: 200 },
      ],
    },
  ],

  /**
   * Sample employee data for testing
   */
  employeeData: (): ToolCallResult[] => [
    {
      name: 'employees',
      result: [
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Manager', status: 'active' },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', status: 'active' },
        { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'Designer', status: 'inactive' },
      ],
    },
  ],

  /**
   * Sample product data for testing
   */
  productData: (): ToolCallResult[] => [
    {
      name: 'products',
      result: [
        { id: 'p1', name: 'Product A', price: 99.99, inStock: true },
        { id: 'p2', name: 'Product B', price: 149.99, inStock: true },
        { id: 'p3', name: 'Product C', price: 199.99, inStock: false },
      ],
    },
  ],

  /**
   * Sample survey responses
   */
  surveyData: (): ToolCallResult[] => [
    {
      name: 'survey_responses',
      result: [
        { rating: 5, comment: 'Excellent product', date: '2024-01-15' },
        { rating: 4, comment: 'Good quality', date: '2024-01-16' },
        { rating: 5, comment: 'Highly recommend', date: '2024-01-17' },
      ],
    },
  ],

  /**
   * Sample market data with trends
   */
  marketData: (): ToolCallResult[] => [
    {
      name: 'market_analysis',
      result: [
        { quarter: 'Q1', market_share: 12, competitor_a: 18, competitor_b: 15 },
        { quarter: 'Q2', market_share: 14, competitor_a: 17, competitor_b: 16 },
        { quarter: 'Q3', market_share: 16, competitor_a: 16, competitor_b: 14 },
        { quarter: 'Q4', market_share: 18, competitor_a: 15, competitor_b: 13 },
      ],
    },
  ],

  /**
   * Empty data for testing fallback
   */
  emptyData: (): ToolCallResult[] => [
    {
      name: 'empty_result',
      result: [],
    },
  ],

  /**
   * Single object data (not array)
   */
  singleObject: (): ToolCallResult[] => [
    {
      name: 'summary',
      result: {
        total_revenue: 150000,
        total_units: 850,
        avg_price: 176.47,
      },
    },
  ],
};

/**
 * Sample valid component responses for mocking
 */
export const validComponentResponses = {
  chart: (): ComponentSpec => ({
    type: 'chart',
    id: 'sales-chart',
    props: {
      chartType: 'line',
      title: 'Monthly Sales Trend',
      data: [
        { month: 'January', revenue: 25000 },
        { month: 'February', revenue: 32000 },
        { month: 'March', revenue: 41000 },
      ],
      xAxis: { key: 'month', label: 'Month' },
      yAxis: { key: 'revenue', label: 'Revenue ($)' },
      showLegend: true,
      showTooltip: true,
      responsive: true,
    },
  }),

  table: (): ComponentSpec => ({
    type: 'table',
    id: 'employees-table',
    props: {
      title: 'Employee Directory',
      columns: [
        { key: 'name', label: 'Name', type: 'text', sortable: true },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      data: [
        { name: 'Alice Johnson', email: 'alice@example.com', role: 'Manager', status: 'active' },
        { name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', status: 'active' },
      ],
      striped: true,
      hover: true,
      pagination: { enabled: true, pageSize: 20 },
    },
  }),

  card: (): ComponentSpec => ({
    type: 'card',
    id: 'status-card',
    props: {
      title: 'System Status',
      content: 'All systems operational',
      variant: 'success',
      icon: '✓',
    },
  }),

  form: (): ComponentSpec => ({
    type: 'form',
    id: 'contact-form',
    props: {
      title: 'Contact Form',
      fields: [
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      submitLabel: 'Send',
      layout: 'vertical',
    },
  }),

  list: (): ComponentSpec => ({
    type: 'list',
    id: 'product-list',
    props: {
      title: 'Products',
      items: [
        { id: '1', title: 'Product A', description: 'Premium quality' },
        { id: '2', title: 'Product B', description: 'Best seller' },
      ],
      variant: 'card',
      selectable: false,
    },
  }),

  slides: (): ComponentSpec => ({
    type: 'slides',
    id: 'tutorial-slides',
    props: {
      title: 'Tutorial',
      slides: [
        { id: '1', title: 'Welcome', content: 'Learn our platform' },
        { id: '2', title: 'Features', content: 'Discover what we offer' },
      ],
      autoPlay: false,
      showNavigationDots: true,
    },
  }),

  report: (): ComponentSpec => ({
    type: 'report',
    id: 'quarterly-report',
    props: {
      title: 'Q1 Report',
      summary: 'Strong performance',
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          content: 'Q1 results',
          metrics: [
            { label: 'Revenue', value: 100000, status: 'positive' },
          ],
        },
      ],
      printable: true,
    },
  }),
};

/**
 * Invalid component responses for testing validation failures
 */
export const invalidComponentResponses = {
  /**
   * Chart with missing data
   */
  chartMissingData: (): ComponentSpec => ({
    type: 'chart',
    id: 'bad-chart',
    props: {
      chartType: 'line',
      data: [], // Invalid: empty data
      xAxis: { key: 'date' },
      yAxis: { key: 'value' },
    },
  }),

  /**
   * Chart with missing axis keys
   */
  chartBadAxisKeys: (): ComponentSpec => ({
    type: 'chart',
    id: 'bad-chart',
    props: {
      chartType: 'line',
      data: [{ month: 'Jan', sales: 100 }],
      xAxis: { key: 'nonexistent_field' }, // Invalid: key not in data
      yAxis: { key: 'value' },
    },
  }),

  /**
   * Table with duplicate column keys
   */
  tableDuplicateColumns: (): ComponentSpec => ({
    type: 'table',
    id: 'bad-table',
    props: {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'name', label: 'Name 2' }, // Invalid: duplicate key
      ],
      data: [{ name: 'John' }],
    },
  }),

  /**
   * Form with duplicate field names
   */
  formDuplicateFields: (): ComponentSpec => ({
    type: 'form',
    id: 'bad-form',
    props: {
      fields: [
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'email', label: 'Email 2', type: 'text' }, // Invalid: duplicate name
      ],
    },
  }),

  /**
   * Select field without options
   */
  formSelectNoOptions: (): ComponentSpec => ({
    type: 'form',
    id: 'bad-form',
    props: {
      fields: [
        { name: 'role', label: 'Role', type: 'select', options: [] }, // Invalid: empty options
      ],
    },
  }),

  /**
   * List with duplicate IDs
   */
  listDuplicateIds: (): ComponentSpec => ({
    type: 'list',
    id: 'bad-list',
    props: {
      items: [
        { id: '1', title: 'Item 1' },
        { id: '1', title: 'Item 2' }, // Invalid: duplicate id
      ],
    },
  }),

  /**
   * Slides with missing content
   */
  slidesMissingContent: (): ComponentSpec => ({
    type: 'slides',
    id: 'bad-slides',
    props: {
      slides: [
        { id: '1', title: 'Slide 1', content: '' }, // Invalid: empty content
      ],
    },
  }),

  /**
   * Missing required field (content)
   */
  cardMissingContent: (): ComponentSpec => ({
    type: 'card',
    id: 'bad-card',
    props: {
      title: 'Card',
      content: '', // Invalid: empty content
    },
  }),
};
