"use strict";
/**
 * Component-Specific Validators
 *
 * Advanced semantic validation beyond Zod schemas
 * Checks data integrity, field consistency, and business logic
 *
 * Each validator returns: { valid: boolean; errors: string[] }
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChart = validateChart;
exports.validateTable = validateTable;
exports.validateCard = validateCard;
exports.validateForm = validateForm;
exports.validateList = validateList;
exports.validateSlides = validateSlides;
exports.validateReport = validateReport;
exports.validateComponentFull = validateComponentFull;
exports.formatValidationErrors = formatValidationErrors;
/**
 * Chart Validator
 * Ensures:
 * - Data exists and is non-empty
 * - Axis keys exist in data
 * - Chart type is appropriate for data
 */
function validateChart(props) {
    const errors = [];
    // Check data exists and is non-empty
    if (!props.data || props.data.length === 0) {
        errors.push('Chart data must not be empty');
        return { valid: false, errors };
    }
    // Check xAxis key exists in data
    if (props.xAxis?.key) {
        const hasXKey = props.data.some(item => props.xAxis.key in item);
        if (!hasXKey) {
            errors.push(`X-axis key '${props.xAxis.key}' not found in any data item`);
        }
    }
    // Check yAxis key exists in data
    if (props.yAxis?.key) {
        const hasYKey = props.data.some(item => props.yAxis.key in item);
        if (!hasYKey) {
            errors.push(`Y-axis key '${props.yAxis.key}' not found in any data item`);
        }
    }
    // Validate chartType for data structure
    const pieCharts = ['pie'];
    if (pieCharts.includes(props.chartType)) {
        // Pie charts need at least 2 slices to be meaningful
        if (props.data.length < 2) {
            errors.push(`Pie chart requires at least 2 data fields (slices) to be meaningful, found ${props.data.length}`);
        }
        // Each slice needs at least 2 keys: name/label and value
        const firstItem = props.data[0];
        const keyCount = Object.keys(firstItem).length;
        if (keyCount < 2) {
            errors.push(`Pie chart data items require at least 2 fields (name and value), found ${keyCount}`);
        }
    }
    // Validate series/data chart types
    if (props.chartType === 'scatter') {
        if (!props.xAxis?.key || !props.yAxis?.key) {
            errors.push('Scatter chart requires both xAxis and yAxis keys');
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Table Validator
 * Ensures:
 * - Columns and data are both non-empty
 * - All column keys exist in data
 * - Column keys are consistent across rows
 */
function validateTable(props) {
    const errors = [];
    // Check columns exist
    if (!props.columns || props.columns.length === 0) {
        errors.push('Table must have at least one column');
        return { valid: false, errors };
    }
    // Check data exists
    if (!props.data || props.data.length === 0) {
        errors.push('Table must have at least one row');
        return { valid: false, errors };
    }
    // Check all column keys exist in data
    const columnKeys = props.columns.map(col => col.key);
    const missingKeys = new Set();
    for (const row of props.data) {
        for (const key of columnKeys) {
            if (!(key in row)) {
                missingKeys.add(key);
            }
        }
    }
    if (missingKeys.size > 0) {
        errors.push(`Column keys not found in data: ${Array.from(missingKeys).join(', ')}`);
    }
    // Check for duplicate column keys
    const uniqueKeys = new Set(columnKeys);
    if (uniqueKeys.size !== columnKeys.length) {
        errors.push('Duplicate column keys detected');
    }
    // Validate column types if specified
    for (const column of props.columns) {
        if (column.type === 'number') {
            const nonNumbers = props.data.filter(row => {
                const value = row[column.key];
                return value !== null && value !== undefined && isNaN(Number(value));
            });
            if (nonNumbers.length > 0) {
                errors.push(`Column '${column.key}' is marked as number type but contains non-numeric values`);
            }
        }
        if (column.type === 'date') {
            const invalidDates = props.data.filter(row => {
                const value = row[column.key];
                if (!value)
                    return false;
                return isNaN(Date.parse(String(value)));
            });
            if (invalidDates.length > 0) {
                errors.push(`Column '${column.key}' is marked as date type but contains invalid date values`);
            }
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Card Validator
 * Ensures:
 * - Content is non-empty
 * - Variant is valid
 * - Image URL format is valid (if provided)
 */
function validateCard(props) {
    const errors = [];
    // Content validation: relaxed - allow empty for LLM-generated cards that use title only
    // Card can have either title or content, not necessarily both
    if (!props.content && !props.title) {
        errors.push('Card must have either content or title');
    }
    // Variant validation: relaxed - accept any variant, frontend will handle fallback
    // No longer reject unknown variants from LLM
    // Validate image URL if provided
    if (props.image) {
        try {
            new URL(props.image);
        }
        catch {
            errors.push(`Invalid image URL: ${props.image}`);
        }
    }
    // Validate actions if provided
    if (props.actions && props.actions.length > 0) {
        for (let i = 0; i < props.actions.length; i++) {
            if (!props.actions[i].label || props.actions[i].label.trim() === '') {
                errors.push(`Action ${i} is missing a label`);
            }
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Form Validator
 * Ensures:
 * - Fields are non-empty
 * - Select/radio fields have options
 * - Field names are unique
 * - Field types with constraints have proper config
 */
function validateForm(props) {
    const errors = [];
    // Check fields exist
    if (!props.fields || props.fields.length === 0) {
        errors.push('Form must have at least one field');
        return { valid: false, errors };
    }
    // Track field names for uniqueness
    const fieldNames = new Set();
    for (let i = 0; i < props.fields.length; i++) {
        const field = props.fields[i];
        // Check unique field names
        if (fieldNames.has(field.name)) {
            errors.push(`Duplicate field name: ${field.name}`);
        }
        fieldNames.add(field.name);
        // Check label exists
        if (!field.label || field.label.trim() === '') {
            errors.push(`Field ${i}: label is required`);
        }
        // Validate select/radio must have options
        if (['select', 'radio'].includes(field.type)) {
            if (!field.options || field.options.length === 0) {
                errors.push(`Field '${field.name}' (${field.type}) must have options defined`);
            }
            else {
                // Check each option has label and value
                for (let j = 0; j < field.options.length; j++) {
                    if (!field.options[j].label || !field.options[j].value) {
                        errors.push(`Field '${field.name}': option ${j} is missing label or value`);
                    }
                }
            }
        }
        // Validate email field
        if (field.type === 'email') {
            if (field.validation?.pattern && !field.validation.pattern.includes('email')) {
                errors.push(`Field '${field.name}': email fields should use email validation pattern`);
            }
        }
        // Validate number field
        if (field.type === 'number') {
            if (field.defaultValue && isNaN(Number(field.defaultValue))) {
                errors.push(`Field '${field.name}': defaultValue is not a valid number`);
            }
        }
        // Validate textarea has rows if specified
        if (field.type === 'textarea' && field.rows && field.rows < 2) {
            errors.push(`Field '${field.name}': textarea rows should be at least 2`);
        }
        // Validate length constraints
        if (field.validation) {
            if (field.validation.minLength && field.validation.maxLength) {
                if (field.validation.minLength > field.validation.maxLength) {
                    errors.push(`Field '${field.name}': minLength (${field.validation.minLength}) cannot be greater than maxLength (${field.validation.maxLength})`);
                }
            }
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * List Validator
 * Ensures:
 * - Items are non-empty
 * - Item IDs are unique
 * - Each item has title
 */
function validateList(props) {
    const errors = [];
    // Check items exist
    if (!props.items || props.items.length === 0) {
        errors.push('List must have at least one item');
        return { valid: false, errors };
    }
    // Track IDs for uniqueness
    const ids = new Set();
    for (let i = 0; i < props.items.length; i++) {
        const item = props.items[i];
        // Check ID exists and is unique
        if (!item.id) {
            errors.push(`Item ${i}: id is required`);
        }
        else if (ids.has(item.id)) {
            errors.push(`Duplicate item id: ${item.id}`);
        }
        ids.add(item.id);
        // Check title exists
        if (!item.title || item.title.trim() === '') {
            errors.push(`Item ${i}: title is required`);
        }
    }
    // Validate variant
    const validVariants = ['simple', 'card', 'interactive'];
    if (props.variant && !validVariants.includes(props.variant)) {
        errors.push(`Invalid list variant: ${props.variant}`);
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Slides Validator
 * Ensures:
 * - Slides are non-empty
 * - Slide IDs are unique
 * - Each slide has required fields
 * - autoPlayInterval is positive if specified
 */
function validateSlides(props) {
    const errors = [];
    // Check slides exist
    if (!props.slides || props.slides.length === 0) {
        errors.push('Slides must have at least one slide');
        return { valid: false, errors };
    }
    // Track IDs for uniqueness
    const ids = new Set();
    for (let i = 0; i < props.slides.length; i++) {
        const slide = props.slides[i];
        // Check ID exists and is unique
        if (!slide.id) {
            errors.push(`Slide ${i}: id is required`);
        }
        else if (ids.has(slide.id)) {
            errors.push(`Duplicate slide id: ${slide.id}`);
        }
        ids.add(slide.id);
        // Check title exists
        if (!slide.title || slide.title.trim() === '') {
            errors.push(`Slide ${i}: title is required`);
        }
        // Check content exists
        if (!slide.content || slide.content.trim() === '') {
            errors.push(`Slide ${i}: content is required`);
        }
        // Validate image URL if provided
        if (slide.image) {
            try {
                new URL(slide.image);
            }
            catch {
                errors.push(`Slide ${i}: invalid image URL: ${slide.image}`);
            }
        }
    }
    // Validate autoPlayInterval
    if (props.autoPlayInterval !== undefined && props.autoPlayInterval < 1000) {
        errors.push('autoPlayInterval must be at least 1000ms (1 second)');
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Report Validator
 * Ensures:
 * - Sections are non-empty
 * - Section IDs are unique
 * - Each section has required fields
 * - Metrics have valid status values
 */
function validateReport(props) {
    const errors = [];
    // Check title exists
    if (!props.title || props.title.trim() === '') {
        errors.push('Report title is required');
    }
    // Check sections exist
    if (!props.sections || props.sections.length === 0) {
        errors.push('Report must have at least one section');
        return { valid: false, errors };
    }
    // Track IDs for uniqueness
    const ids = new Set();
    const validStatuses = ['positive', 'neutral', 'negative'];
    for (let i = 0; i < props.sections.length; i++) {
        const section = props.sections[i];
        // Check ID exists and is unique
        if (!section.id) {
            errors.push(`Section ${i}: id is required`);
        }
        else if (ids.has(section.id)) {
            errors.push(`Duplicate section id: ${section.id}`);
        }
        ids.add(section.id);
        // Check title exists
        if (!section.title || section.title.trim() === '') {
            errors.push(`Section ${i}: title is required`);
        }
        // Validate metrics if provided
        if (section.metrics && section.metrics.length > 0) {
            for (let j = 0; j < section.metrics.length; j++) {
                const metric = section.metrics[j];
                if (!metric.label) {
                    errors.push(`Section ${i}, Metric ${j}: label is required`);
                }
                if (metric.value === null || metric.value === undefined) {
                    errors.push(`Section ${i}, Metric ${j}: value is required`);
                }
                if (metric.status && !validStatuses.includes(metric.status)) {
                    errors.push(`Section ${i}, Metric ${j}: invalid status '${metric.status}'`);
                }
            }
        }
        // Validate subsections if provided
        if (section.subsections && section.subsections.length > 0) {
            for (let j = 0; j < section.subsections.length; j++) {
                const subsection = section.subsections[j];
                if (!subsection.title || subsection.title.trim() === '') {
                    errors.push(`Section ${i}, Subsection ${j}: title is required`);
                }
                if (!subsection.content || subsection.content.trim() === '') {
                    errors.push(`Section ${i}, Subsection ${j}: content is required`);
                }
            }
        }
    }
    // Validate generated date if provided
    if (props.generatedDate) {
        if (isNaN(Date.parse(props.generatedDate))) {
            errors.push(`Invalid generatedDate: ${props.generatedDate}`);
        }
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Master validator - validates component by type
 * Runs both Zod schema validation and semantic validation
 */
function validateComponentFull(type, props) {
    const errors = [];
    try {
        switch (type) {
            case 'chart':
                return validateChart(props);
            case 'table':
                return validateTable(props);
            case 'card':
                return validateCard(props);
            case 'form':
                return validateForm(props);
            case 'list':
                return validateList(props);
            case 'slides':
                return validateSlides(props);
            case 'report':
                return validateReport(props);
            default:
                return {
                    valid: false,
                    errors: [`Unknown component type: ${type}`],
                };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            valid: false,
            errors: [`Validation error: ${errorMessage}`],
        };
    }
}
/**
 * Get validation errors for display
 * Formats errors for UI or logging
 */
function formatValidationErrors(errors) {
    if (errors.length === 0)
        return '';
    if (errors.length === 1)
        return errors[0];
    return errors.map((err, i) => `${i + 1}. ${err}`).join('\n');
}
//# sourceMappingURL=component-validators.js.map