'use client';

import React, { useState } from 'react';
import { ListProps, ListItem } from '../../../types/generative';
import classNames from 'classnames';
import * as Icons from 'lucide-react';
import { Search, CheckCircle2 } from 'lucide-react';

export const List: React.FC<ListProps> = ({
    items,
    title,
    ordered = false,
    variant = 'simple',
    selectable = false,
    searchable = false,
    maxHeight,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(
        new Set(items.filter(i => i.selected).map(i => i.id))
    );

    const filteredItems = items.filter(item => {
        if (!searchTerm) return true;
        return (
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const toggleSelection = (id: string, disabled?: boolean) => {
        if (disabled || !selectable) return;

        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const renderIcon = (iconName?: string) => {
        if (!iconName) return null;
        const IconComponent = (Icons as any)[iconName
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('')];

        return IconComponent ? <IconComponent size={18} /> : null;
    };

    const renderListItem = (item: ListItem, index: number) => {
        const isSelected = selectedItems.has(item.id);

        const itemClasses = classNames(
            'flex items-center gap-3 p-3 rounded-lg transition-all',
            {
                'hover:bg-gray-50 cursor-pointer': selectable || variant === 'interactive',
                'bg-blue-50 border-blue-200': isSelected,
                'opacity-50 cursor-not-allowed': item.disabled,
                'border border-gray-100 mb-2': variant === 'card',
                'border-b border-gray-50 last:border-0': variant === 'simple' || variant === 'interactive',
            }
        );

        return (
            <li
                key={item.id}
                className={itemClasses}
                onClick={() => toggleSelection(item.id, item.disabled)}
            >
                {/* Selection Checkbox/Indicator */}
                {selectable && (
                    <div className={classNames('flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors', {
                        'bg-blue-600 border-blue-600 text-white': isSelected,
                        'border-gray-300': !isSelected
                    })}>
                        {isSelected && <CheckCircle2 size={14} />}
                    </div>
                )}

                {/* Index for ordered list */}
                {ordered && !item.avatar && !item.icon && (
                    <span className="text-gray-400 font-mono text-sm w-6 text-center">{index + 1}.</span>
                )}

                {/* Avatar or Icon */}
                {(item.avatar || item.icon) && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden text-gray-500">
                        {item.avatar ? (
                            <img src={item.avatar} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            renderIcon(item.icon)
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className={classNames('font-medium text-gray-900 truncate', { 'text-blue-800': isSelected })}>
                            {item.title}
                        </h4>
                        {item.badge && (
                            <span className={classNames('px-2 py-0.5 text-xs rounded-full font-medium', {
                                'bg-blue-100 text-blue-800': !item.badgeColor || item.badgeColor === 'primary',
                                'bg-green-100 text-green-800': item.badgeColor === 'success',
                                'bg-yellow-100 text-yellow-800': item.badgeColor === 'warning',
                                'bg-red-100 text-red-800': item.badgeColor === 'danger',
                                'bg-gray-100 text-gray-800': item.badgeColor === 'neutral',
                            })}>
                                {item.badge}
                            </span>
                        )}
                    </div>
                    {item.description && (
                        <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    )}
                </div>
            </li>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                {title && <h3 className="font-semibold text-gray-800">{title}</h3>}
                {searchable && (
                    <div className="relative">
                        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all"
                        />
                    </div>
                )}
            </div>

            {/* List Body */}
            <div className="custom-scrollbar" style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined, overflowY: maxHeight ? 'auto' : 'visible' }}>
                {filteredItems.length > 0 ? (
                    <ul className={classNames('space-y-0.5', { 'list-decimal list-inside': ordered && variant === 'simple' && !items.some(i => i.avatar || i.icon) })}>
                        {filteredItems.map(renderListItem)}
                    </ul>
                ) : (
                    <div className="py-8 text-center text-gray-500 text-sm">
                        No items found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {selectable && selectedItems.size > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-blue-600 font-medium flex justify-between">
                    <span>{selectedItems.size} items selected</span>
                    <button
                        className="hover:underline"
                        onClick={() => setSelectedItems(new Set())}
                    >
                        Clear selection
                    </button>
                </div>
            )}
        </div>
    );
};
