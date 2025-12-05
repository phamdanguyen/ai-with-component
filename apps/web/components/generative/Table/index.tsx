'use client';

import React, { useState, useMemo } from 'react';
import { TableProps } from '../../../types/generative';
import classNames from 'classnames';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const Table: React.FC<TableProps> = ({
    columns,
    data,
    title,
    striped = false,
    hover = true,
    maxHeight,
    pagination = { enabled: true, pageSize: 10 },
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting
    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key] as any;
                const bValue = b[sortConfig.key] as any;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    // Pagination
    const pageSize = pagination.enabled ? (pagination.pageSize || 10) : data.length;
    const totalPages = Math.ceil(sortedData.length / pageSize);

    const paginatedData = useMemo(() => {
        if (!pagination.enabled) return sortedData;
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, pagination.enabled, currentPage, pageSize]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatValue = (value: unknown, type?: string) => {
        if (value === null || value === undefined) return '-';

        if (type === 'date') {
            return new Date(value as string).toLocaleDateString();
        }

        if (type === 'status') {
            const status = String(value).toLowerCase();
            let colorClass = 'bg-gray-100 text-gray-800';
            if (['active', 'success', 'completed', 'paid'].includes(status)) colorClass = 'bg-green-100 text-green-800';
            if (['pending', 'warning', 'processing'].includes(status)) colorClass = 'bg-yellow-100 text-yellow-800';
            if (['error', 'failed', 'inactive', 'cancelled'].includes(status)) colorClass = 'bg-red-100 text-red-800';

            return (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
                    {String(value)}
                </span>
            );
        }

        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {title && (
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
            )}

            <div className="overflow-x-auto" style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}>
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={classNames('px-6 py-3', { 'cursor-pointer hover:bg-gray-100': col.sortable })}
                                    onClick={() => col.sortable && requestSort(col.key)}
                                    style={{ width: col.width }}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortConfig?.key === col.key && (
                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={index}
                                    className={classNames('border-b last:border-0', {
                                        'bg-gray-50': striped && index % 2 !== 0,
                                        'hover:bg-gray-50': hover,
                                        'bg-white': !striped || index % 2 === 0,
                                    })}
                                >
                                    {columns.map((col) => (
                                        <td key={`${index}-${col.key}`} className="px-6 py-4">
                                            {formatValue(row[col.key], col.type)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination.enabled && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
                        <span className="font-semibold">{sortedData.length}</span> entries
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Simple pagination logic for display, just showing first 5 or logic could be better
                            // For now, let's just show current page window
                            let pageNum = currentPage - 2 + i;
                            if (currentPage <= 3) pageNum = i + 1;
                            if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;

                            if (pageNum > 0 && pageNum <= totalPages) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={classNames('px-3 py-1 rounded-md text-sm', {
                                            'bg-blue-600 text-white': currentPage === pageNum,
                                            'text-gray-700 hover:bg-gray-100': currentPage !== pageNum,
                                        })}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
