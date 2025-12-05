/**
 * ErrorBoundary Component
 *
 * Catches rendering errors and displays fallback UI
 * Prevents entire app crash if a component fails
 */

'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-800 mb-3">
                {this.props.componentName && `The ${this.props.componentName} `}
                component encountered an error and couldn't render properly.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-red-100 rounded border border-red-300 text-sm font-mono text-red-900 overflow-auto max-h-48">
                  <summary className="cursor-pointer font-semibold mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div>
                    <p className="font-bold mb-1">Error:</p>
                    <p className="mb-3 whitespace-pre-wrap">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <>
                        <p className="font-bold mb-1">Stack Trace:</p>
                        <p className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</p>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={this.resetError}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  🔁 Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for ErrorBoundary
 * Makes it easier to use with custom error handlers
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    componentName?: string;
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary
      fallback={options?.fallback}
      onError={options?.onError}
      componentName={options?.componentName}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
