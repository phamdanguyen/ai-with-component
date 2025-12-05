/**
 * Loading Skeleton Components
 *
 * Provides skeleton loaders for each GenUI component type
 * Improves perceived performance during data loading
 */

'use client';

/**
 * Generic Skeleton Block
 */
function SkeletonBlock({ width = '100%', height = '16px', className = '' }: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg border-gray-200 space-y-3">
      <SkeletonBlock height={24} width="60%" />
      <SkeletonBlock height={16} width="100%" />
      <SkeletonBlock height={16} width="85%" />
      <div className="flex gap-2 pt-2">
        <SkeletonBlock height={32} width={80} />
        <SkeletonBlock height={32} width={80} />
      </div>
    </div>
  );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      <SkeletonBlock height={20} width="40%" />
      <div className="border rounded-lg border-gray-200 p-4 space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <SkeletonBlock height={40} width={40} className="rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock height={16} width="70%" />
              <SkeletonBlock height={14} width="50%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      <SkeletonBlock height={20} width="30%" />
      <div className="border rounded-lg border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-100 flex gap-3">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonBlock key={i} height={16} width={`${100 / columns}%`} />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-3 border-t border-gray-200">
            {Array.from({ length: columns }).map((_, j) => (
              <SkeletonBlock key={j} height={16} width={`${100 / columns}%`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock height={24} width="40%" />
      <div className="border rounded-lg border-gray-200 p-4">
        <div className="w-full h-80 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      <SkeletonBlock height={24} width="50%" />
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock height={16} width="30%" />
            <SkeletonBlock height={40} width="100%" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <SkeletonBlock height={40} width="48%" />
        <SkeletonBlock height={40} width="48%" />
      </div>
    </div>
  );
}

/**
 * Slides Skeleton
 */
export function SlidesSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock height={24} width="40%" />
      <div className="w-full h-80 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} height={8} width={24} className="rounded-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Report Skeleton
 */
export function ReportSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <SkeletonBlock height={32} width="60%" />
        <SkeletonBlock height={16} width="40%" />
        <SkeletonBlock height={16} width="100%" />
      </div>

      {/* Sections */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
          <SkeletonBlock height={24} width="50%" />
          <SkeletonBlock height={16} width="100%" />
          <SkeletonBlock height={16} width="95%" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="p-3 bg-gray-50 rounded space-y-2">
                <SkeletonBlock height={14} width="80%" />
                <SkeletonBlock height={24} width="60%" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Generic Component Skeleton
 * Detects component type and renders appropriate skeleton
 */
export function ComponentSkeleton({ type }: { type: string }) {
  switch (type) {
    case 'card':
      return <CardSkeleton />;
    case 'list':
      return <ListSkeleton />;
    case 'table':
      return <TableSkeleton />;
    case 'chart':
      return <ChartSkeleton />;
    case 'form':
      return <FormSkeleton />;
    case 'slides':
      return <SlidesSkeleton />;
    case 'report':
      return <ReportSkeleton />;
    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <SkeletonBlock height={20} />
        </div>
      );
  }
}
