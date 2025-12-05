/**
 * ClientLayout
 *
 * Client-side wrapper for the app that includes:
 * - Global Error Boundary
 * - Future: Theme providers, toast notifications, etc.
 */

'use client';

import { ReactNode } from 'react';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <GlobalErrorBoundary>
      {children}
    </GlobalErrorBoundary>
  );
}
