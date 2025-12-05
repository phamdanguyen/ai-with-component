/**
 * TableComponent
 *
 * Flexible table component for displaying tabular data
 * Supports sorting, pagination, and multiple column types
 * Type-safe props from core types
 */

'use client';

import React from 'react';
import type { TableProps } from '@/lib/types';

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string | null;
  direction: SortDirection;
}

export function TableComponent({
  columns,
  data,
  title,
  striped = true,
  hover = true,
  maxHeight = 400,
  pagination,
}: TableProps) {
  const [sortState, setSortState] = React.useState<SortState>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = React.useState(1);

  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No data to display</p>
      </div>
    );
  }

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    setSortState((prev) => ({
      key: columnKey,
      direction:
        prev.key === columnKey
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc'
          : 'asc',
    }));
  };

  // Sort data
  let sortedData = [...data];
  if (sortState.key && sortState.direction) {
    sortedData.sort((a, b) => {
      const aVal = a[sortState.key!];
      const bVal = b[sortState.key!];

      if (aVal == null || bVal == null) return 0;

      // Handle different types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortState.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  // Handle pagination
  const pageSize = pagination?.pageSize || 10;
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedData = pagination?.enabled ? sortedData.slice(startIdx, endIdx) : sortedData;

  // Format cell value
  const formatCell = (value: unknown, type?: string) => {
    if (value == null) return '-';

    if (type === 'date' && value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (type === 'date' && typeof value === 'string') {
      return new Date(value).toLocaleDateString();
    }
    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }
    if (type === 'status') {
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            value === 'active' || value === 'success'
              ? 'bg-green-100 text-green-700'
              : value === 'inactive' || value === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          {String(value)}
        </span>
      );
    }

    return String(value);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortState.key !== columnKey) return '⇅';
    return sortState.direction === 'asc' ? '↑' : '↓';
  };

  const containerStyle: React.CSSProperties = maxHeight
    ? { maxHeight: `${maxHeight}px`, overflowY: 'auto' }
    : {};

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div style={containerStyle}>
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span
                          className={`text-xs transition-colors ${
                            sortState.key === column.key ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {getSortIcon(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-gray-200 ${striped && rowIdx % 2 === 1 ? 'bg-gray-50' : ''} ${
                    hover ? 'hover:bg-blue-50 transition-colors' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIdx}-${column.key}`}
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      {formatCell(row[column.key], column.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {paginatedData.length} of {sortedData.length} rows
          </div>

          {pagination?.enabled && totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="px-2 py-1 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
