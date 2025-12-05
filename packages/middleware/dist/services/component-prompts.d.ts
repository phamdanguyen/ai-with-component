/**
 * Component-Specific Prompt Templates
 *
 * Optimized prompts for each component type
 * Includes context, examples, and specific requirements
 *
 * These prompts are used when:
 * 1. Generating initial component from user query
 * 2. Regenerating on validation failure (with higher temperature)
 *
 * Week 3 Optimization:
 * - Integrated with QueryClassifier for query type guidance
 * - Component type suggestions based on query intent
 * - Strict format requirements for validation
 * - Examples tailored to component usage patterns
 */
import type { ToolCallResult } from '../types/core.types';
/**
 * Base system instruction for component generation
 * Enhanced with query classification awareness for better component selection
 */
export declare const COMPONENT_GENERATION_SYSTEM = "You are an expert UI component generator with deep knowledge of:\n- Data visualization (charts, tables, reports)\n- User interface components (cards, forms, lists, slides)\n- Component architecture and type safety\n- Query intent classification (data analysis, visualization, instruction, etc.)\n\nYour responsibilities:\n1. Analyze input data structure (size, types, fields)\n2. Consider the suggested component type from query analysis\n3. Select the optimal component type for the use case\n4. Extract and map relevant data to component props\n5. Ensure all required properties are included\n6. Add descriptive titles, labels, and metadata\n7. Consider accessibility and usability\n8. Validate field consistency and data integrity\n\nComponent Selection Priority:\n- If a component type is suggested, justify using it or explain alternatives\n- Match component to both data structure AND query intent\n- For data-analysis queries: prefer charts or tables\n- For visualization requests: use charts or diagrams\n- For instruction/how-to: use forms, lists, or slides\n- For status/summaries: use cards or reports\n\nCRITICAL REQUIREMENTS:\n1. Always output PURE JSON (no markdown, no explanations)\n2. Ensure all required fields per component type are present\n3. Use valid IDs (alphanumeric, hyphens, lowercase)\n4. Validate data consistency (all data rows have same fields as columns)\n5. Include descriptive titles and labels for user clarity";
/**
 * Chart-specific prompt template
 */
export declare function getChartPrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * Table-specific prompt template
 */
export declare function getTablePrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * Card-specific prompt template
 */
export declare function getCardPrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * Form-specific prompt template
 */
export declare function getFormPrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * List-specific prompt template
 */
export declare function getListPrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * Slides-specific prompt template
 */
export declare function getSlidesPrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * Report-specific prompt template
 */
export declare function getReportPrompt(userQuery: string, toolResults: ToolCallResult[]): string;
/**
 * Get component-specific prompt by type
 */
export declare function getComponentPrompt(type: string, userQuery: string, toolResults: ToolCallResult[]): string;
//# sourceMappingURL=component-prompts.d.ts.map