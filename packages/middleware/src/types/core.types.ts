/**
 * Core Types
 *
 * Central type definitions for the entire middleware system
 * All interfaces and types used across services
 */

/**
 * Component-Specific Props Types - Type-safe prop definitions for each component
 */

// Chart Component Props
export interface ChartProps {
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'combo';
  data: Array<Record<string, unknown>>;
  xAxis?: {
    key: string;
    label?: string;
    type?: string;
  };
  yAxis?: {
    key: string;
    label?: string;
    type?: string;
  };
  dataKey?: string;
  title?: string;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  responsive?: boolean;
}

// Table Component Props
export interface TableProps {
  columns: Array<{
    key: string;
    label: string;
    width?: number | string;
    sortable?: boolean;
    type?: 'text' | 'number' | 'date' | 'status';
  }>;
  data: Array<Record<string, unknown>>;
  title?: string;
  striped?: boolean;
  hover?: boolean;
  maxHeight?: number;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
  };
}

// Card Component Props
export interface CardProps {
  title?: string;
  content: string;
  footer?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: string;
  image?: string;
  actions?: Array<{
    label: string;
    onClick?: string;
  }>;
  clickable?: boolean;
}

// Form Component Props
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  rows?: number;
  defaultValue?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FormProps {
  title?: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'vertical' | 'horizontal';
  onSubmit?: {
    action: string;
    endpoint?: string;
  };
}

// List Component Props
export interface ListItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  avatar?: string;
  selected?: boolean;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ListProps {
  items: ListItem[];
  title?: string;
  ordered?: boolean;
  variant?: 'simple' | 'card' | 'interactive';
  selectable?: boolean;
  searchable?: boolean;
  maxHeight?: number;
}

// Slides Component Props
export interface Slide {
  id: string;
  title: string;
  content: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface SlidesProps {
  slides: Slide[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigationDots?: boolean;
  showNavigationArrows?: boolean;
  height?: number;
}

// Report Component Props
export interface ReportSection {
  id: string;
  title: string;
  content?: string;
  subsections?: Array<{
    title: string;
    content: string;
  }>;
  metrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
    status?: 'positive' | 'neutral' | 'negative';
  }>;
}

export interface ReportProps {
  title: string;
  summary?: string;
  sections: ReportSection[];
  footer?: string;
  generatedDate?: string;
  author?: string;
  printable?: boolean;
}

// Union type for all component props
export type ComponentProps =
  | ChartProps
  | TableProps
  | CardProps
  | FormProps
  | ListProps
  | SlidesProps
  | ReportProps;

/**
 * Component Spec - The heart of GenUI (Discriminated Union)
 * Defines structure for AI-generated UI components with type-safe props
 */
export type ComponentSpec =
  | { type: 'chart'; id: string; props: ChartProps; children?: ComponentSpec[]; events?: ComponentEvent[] }
  | { type: 'table'; id: string; props: TableProps; children?: ComponentSpec[]; events?: ComponentEvent[] }
  | { type: 'card'; id: string; props: CardProps; children?: ComponentSpec[]; events?: ComponentEvent[] }
  | { type: 'form'; id: string; props: FormProps; children?: ComponentSpec[]; events?: ComponentEvent[] }
  | { type: 'list'; id: string; props: ListProps; children?: ComponentSpec[]; events?: ComponentEvent[] }
  | { type: 'slides'; id: string; props: SlidesProps; children?: ComponentSpec[]; events?: ComponentEvent[] }
  | { type: 'report'; id: string; props: ReportProps; children?: ComponentSpec[]; events?: ComponentEvent[] };

export interface ComponentEvent {
  type: string;
  action: {
    type: 'tool_call' | 'navigation' | 'custom';
    payload: Record<string, unknown>;
  };
}

/**
 * Dual Response - Result of 2-request architecture
 * Contains both text summary and component spec
 */
export interface DualResponse {
  textSummary: string;
  componentSpec: ComponentSpec;
  toolResults?: Record<string, unknown>;
  metadata?: {
    textModel: string;
    componentModel: string;
    executionTime: number;
    toolsUsed: string[];
  };
}

/**
 * Stream Chunk - Incremental data chunk for SSE streaming
 * Used for real-time response streaming to client
 */
export interface StreamChunk {
  type: 'text' | 'component' | 'tool' | 'complete' | 'error';
  data: string | ComponentSpec | ToolCallResult | Record<string, unknown>;
  timestamp: number;
  id?: string;
  metadata?: {
    chunkIndex?: number;
    totalChunks?: number;
    model?: string;
  };
}

/**
 * Chat Message - Conversation format
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

/**
 * Tool Call Request - When AI wants to call a tool
 */
export interface ToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Tool Call Result - Response from tool execution
 */
export interface ToolCallResult {
  name: string;
  result: unknown;
  error?: string;
  cached?: boolean;
  executionTime?: number;
}

/**
 * Request Context - Full context for dual request processing
 */
export interface RequestContext {
  message: string;
  sessionId?: string;
  conversationHistory?: ChatMessage[];
  availableTools?: string[];
}

/**
 * Service Config - Configuration for services
 */
export interface ServiceConfig {
  geminiApiKey: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  maxCacheSize?: number;
}

/**
 * Generation Metrics - Track performance and failures
 * Used for Week 3 analysis and A/B testing
 */
export interface GenerationMetrics {
  // Identification
  sessionId?: string;
  requestId: string;
  timestamp: number;

  // Query info
  queryType: 'data-analysis' | 'code-explanation' | 'instruction' | 'visualization' | 'question' | 'chat' | 'unknown' | 'cached';
  userMessage: string;
  messageLength: number;

  // Generation details
  componentType?: 'chart' | 'table' | 'card' | 'form' | 'list' | 'slides' | 'report';
  success: boolean;
  failureReason?: string;
  errorType?: 'schema_validation' | 'semantic_validation' | 'api_error' | 'retry_exhausted' | 'timeout' | 'unknown';

  // Performance
  executionTime: number; // ms
  retryCount: number;
  textGenerationTime?: number;
  componentGenerationTime?: number;

  // Results
  retryWasFinal?: boolean; // Was the last retry that succeeded
  usedFallback?: boolean;
  validationErrors?: string[];

  // Tool info
  toolsUsed?: string[];
  toolCount?: number;

  // Model info
  textModel?: string;
  componentModel?: string;
  temperature?: number;

  // Streaming info
  isStreaming?: boolean;
  textChunkCount?: number;
}

/**
 * Generation Report - Aggregated statistics
 */
export interface GenerationReport {
  // Flat properties for easy access (tests expect these)
  totalMetrics: number;
  successRate: number; // decimal 0-1
  totalFailures: number;
  avgExecutionTime: number;
  avgMessageLength: number;
  avgRetryCount: number;

  // Nested structure for detailed reporting
  period: {
    startTime: number;
    endTime: number;
    duration: number;
  };
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number; // percentage 0-100
    avgExecutionTime: number;
  };
  byComponentType: Record<string, {
    count: number;
    successRate: number; // decimal 0-1
    avgTime: number;
    topErrors: Array<{ error: string; count: number }>;
  }>;
  byQueryType: Record<string, {
    count: number;
    successRate: number; // decimal 0-1
    avgTime: number;
  }>;
  errors: Array<{
    errorType: string;
    count: number;
    examples: string[];
  }>;
  topFailures: Array<{
    reason: string;
    count: number;
    lastOccurred: number;
  }>;
}
