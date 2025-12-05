/**
 * DynamicRenderer
 *
 * Renders ComponentSpec into actual React components with:
 * - Error Boundaries (graceful error handling)
 * - Loading skeletons (perceived performance)
 * - Type validation (safe rendering)
 *
 * Pattern: Registry pattern with error handling
 */

'use client';

import React from 'react';
import type { ComponentSpec } from './types';
import { ErrorBoundary } from '@/components/generative/ErrorBoundary';
import { ComponentSkeleton } from '@/components/generative/LoadingSkeletons';
import { CardComponent } from '@/components/generative/Card/CardComponent';
import { ChartComponent } from '@/components/generative/Chart/ChartComponent';
import { TableComponent } from '@/components/generative/Table/TableComponent';
import { FormComponent } from '@/components/generative/Form/FormComponent';
import { ListComponent } from '@/components/generative/List/ListComponent';
import { SlidesComponent } from '@/components/generative/Slides/SlidesComponent';
import { ReportComponent } from '@/components/generative/Report/ReportComponent';

// Component registry - Maps component types to React components
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  chart: ({ props }: { props: any }) => <ChartComponent {...props} />,
  table: ({ props }: { props: any }) => <TableComponent {...props} />,
  card: ({ props }: { props: any }) => <CardComponent {...props} />,
  form: ({ props }: { props: any }) => <FormComponent {...props} />,
  list: ({ props }: { props: any }) => <ListComponent {...props} />,
  slides: ({ props }: { props: any }) => <SlidesComponent {...props} />,
  report: ({ props }: { props: any }) => <ReportComponent {...props} />,
};

/**
 * DynamicRenderer - Renders ComponentSpec with error boundaries
 *
 * Features:
 * - Error boundary wrapping
 * - Loading skeleton support
 * - Type validation
 * - Fallback UI
 *
 * @param spec - ComponentSpec to render
 * @param loading - Show loading skeleton
 * @returns React component
 */
export function DynamicRenderer({
  spec,
  loading = false,
}: {
  spec: ComponentSpec | null;
  loading?: boolean;
}) {
  // Loading state
  if (loading || !spec) {
    if (!spec) {
      return (
        <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded border border-gray-200">
          No component to render
        </div>
      );
    }
    return <ComponentSkeleton type={spec.type} />;
  }

  // Normalize type to lowercase (LLM may return "Chart" instead of "chart")
  const normalizedType = spec.type.toLowerCase();

  // Validate component type
  const Component = COMPONENT_REGISTRY[normalizedType];

  if (!Component) {
    console.error(`[DynamicRenderer] Unknown component type: "${spec.type}" (normalized: "${normalizedType}")`);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Unknown component type</p>
            <p className="text-sm text-red-800">{spec.type} (normalized: {normalizedType})</p>
          </div>
        </div>
      </div>
    );
  }

  // Log successful component render for debugging
  console.log(`[DynamicRenderer] Rendering ${normalizedType} component`, spec.props);

  // Render with error boundary
  return (
    <ErrorBoundary
      componentName={`${normalizedType} component`}
      onError={(error) => {
        console.error(`Error in ${normalizedType} component:`, error);
      }}
    >
      <Component props={spec.props} />
    </ErrorBoundary>
  );
}

/**
 * Enhanced renderer with better error handling
 * Useful for batch rendering multiple components
 */
export function BatchDynamicRenderer({
  specs,
  loading = false,
  gap = 4,
}: {
  specs: ComponentSpec[];
  loading?: boolean;
  gap?: number;
}) {
  if (!specs || specs.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded border border-gray-200">
        No components to render
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
      {specs.map((spec, index) => (
        <DynamicRenderer key={spec.id || index} spec={spec} loading={loading} />
      ))}
    </div>
  );
}

/**
 * Register custom component
 * For extending the system with new component types
 */
export function registerComponent(
  type: string,
  component: React.ComponentType<any>
) {
  COMPONENT_REGISTRY[type] = component;
}

/**
 * Get list of available component types
 */
export function getAvailableComponentTypes(): string[] {
  return Object.keys(COMPONENT_REGISTRY);
}

/**
 * Check if component type is supported
 */
export function isSupportedComponentType(type: string): boolean {
  return type in COMPONENT_REGISTRY;
}
