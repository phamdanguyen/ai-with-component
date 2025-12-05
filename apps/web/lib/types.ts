/**
 * Frontend Types - Type-Safe Component Definitions
 * Mirrors backend types for consistency
 * Sync with packages/middleware/src/types/core.types.ts
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

// Component Spec - Discriminated Union (Type-Safe)
export type ComponentSpec =
  | { type: 'chart'; id: string; props: ChartProps; children?: ComponentSpec[] }
  | { type: 'table'; id: string; props: TableProps; children?: ComponentSpec[] }
  | { type: 'card'; id: string; props: CardProps; children?: ComponentSpec[] }
  | { type: 'form'; id: string; props: FormProps; children?: ComponentSpec[] }
  | { type: 'list'; id: string; props: ListProps; children?: ComponentSpec[] }
  | { type: 'slides'; id: string; props: SlidesProps; children?: ComponentSpec[] }
  | { type: 'report'; id: string; props: ReportProps; children?: ComponentSpec[] };

export interface DualResponse {
  textSummary: string;
  componentSpec: ComponentSpec;
  toolResults?: Record<string, any>;
  metadata?: {
    textModel: string;
    componentModel: string;
    executionTime: number;
    toolsUsed: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  component?: ComponentSpec;
  timestamp: string;
}
