/**
 * Generative Components - Export Index
 *
 * Central export point for all generative UI components
 * Import from '@/components/generative' for clean imports
 */

// Core Renderer
export { DynamicRenderer } from './DynamicRenderer';
export type { DynamicRendererProps } from './DynamicRenderer';
export { isValidComponentType, getSupportedComponentTypes, componentRegistry } from './DynamicRenderer';

// Error Boundary
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Loading Skeletons
export {
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  ChartSkeleton,
  FormSkeleton,
  SlidesSkeleton,
  ReportSkeleton,
  ComponentSkeleton,
} from './LoadingSkeletons';

// Individual Components
export { ChartComponent } from './Chart/ChartComponent';
export { TableComponent } from './Table/TableComponent';
export { FormComponent } from './Form/FormComponent';
export { CardComponent } from './Card/CardComponent';
export { ListComponent } from './List/ListComponent';
export { SlidesComponent } from './Slides/SlidesComponent';
export { ReportComponent } from './Report/ReportComponent';

// Re-export types for convenience
export type {
  ComponentSpec,
  ComponentProps,
  ChartProps,
  TableProps,
  FormProps,
  CardProps,
  ListProps,
  SlidesProps,
  ReportProps,
  FormField,
  ListItem,
  Slide,
  ReportSection,
} from '@/lib/types';
