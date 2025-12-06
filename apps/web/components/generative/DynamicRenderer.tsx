
import React from 'react';
import { ComponentSpec } from '../../types/generative';
import { ErrorBoundary } from './ErrorBoundary';

// Import components
import { Chart } from './Chart';
import { Table } from './Table';
import { Form } from './Form';
import { Card } from './Card';
import { List } from './List';
import { Slides } from './Slides';
import { Report } from './Report';

export interface DynamicRendererProps {
  spec: ComponentSpec;
  className?: string;
  onError?: (error: Error) => void;
}

const componentMap: Record<ComponentSpec['type'], React.ComponentType<any>> = {
  chart: Chart,
  table: Table,
  form: Form,
  card: Card,
  list: List,
  slides: Slides,
  report: Report,
};

import { CrayonRenderer } from './CrayonRenderer';

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ spec, className, onError }) => {
  // Use CrayonRenderer for supported types
  if (spec.type === 'card' || spec.type === 'table') {
    return (
      <div className={className} data-component-id={spec.id} data-component-type={spec.type}>
        <ErrorBoundary componentName={spec.type} onError={onError}>
          <CrayonRenderer spec={spec} />
        </ErrorBoundary>
      </div>
    );
  }

  const Component = componentMap[spec.type];

  if (!Component) {
    console.warn(`Unknown component type: ${spec.type}`);
    // Try Crayon renderer as generic fallback for unknown types?
    // For now, use existing fallback or try Crayon if it's not mapped
    return (
      <div className={className} data-component-id={spec.id} data-component-type={spec.type}>
        <ErrorBoundary componentName={spec.type} onError={onError}>
          {/* Fallback to CrayonRenderer which can handle generic display */}
          <CrayonRenderer spec={spec} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className={className} data-component-id={spec.id} data-component-type={spec.type}>
      <ErrorBoundary componentName={spec.type} onError={onError}>
        {/*
          We cast props to any because TypeScript has trouble deducing the exact prop type
          union discriminators for this map lookup pattern without complex generic typing.
          Runtime validation (Zod) is handled before this point.
        */}
        <Component {...(spec.props as any)} />
      </ErrorBoundary>
    </div>
  );
};

export function isSupportedComponentType(type: string): boolean {
  return type in componentMap || type === 'card' || type === 'table';
}

export function getAvailableComponentTypes(): string[] {
  return Object.keys(componentMap);
}

export function BatchDynamicRenderer({
  specs,
  className,
  onError,
}: {
  specs: ComponentSpec[];
  className?: string;
  onError?: (error: Error) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {specs.map((spec) => (
        <DynamicRenderer
          key={spec.id}
          spec={spec}
          className={className}
          onError={onError}
        />
      ))}
    </div>
  );
}
