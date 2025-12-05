/**
 * Component-Specific Validators
 *
 * Advanced semantic validation beyond Zod schemas
 * Checks data integrity, field consistency, and business logic
 *
 * Each validator returns: { valid: boolean; errors: string[] }
 */
import type { ChartProps, TableProps, CardProps, FormProps, ListProps, SlidesProps, ReportProps } from './core.types';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Chart Validator
 * Ensures:
 * - Data exists and is non-empty
 * - Axis keys exist in data
 * - Chart type is appropriate for data
 */
export declare function validateChart(props: ChartProps): ValidationResult;
/**
 * Table Validator
 * Ensures:
 * - Columns and data are both non-empty
 * - All column keys exist in data
 * - Column keys are consistent across rows
 */
export declare function validateTable(props: TableProps): ValidationResult;
/**
 * Card Validator
 * Ensures:
 * - Content is non-empty
 * - Variant is valid
 * - Image URL format is valid (if provided)
 */
export declare function validateCard(props: CardProps): ValidationResult;
/**
 * Form Validator
 * Ensures:
 * - Fields are non-empty
 * - Select/radio fields have options
 * - Field names are unique
 * - Field types with constraints have proper config
 */
export declare function validateForm(props: FormProps): ValidationResult;
/**
 * List Validator
 * Ensures:
 * - Items are non-empty
 * - Item IDs are unique
 * - Each item has title
 */
export declare function validateList(props: ListProps): ValidationResult;
/**
 * Slides Validator
 * Ensures:
 * - Slides are non-empty
 * - Slide IDs are unique
 * - Each slide has required fields
 * - autoPlayInterval is positive if specified
 */
export declare function validateSlides(props: SlidesProps): ValidationResult;
/**
 * Report Validator
 * Ensures:
 * - Sections are non-empty
 * - Section IDs are unique
 * - Each section has required fields
 * - Metrics have valid status values
 */
export declare function validateReport(props: ReportProps): ValidationResult;
/**
 * Master validator - validates component by type
 * Runs both Zod schema validation and semantic validation
 */
export declare function validateComponentFull(type: string, props: unknown): ValidationResult;
/**
 * Get validation errors for display
 * Formats errors for UI or logging
 */
export declare function formatValidationErrors(errors: string[]): string;
//# sourceMappingURL=component-validators.d.ts.map