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
export const COMPONENT_GENERATION_SYSTEM = `You are an expert UI component generator with deep knowledge of:
- Data visualization (charts, tables, reports)
- User interface components (cards, forms, lists, slides)
- Component architecture and type safety
- Query intent classification (data analysis, visualization, instruction, etc.)

Your responsibilities:
1. Analyze input data structure (size, types, fields)
2. Consider the suggested component type from query analysis
3. Select the optimal component type for the use case
4. Extract and map relevant data to component props
5. Ensure all required properties are included
6. Add descriptive titles, labels, and metadata
7. Consider accessibility and usability
8. Validate field consistency and data integrity

Component Selection Priority:
- If a component type is suggested, justify using it or explain alternatives
- Match component to both data structure AND query intent
- For data-analysis queries: prefer charts or tables
- For visualization requests: use charts or diagrams
- For instruction/how-to: use forms, lists, or slides
- For status/summaries: use cards or reports

CRITICAL REQUIREMENTS:
1. Always output PURE JSON (no markdown, no explanations)
2. Ensure all required fields per component type are present
3. Use valid IDs (alphanumeric, hyphens, lowercase)
4. Validate data consistency (all data rows have same fields as columns)
5. Include descriptive titles and labels for user clarity`;

/**
 * Chart-specific prompt template
 */
export function getChartPrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a Chart Component

### Chart Type Selection Guide
Choose the BEST chart type for this data:

1. **line** - Show trends over time
   - Good for: Time series, continuous data, multiple series
   - Example data: [{date: "2024-01", value: 100}, ...]

2. **bar** - Compare values across categories
   - Good for: Categorical comparisons, rankings
   - Example data: [{category: "Q1", value: 100}, ...]

3. **area** - Show magnitude and trends
   - Good for: Stacked values, cumulative data
   - Example data: [{date: "2024-01", value1: 100, value2: 50}, ...]

4. **pie** - Show proportions/percentages
   - Good for: Market share, distribution (max 5-7 slices recommended)
   - Example data: [{name: "Category", value: 100}, ...]

5. **scatter** - Show relationships between variables
   - Good for: Correlation analysis, outlier detection
   - Example data: [{x: 10, y: 20}, ...]

6. **radar** - Show multi-dimensional comparisons
   - Good for: Performance metrics, skill assessment
   - Example data: [{metric: "Speed", value: 80}, ...]

7. **combo** - Mix multiple chart types
   - Good for: Showing both bars and lines together
   - Example data: [{x: "Jan", bar: 100, line: 150}, ...]

### Requirements for Valid Chart
- MUST have: chartType, data array, xAxis (for most types), yAxis (for most types)
- data: Array of objects with consistent structure
- xAxis/yAxis: { key: string (field name in data), label?: string }
- For pie charts: Use simple {name, value} structure
- title: Descriptive chart title based on data
- responsive: true (for mobile support)

### Example Output
\`\`\`json
{
  "type": "chart",
  "id": "sales-q4-2024",
  "props": {
    "chartType": "line",
    "title": "Q4 2024 Sales Trend",
    "data": [
      {"month": "Oct", "revenue": 45000},
      {"month": "Nov", "revenue": 58000},
      {"month": "Dec", "revenue": 72000}
    ],
    "xAxis": {"key": "month", "label": "Month"},
    "yAxis": {"key": "revenue", "label": "Revenue ($)"},
    "showLegend": true,
    "showTooltip": true,
    "responsive": true
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * Table-specific prompt template
 */
export function getTablePrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a Table Component

### Requirements for Valid Table
- MUST have: columns (array) and data (array)
- columns: Array of {key: string, label: string, type?: 'text'|'number'|'date'|'status', sortable?: boolean}
- data: Array of objects where keys match column.key values
- ALL column keys must exist in ALL data rows
- title: Descriptive table title
- pagination: {enabled: true, pageSize: 20} for large datasets

### Column Type Guidelines
- **text**: Use for strings, descriptions
- **number**: Use for numeric values (will validate and format)
- **date**: Use for dates (will parse and format)
- **status**: Use for status badges (positive/warning/error states)

### Important Rules
1. Column order in 'columns' array determines display order
2. Keys are case-sensitive and must EXACTLY match data field names
3. For large datasets (>50 rows), enable pagination
4. Keep column count between 3-8 for readability

### Example Output
\`\`\`json
{
  "type": "table",
  "id": "employees-table",
  "props": {
    "title": "Employee Directory",
    "columns": [
      {"key": "name", "label": "Name", "type": "text", "sortable": true},
      {"key": "email", "label": "Email", "type": "text"},
      {"key": "startDate", "label": "Start Date", "type": "date", "sortable": true},
      {"key": "status", "label": "Status", "type": "status"}
    ],
    "data": [
      {"name": "John Doe", "email": "john@example.com", "startDate": "2023-01-15", "status": "active"},
      {"name": "Jane Smith", "email": "jane@example.com", "startDate": "2023-06-20", "status": "active"}
    ],
    "striped": true,
    "hover": true,
    "pagination": {"enabled": true, "pageSize": 20}
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * Card-specific prompt template
 */
export function getCardPrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a Card Component

### Card Variants
- **default**: Standard card with neutral colors
- **success**: Green styling for positive outcomes
- **warning**: Yellow styling for warnings/cautions
- **error**: Red styling for errors/critical issues
- **info**: Blue styling for information/notices

### Requirements for Valid Card
- MUST have: content (non-empty string)
- title: Optional card title
- content: Main message/information
- footer: Optional footer text
- variant: One of the 5 variants above
- icon: Optional emoji or lucide-react icon name
- image: Optional image URL
- actions: Optional array of {label: string, onClick?: string}

### When to Use Card
- Single metric or KPI display
- Status/announcement messaging
- Feature highlight
- Summary information

### Example Output
\`\`\`json
{
  "type": "card",
  "id": "success-notification",
  "props": {
    "title": "Operation Successful",
    "content": "Your changes have been saved successfully.",
    "variant": "success",
    "icon": "✓",
    "actions": [
      {"label": "View Details"}
    ]
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * Form-specific prompt template
 */
export function getFormPrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a Form Component

### Field Types
- **text**: Single-line text input
- **email**: Email input (with validation)
- **password**: Masked password input
- **number**: Numeric input
- **date**: Date picker
- **checkbox**: Boolean checkbox (single)
- **radio**: Single selection from options
- **select**: Dropdown selection from options
- **textarea**: Multi-line text input

### Requirements for Valid Form
- MUST have: fields (non-empty array)
- Each field MUST have: name (unique), label, type
- For radio/select fields: options array required
- Field names: Use camelCase, no spaces or special chars
- label: User-friendly field label
- required: Mark mandatory fields as true
- validation: {pattern?, minLength?, maxLength?}

### Important Rules
1. All field names must be UNIQUE
2. For select/radio: options = [{label, value}, ...]
3. Labels should be clear and descriptive
4. Validation patterns for common types:
   - Email: Automatic validation
   - URL: "^https?://"
   - Phone: "^\\d{10}$"

### Example Output
\`\`\`json
{
  "type": "form",
  "id": "user-signup-form",
  "props": {
    "title": "Create Account",
    "fields": [
      {"name": "fullName", "label": "Full Name", "type": "text", "required": true},
      {"name": "email", "label": "Email Address", "type": "email", "required": true},
      {"name": "role", "label": "Role", "type": "select", "required": true, "options": [
        {"label": "Admin", "value": "admin"},
        {"label": "User", "value": "user"}
      ]},
      {"name": "terms", "label": "I agree to terms", "type": "checkbox", "required": true}
    ],
    "submitLabel": "Create Account",
    "layout": "vertical"
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * List-specific prompt template
 */
export function getListPrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a List Component

### List Variants
- **simple**: Basic bulleted/numbered list
- **card**: List items styled as cards
- **interactive**: Selectable/clickable list items

### Requirements for Valid List
- MUST have: items (non-empty array)
- Each item MUST have: id (unique), title
- item properties: id, title, description?, icon?, badge?, avatar?, selected?, disabled?
- title: List/section title
- ordered: Boolean (true = numbered, false = bulleted)
- variant: One of simple, card, or interactive
- selectable: Enable checkbox selection
- searchable: Enable search/filter input

### Important Rules
1. All item IDs must be UNIQUE
2. Title should be descriptive and concise
3. Description is optional but recommended for context
4. For avatars: Use image URLs or initials
5. Badges: Use for status indicators

### Example Output
\`\`\`json
{
  "type": "list",
  "id": "team-members-list",
  "props": {
    "title": "Team Members",
    "items": [
      {"id": "user-1", "title": "Alice Johnson", "description": "Product Manager", "avatar": "AJ", "badge": "Lead"},
      {"id": "user-2", "title": "Bob Smith", "description": "Developer", "avatar": "BS", "badge": "Active"}
    ],
    "variant": "card",
    "selectable": false,
    "searchable": true
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * Slides-specific prompt template
 */
export function getSlidesPrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a Slides Component

### Requirements for Valid Slides
- MUST have: slides (non-empty array)
- Each slide MUST have: id (unique), title, content
- slide properties: id, title, content, image?, backgroundColor?, textColor?
- title: Presentation title
- autoPlay: Boolean (auto-advance slides)
- autoPlayInterval: Milliseconds between auto-advances (default 5000, min 1000)
- showNavigationDots: Boolean (show slide indicators)
- showNavigationArrows: Boolean (show prev/next buttons)

### Important Rules
1. All slide IDs must be UNIQUE
2. Content can include formatted text
3. Image URLs should be valid and accessible
4. Keep content concise (1-2 sentences per slide)
5. At least 2 slides recommended for carousel effect

### Example Output
\`\`\`json
{
  "type": "slides",
  "id": "product-tour",
  "props": {
    "title": "Product Features Tour",
    "slides": [
      {"id": "slide-1", "title": "Welcome", "content": "Explore our amazing product"},
      {"id": "slide-2", "title": "Feature 1", "content": "Powerful data visualization"},
      {"id": "slide-3", "title": "Get Started", "content": "Start building today"}
    ],
    "autoPlay": false,
    "showNavigationDots": true,
    "showNavigationArrows": true,
    "height": 500
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * Report-specific prompt template
 */
export function getReportPrompt(
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  const dataContext = buildDataContext(toolResults);

  return `## User Request
${userQuery}

## Data Provided
${dataContext}

## Task: Generate a Report Component

### Requirements for Valid Report
- MUST have: title (required), sections (non-empty array)
- Each section MUST have: id (unique), title
- section properties: id, title, content?, subsections?, metrics?
- summary: Optional executive summary
- author: Optional author name
- generatedDate: Optional date string (ISO format)
- printable: Boolean (enable print styling)

### Section Structure
Each section can contain:
- content: Main section text
- subsections: Array of {title, content}
- metrics: Array of {label, value, unit?, status?}

### Metric Status Values
- **positive**: Green (good outcome)
- **neutral**: Gray (neutral/informational)
- **negative**: Red (bad outcome)

### Important Rules
1. All section IDs must be UNIQUE
2. Organize logically: Overview → Details → Summary
3. Metrics provide quick insights
4. Keep content scannable with clear headings
5. For data-heavy reports: use 5-8 sections max

### Example Output
\`\`\`json
{
  "type": "report",
  "id": "q4-sales-report",
  "props": {
    "title": "Q4 2024 Sales Report",
    "summary": "Strong quarter with 35% growth",
    "author": "Sales Team",
    "sections": [
      {
        "id": "overview",
        "title": "Overview",
        "metrics": [
          {"label": "Total Revenue", "value": 250000, "status": "positive"},
          {"label": "Target Achievement", "value": "92%", "status": "neutral"}
        ]
      },
      {
        "id": "details",
        "title": "Regional Performance",
        "content": "North region led with 40% of total sales...",
        "subsections": [
          {"title": "North Region", "content": "Top performer..."},
          {"title": "South Region", "content": "Steady growth..."}
        ]
      }
    ],
    "printable": true
  }
}
\`\`\`

Generate valid JSON only (no markdown, no explanation).`;
}

/**
 * Helper function to build data context from tool results
 */
function buildDataContext(toolResults: ToolCallResult[]): string {
  if (toolResults.length === 0) {
    return 'No data provided';
  }

  let context = '';
  for (const result of toolResults) {
    context += `\n### ${result.name}:\n\`\`\`json\n`;
    const data = result.result;

    if (Array.isArray(data)) {
      context += `Array with ${data.length} items\n`;
      if (data.length > 0) {
        context += `First item: ${JSON.stringify(data[0], null, 2)}\n`;
        if (data.length > 1) {
          context += `[${data.length - 1} more items...]\n`;
        }
      }
    } else {
      context += `${JSON.stringify(data, null, 2)}\n`;
    }

    context += '\`\`\`\n';
  }

  return context;
}

/**
 * Get component-specific prompt by type
 */
export function getComponentPrompt(
  type: string,
  userQuery: string,
  toolResults: ToolCallResult[]
): string {
  switch (type) {
    case 'chart':
      return getChartPrompt(userQuery, toolResults);
    case 'table':
      return getTablePrompt(userQuery, toolResults);
    case 'card':
      return getCardPrompt(userQuery, toolResults);
    case 'form':
      return getFormPrompt(userQuery, toolResults);
    case 'list':
      return getListPrompt(userQuery, toolResults);
    case 'slides':
      return getSlidesPrompt(userQuery, toolResults);
    case 'report':
      return getReportPrompt(userQuery, toolResults);
    default:
      return `Generate a ${type} component from the user query: ${userQuery}`;
  }
}
