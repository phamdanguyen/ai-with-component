/**
 * ComponentGenerationService
 *
 * Enhanced component generation with:
 * - Zod schema validation (type-safe)
 * - Component-specific prompts (better accuracy)
 * - Error recovery (retry with fallback)
 * - Full validation per component type
 *
 * Purpose: Generate valid ComponentSpec JSON from user query and data
 * Model: Gemini Pro (better reasoning)
 * Temperature: 0.3 (deterministic)
 *
 * Pattern: Service with error handling & validation
 */

import type { IStructuredGenerator, JSONSchema } from './interfaces';
import type { ComponentSpec, ToolCallResult } from '../types/core.types';
import {
  validateComponentProps,
  validateComponentPropsSafe,
  ComponentJsonSchemas,
} from '../types/component-schemas';
import {
  validateComponentFull as semanticValidation,
  formatValidationErrors,
} from '../types/component-validators';
import {
  COMPONENT_GENERATION_SYSTEM,
  getComponentPrompt,
} from './component-prompts';
import {
  ErrorRecoveryService,
  type ErrorAnalysis,
} from './error-recovery';
import { getQueryClassifier } from './query-classifier.service';

export class ComponentGenerationService {
  private readonly MAX_RETRIES = 2;
  private classifier = getQueryClassifier();

  constructor(private structuredGenerator: IStructuredGenerator) {}

  /**
   * Generate component spec with validation and error recovery
   * Uses query classification to guide component type selection
   *
   * @param userQuery - Original user question
   * @param toolResults - Results from tool execution
   * @returns Valid ComponentSpec or fallback component
   */
  async generateComponent(
    userQuery: string,
    toolResults: ToolCallResult[]
  ): Promise<ComponentSpec> {
    let lastError: Error | null = null;
    let inferredComponentType: string | null = null;

    let previousErrors: string[] = [];

    // Classify query to guide component type selection
    const classification = await this.classifier.classify(userQuery);
    const suggestedComponentType = classification.suggestedComponent;

    if (suggestedComponentType) {
      console.log(
        `[ComponentGeneration] Query classified as '${classification.type}' with confidence ${classification.confidence.toFixed(2)}, suggesting '${suggestedComponentType}' component`
      );
    }

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // On first attempt, use generic prompt with classification hints
        // On retry, use component-specific prompt if type was detected
        let prompt: string;
        if (attempt === 0) {
          prompt = this.buildComponentPrompt(
            userQuery,
            toolResults,
            attempt,
            undefined,
            suggestedComponentType
          );
        } else if (inferredComponentType) {
          // Use component-specific prompt for retry with error amendments
          prompt = getComponentPrompt(inferredComponentType, userQuery, toolResults);
          if (previousErrors.length > 0) {
            prompt += ErrorRecoveryService.getRecoveryPromptAmendment(
              previousErrors,
              inferredComponentType
            );
          }
        } else {
          // Generic prompt with error recovery amendments
          prompt = this.buildComponentPrompt(
            userQuery,
            toolResults,
            attempt,
            previousErrors,
            suggestedComponentType
          );
        }

        const schema = this.getComponentSchema();
        const temperature = Math.min(0.3 + attempt * 0.1, 0.5); // Gradually increase

        const component = await this.structuredGenerator.generateStructured<ComponentSpec>(
          prompt,
          schema,
          {
            model: 'gemini-2.0-flash',
            temperature,
            responseMimeType: 'application/json',
            systemInstruction: COMPONENT_GENERATION_SYSTEM,
          }
        );

        // Validate the generated component
        const validationResult = this.validateComponentFull(component);
        if (validationResult.valid) {
          console.log(`✓ Component validation passed (${component.type} component)`);
          return component;
        }

        // Store inferred type and errors for use in retry with component-specific prompt
        if (!inferredComponentType && validationResult.valid === false) {
          inferredComponentType = component.type; // Use the type the LLM suggested
        }

        lastError = new Error(`Validation failed: ${validationResult.error}`);

        // Analyze error for recovery strategies
        if (validationResult.errors) {
          previousErrors = validationResult.errors; // Store for recovery amendments

          const analysis = ErrorRecoveryService.analyzeValidationError(
            validationResult.errors,
            component.type
          );

          ErrorRecoveryService.logError(
            component.type,
            attempt,
            analysis
          );

          // Check if we should attempt recovery
          const isRecoverable = ErrorRecoveryService.isRecoverable(
            validationResult.error || '',
            attempt
          );

          if (!isRecoverable && attempt < this.MAX_RETRIES) {
            console.warn(
              `⚠ Error not recoverable with standard retry, moving to fallback`
            );
            break; // Skip to fallback
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `⚠ Component generation failed (attempt ${attempt + 1}/${this.MAX_RETRIES + 1}):`,
          lastError.message
        );
      }
    }

    // All retries exhausted - return fallback component
    console.error('All component generation attempts failed. Returning fallback component.');

    // Generate error report for debugging
    if (previousErrors.length > 0) {
      const errorReport = ErrorRecoveryService.generateErrorReport(
        inferredComponentType || 'unknown',
        userQuery,
        this.MAX_RETRIES + 1,
        previousErrors
      );
      console.error(errorReport);
    }

    return this.createFallbackComponent(userQuery, toolResults, lastError);
  }

  /**
   * Build context-aware prompt with component-specific instructions
   * Optionally includes query classification hints for better component selection
   */
  private buildComponentPrompt(
    userQuery: string,
    toolResults: ToolCallResult[],
    attemptNumber: number = 0,
    previousErrors?: string[],
    suggestedComponentType?: string
  ): string {
    let prompt = '';

    // Add classification hint if available
    if (suggestedComponentType && attemptNumber === 0) {
      prompt += `## Suggested Component Type:\nBased on query analysis, consider using a **${suggestedComponentType}** component.\n\n`;
    }

    // Add user query
    prompt += `## User Request:\n${userQuery}\n\n`;

    // Add tool results with data analysis
    if (toolResults.length > 0) {
      prompt += '## Input Data:\n';
      for (const result of toolResults) {
        prompt += `### ${result.name}:\n`;
        const data = result.result;
        prompt += JSON.stringify(data, null, 2) + '\n';

        // Analyze data structure
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          prompt += `\nData Analysis: Array with ${data.length} items. First item keys: ${Object.keys(firstItem).join(', ')}\n`;
        }
        prompt += '\n';
      }
    }

    // Add data hints for better component selection
    const dataHints = ErrorRecoveryService.extractDataHints(toolResults);
    if (dataHints) {
      prompt += dataHints + '\n';
    }

    // Main instructions
    prompt += `## Component Type Selection:
Choose the MOST APPROPRIATE component type:

1. **chart** → Visualizations (line, bar, area, pie)
   - Use for: Trends, distributions, comparisons
   - Sample data: [{x: '2024-01', y: 100}, ...]

2. **table** → Tabular data
   - Use for: Multiple columns, sortable data
   - Must have: columns array with key/label, data array

3. **card** → Summary/highlight
   - Use for: Single metric, status, announcement
   - Properties: title, content, variant

4. **list** → Item collections
   - Use for: Products, people, todos
   - Properties: items array with title/description

5. **form** → User input
   - Use for: Surveys, registrations
   - Properties: fields array with type/label

6. **slides** → Presentations
   - Use for: Tutorials, galleries
   - Properties: slides array with title/content

7. **report** → Complex documents
   - Use for: Multi-section analysis
   - Properties: sections array with content/metrics

## Generation Instructions:
1. Analyze the data structure carefully
2. Select the component type that best fits the data
3. Map all data fields to component properties
4. Include descriptive titles and labels
5. For charts: specify chartType (line, bar, area, pie, etc.)
6. For tables: map data fields to columns
7. For lists: ensure items have title and description
8. Use meaningful IDs (e.g., "sales-q4-2024")

${attemptNumber > 0 ? `\nAttempt ${attemptNumber + 1}: Focus on strict prop structure validation.` : ''}

Output: Valid JSON only (no markdown, no explanation)`;

    // Add recovery amendments if this is a retry with errors
    if (previousErrors && previousErrors.length > 0 && attemptNumber > 0) {
      prompt += ErrorRecoveryService.getRecoveryPromptAmendment(
        previousErrors,
        ''
      );
    }

    return prompt;
  }

  /**
   * Get ComponentSpec JSON schema for LLM
   * Note: Gemini API requires OBJECT types to have non-empty properties
   */
  private getComponentSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['chart', 'table', 'card', 'form', 'list', 'slides', 'report'],
          description: 'Component type',
        },
        id: {
          type: 'string',
          description: 'Unique component identifier',
        },
        props: {
          type: 'object',
          description: 'Component-specific properties (validated per type)',
          properties: {
            // Generic properties that all components may have
            title: { type: 'string', description: 'Component title' },
            content: { type: 'string', description: 'Text content for cards' },
            chartType: {
              type: 'string',
              description: 'Chart type',
              enum: ['line', 'bar', 'area', 'pie', 'scatter', 'radar', 'combo']
            },
            variant: {
              type: 'string',
              description: 'Component variant/style',
              enum: ['default', 'success', 'warning', 'error', 'info']
            },
            // Array types require items definition for Gemini API
            data: {
              type: 'array',
              description: 'Data array for charts/tables',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'string', description: 'X-axis value or label' },
                  y: { type: 'number', description: 'Y-axis value' },
                  label: { type: 'string', description: 'Data label' },
                  value: { type: 'number', description: 'Data value' },
                },
              },
            },
            items: {
              type: 'array',
              description: 'Items array for lists',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Item ID' },
                  title: { type: 'string', description: 'Item title' },
                  description: { type: 'string', description: 'Item description' },
                },
              },
            },
            columns: {
              type: 'array',
              description: 'Columns for tables',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: 'Column key' },
                  label: { type: 'string', description: 'Column label' },
                },
              },
            },
            fields: {
              type: 'array',
              description: 'Fields for forms',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Field name' },
                  type: { type: 'string', description: 'Field type (text, email, select, etc)' },
                  label: { type: 'string', description: 'Field label' },
                },
              },
            },
            slides: {
              type: 'array',
              description: 'Slides array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Slide ID' },
                  title: { type: 'string', description: 'Slide title' },
                  content: { type: 'string', description: 'Slide content' },
                },
              },
            },
            sections: {
              type: 'array',
              description: 'Sections for reports',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Section ID' },
                  title: { type: 'string', description: 'Section title' },
                  content: { type: 'string', description: 'Section content' },
                },
              },
            },
          },
        },
      },
      required: ['type', 'id', 'props'],
    };
  }

  /**
   * System instruction for component generation
   * Returns the optimized system instruction from component-prompts
   */
  private getSystemInstruction(): string {
    return COMPONENT_GENERATION_SYSTEM;
  }

  /**
   * Full validation: Zod schema + semantic validation
   * Returns structured validation result with all errors
   */
  private validateComponentFull(
    component: ComponentSpec
  ): { valid: boolean; error?: string; errors?: string[] } {
    const allErrors: string[] = [];

    // Basic structure validation
    if (!component.type || !component.id || !component.props) {
      return {
        valid: false,
        error: 'Missing required fields: type, id, or props',
        errors: ['Missing required fields: type, id, or props'],
      };
    }

    // Type validation
    const validTypes = ['chart', 'table', 'card', 'form', 'list', 'slides', 'report'];
    if (!validTypes.includes(component.type)) {
      const error = `Invalid component type: ${component.type}`;
      return {
        valid: false,
        error,
        errors: [error],
      };
    }

    // 1. Schema validation using Zod
    try {
      validateComponentProps(component.type as any, component.props);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown schema validation error';
      allErrors.push(`Schema validation: ${errorMessage}`);
    }

    // 2. Semantic validation (data integrity, field consistency, business logic)
    try {
      const semanticResult = semanticValidation(component.type, component.props);
      if (!semanticResult.valid) {
        allErrors.push(...semanticResult.errors);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown semantic validation error';
      allErrors.push(`Semantic validation: ${errorMessage}`);
    }

    // Return results
    if (allErrors.length === 0) {
      return { valid: true };
    }

    return {
      valid: false,
      error: formatValidationErrors(allErrors),
      errors: allErrors,
    };
  }

  /**
   * Create fallback component when generation fails
   */
  private createFallbackComponent(
    userQuery: string,
    toolResults: ToolCallResult[],
    error: Error | null
  ): ComponentSpec {
    // Attempt to infer component type from data
    let componentType = 'card';

    if (toolResults.length > 0) {
      const firstResult = toolResults[0].result;
      if (Array.isArray(firstResult) && firstResult.length > 0) {
        const firstItem = firstResult[0];
        if (typeof firstItem === 'object') {
          const keys = Object.keys(firstItem);
          // Heuristic: If many keys, use table; if array of simple items, use list
          if (keys.length > 3) {
            componentType = 'table';
          } else {
            componentType = 'list';
          }
        }
      }
    }

    // Generate fallback based on inferred type
    switch (componentType) {
      case 'table':
        return this.createFallbackTable(toolResults);
      case 'list':
        return this.createFallbackList(toolResults);
      default:
        return this.createFallbackCard(userQuery, error);
    }
  }

  private createFallbackCard(userQuery: string, error: Error | null): ComponentSpec {
    return {
      type: 'card',
      id: 'fallback-card-' + Date.now(),
      props: {
        title: 'Content Unavailable',
        content: `Unable to generate component for your query: "${userQuery}". ${error ? `Error: ${error.message}` : ''}`,
        variant: 'warning',
        icon: '⚠️',
      },
    };
  }

  private createFallbackTable(toolResults: ToolCallResult[]): ComponentSpec {
    const data = toolResults[0]?.result as any[];
    if (!Array.isArray(data) || data.length === 0) {
      return this.createFallbackCard('Table data unavailable', null);
    }

    const firstRow = data[0];
    const columns = Object.keys(firstRow).map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));

    return {
      type: 'table',
      id: 'fallback-table-' + Date.now(),
      props: {
        title: 'Data Table',
        columns,
        data,
      },
    };
  }

  private createFallbackList(toolResults: ToolCallResult[]): ComponentSpec {
    const data = toolResults[0]?.result as any[];
    if (!Array.isArray(data) || data.length === 0) {
      return this.createFallbackCard('List data unavailable', null);
    }

    const items = data.map((item, index) => ({
      id: `item-${index}`,
      title: typeof item === 'string' ? item : JSON.stringify(item).substring(0, 50),
      description: typeof item === 'object' ? JSON.stringify(item).substring(0, 100) : undefined,
    }));

    return {
      type: 'list',
      id: 'fallback-list-' + Date.now(),
      props: {
        title: 'Items',
        items,
      },
    };
  }

  /**
   * Public validation method
   * Validates a component spec against semantic rules
   */
  validateComponent(componentSpec: ComponentSpec | null | undefined): boolean {
    if (!componentSpec) {
      return false;
    }

    try {
      // Use semantic validation from component-validators
      const result = semanticValidation(componentSpec.type, componentSpec.props);
      return result.valid;
    } catch {
      return false;
    }
  }
}
