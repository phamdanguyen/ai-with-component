/**
 * IStructuredGenerator Interface
 *
 * Purpose: Generate structured JSON output (UI components)
 * Use Case: Component spec generation using Gemini Pro with responseSchema
 *
 * SOLID Principle: Interface Segregation Principle (ISP)
 * - Separate interface for structured generation only
 * - Services implementing this are NOT required to implement text generation
 *
 * Pattern learned from: Odoo AI Chat - Structured output generation
 */
export interface IStructuredGenerator {
    /**
     * Generate structured JSON response matching a schema
     *
     * @param prompt - The prompt to send to the LLM
     * @param schema - JSON schema that response must conform to
     * @param options - Optional generation parameters
     * @returns Parsed JSON object matching schema
     */
    generateStructured<T = unknown>(prompt: string, schema: JSONSchema, options?: StructuredGenerationOptions): Promise<T>;
    /**
     * Validate output against schema
     *
     * @param data - Data to validate
     * @param schema - JSON schema to validate against
     * @returns True if valid, false otherwise
     */
    validateOutput(data: unknown, schema: JSONSchema): boolean;
}
export interface StructuredGenerationOptions {
    /**
     * Model to use (e.g., 'gemini-2.0-flash')
     */
    model?: string;
    /**
     * Temperature (0.0-1.0)
     * Lower = more deterministic (recommended for structured output)
     */
    temperature?: number;
    /**
     * System instructions
     */
    systemInstruction?: string;
    /**
     * Response MIME type (e.g., 'application/json')
     */
    responseMimeType?: string;
}
/**
 * JSON Schema definition
 * Supports OpenAPI/JSON Schema format
 */
export interface JSONSchema {
    type: string;
    properties?: Record<string, JSONSchema>;
    required?: string[];
    items?: JSONSchema;
    enum?: (string | number)[];
    description?: string;
    [key: string]: unknown;
}
//# sourceMappingURL=IStructuredGenerator.d.ts.map