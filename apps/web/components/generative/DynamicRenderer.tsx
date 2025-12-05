
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

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ spec, className, onError }) => {
  const Component = componentMap[spec.type];

  if (!Component) {
    console.warn(`Unknown component type: ${spec.type}`);
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 text-yellow-800 rounded">
        Unknown component type: <strong>{spec.type}</strong>
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
