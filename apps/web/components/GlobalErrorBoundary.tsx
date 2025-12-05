/**
 * GlobalErrorBoundary
 *
 * App-level error boundary to catch unhandled errors
 * Displays user-friendly error page with recovery options
 */

'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Đã xảy ra lỗi
            </h1>
            <p className="text-gray-600 mb-6">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left p-4 bg-red-50 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-red-800 mb-2">
                  Chi tiết lỗi (Development)
                </summary>
                <pre className="text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
