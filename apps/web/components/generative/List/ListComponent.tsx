/**
 * ListComponent
 *
 * Display items in a list format with 3 variants (simple, card, interactive)
 * Type-safe props from core types
 */

'use client';

import React from 'react';
import type { ListItem, ListProps } from '@/lib/types';

export function ListComponent({
  items,
  title,
  ordered = false,
  variant = 'simple',
  selectable = false,
  searchable = false,
  maxHeight,
}: ListProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSelect = (item: ListItem) => {
    if (!item.disabled) {
      setSelectedId(item.id);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No items to display</p>
      </div>
    );
  }

  // Filter items based on search query
  const filteredItems = searchable
    ? items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const containerStyle = maxHeight ? { maxHeight: `${maxHeight}px`, overflowY: 'auto' as const } : {};

  // Card variant - display as cards
  if (variant === 'card') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

        {searchable && (
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <div className="space-y-3" style={containerStyle}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => selectable && handleSelect(item)}
              className={`p-4 border rounded-lg transition-all ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : selectable ? 'cursor-pointer' : ''
              } ${
                selectable && selectedId === item.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.icon && <span className="text-xl">{item.icon}</span>}
                {item.avatar && (
                  <img src={item.avatar} alt={item.title} className="w-10 h-10 rounded-full object-cover" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                    {item.badge && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.badgeColor === 'green'
                            ? 'bg-green-100 text-green-700'
                            : item.badgeColor === 'red'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Interactive variant - display with checkboxes/radios
  if (variant === 'interactive') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

        {searchable && (
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <div className="space-y-2 border border-gray-200 rounded-lg p-4" style={containerStyle}>
          {filteredItems.map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type={selectable ? 'checkbox' : 'radio'}
                name={selectable ? `list-${item.id}` : 'list-item'}
                checked={selectedId === item.id}
                onChange={() => handleSelect(item)}
                disabled={item.disabled}
                className="mt-1 cursor-pointer"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span className="font-medium text-gray-900">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">{item.badge}</span>
                  )}
                </div>
                {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Default simple variant - display as list
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}

      {searchable && (
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4" style={containerStyle}>
        <ListTag className={`space-y-2 ${ordered ? 'list-decimal' : 'list-disc'} pl-5`}>
          {filteredItems.map((item) => (
            <li
              key={item.id}
              onClick={() => selectable && handleSelect(item)}
              className={`text-gray-700 transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : selectable ? 'cursor-pointer' : ''
              }`}
            >
              <span className={selectable && selectedId === item.id ? 'font-semibold text-blue-600' : ''}>
                {item.title}
              </span>
              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
            </li>
          ))}
        </ListTag>
      </div>
    </div>
  );
}
