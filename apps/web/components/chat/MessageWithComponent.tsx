/**
 * MessageWithComponent
 *
 * Progressive Disclosure UI Pattern
 * - Text summary ALWAYS visible
 * - Component spec HIDDEN behind "Xem chi tiết" button
 * - Smooth expand/collapse animations
 *
 * SOLID Design:
 * - Single Responsibility: Only handles UI presentation
 * - Composition: Uses DynamicRenderer for component rendering
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DynamicRenderer } from '@/components/generative/DynamicRenderer';
import { ErrorBoundary } from '@/components/generative/ErrorBoundary';
import type { ComponentSpec } from '@/lib/types';

interface MessageWithComponentProps {
  textSummary: string;
  componentSpec: ComponentSpec;
  isLoading?: boolean;
}

export function MessageWithComponent({
  textSummary,
  componentSpec,
  isLoading = false,
}: MessageWithComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3 mb-4">
      {/* Text Summary - Always Visible */}
      <div className="text-summary prose prose-sm max-w-none">
        <p className="text-gray-800 leading-relaxed">{textSummary}</p>
      </div>

      {/* Expand Button */}
      {componentSpec && !isLoading && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100
                     rounded-lg transition-colors text-sm font-medium text-blue-700
                     border border-blue-200"
        >
          <span>📊 Xem chi tiết</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
              }`}
          />
        </button>
      )}

      {/* Component - Collapsible with Error Boundary */}
      {isExpanded && !isLoading && (
        <div className="pt-3 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <ErrorBoundary
            componentName={componentSpec?.type || 'Component'}
            fallback={
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  Không thể hiển thị component. Vui lòng thử thu gọn và mở rộng lại.
                </p>
              </div>
            }
            onError={(error) => {
              console.error('[MessageWithComponent] Render error:', error);
            }}
          >
            <DynamicRenderer spec={componentSpec} />
          </ErrorBoundary>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
          Generating visualization...
        </div>
      )}
    </div>
  );
}
