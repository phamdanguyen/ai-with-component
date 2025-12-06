/**
 * ComponentRouter - v9.3.0 uniAI Component & Action System
 *
 * Routes tool responses to appropriate display components based on
 * render configuration from backend. Supports:
 * - Auto component selection (based on result count)
 * - Fixed component selection
 * - Field priority rendering (primary, secondary, image, hidden)
 * - Action integration (item & bulk actions)
 */

import CardComponent from './CardComponent'
import ListComponent from './ListComponent'
import TableComponent from './TableComponent'
import RichCardComponent from './RichCardComponent'
import ActionBar from './ActionBar'
import QRPaymentComponent from './QRPaymentComponent'
import GalleryComponent from './GalleryComponent'

/**
 * Empty state component
 */
function EmptyState({ message, suggestions }) {
  return (
    <div className="genui-empty-state text-center py-8">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-500">{message || 'No results found'}</p>
      {suggestions && (
        <div className="mt-4">
          {/* Suggestion chips can be rendered here */}
        </div>
      )}
    </div>
  )
}

/**
 * Detail Card - Single item detailed view
 */
function DetailCard({ item, fields, actions, onAction }) {
  const primaryFields = fields?.primary || []
  const secondaryFields = fields?.secondary || []
  const imageField = fields?.image

  // Extract field value from item
  const getFieldValue = (fieldConfig, item) => {
    const value = item[fieldConfig.field]
    if (value === undefined || value === null) return null

    // Format based on type
    if (fieldConfig.type === 'currency' && fieldConfig.format) {
      return fieldConfig.format.replace('{value}', value.toLocaleString())
    }
    if (fieldConfig.type === 'date') {
      return new Date(value).toLocaleDateString()
    }
    return value
  }

  return (
    <div className="genui-detail-card bg-white rounded-xl shadow-lg p-6">
      {imageField && item[imageField.field] && (
        <div className="mb-6">
          <img
            src={item[imageField.field]}
            alt={item.name || 'Item'}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Primary fields - prominently displayed */}
      <div className="space-y-4 mb-6">
        {primaryFields.map((field, idx) => {
          const value = getFieldValue(field, item)
          if (value === null) return null

          return (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                {field.icon && <i className={`${field.icon} mr-2`}></i>}
                {field.label}
              </span>
              <span className={`font-semibold ${field.css_class || ''}`}>
                {value}
              </span>
            </div>
          )
        })}
      </div>

      {/* Secondary fields - smaller display */}
      {secondaryFields.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          {secondaryFields.map((field, idx) => {
            const value = getFieldValue(field, item)
            if (value === null) return null

            return (
              <div key={idx} className="flex items-center text-sm text-gray-500">
                {field.icon && <i className={`${field.icon} mr-2`}></i>}
                <span>{field.label}: </span>
                <span className="ml-1">{value}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Actions */}
      {actions && actions.item_actions?.length > 0 && (
        <ActionBar
          actions={actions.item_actions}
          item={item}
          onAction={onAction}
          className="mt-6"
        />
      )}
    </div>
  )
}

/**
 * Card Grid - 2-4 items in grid layout
 */
function CardGrid({ items, fields, actions, onAction }) {
  const gridCols = items.length <= 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'

  return (
    <div className={`genui-card-grid genui-card grid ${gridCols} gap-4`} data-component="card">
      {items.map((item, idx) => (
        <ItemCard
          key={item.id || idx}
          item={item}
          fields={fields}
          actions={actions?.item_actions}
          onAction={onAction}
        />
      ))}
    </div>
  )
}

/**
 * Card List - 5-10 items in vertical list
 */
function CardList({ items, fields, actions, onAction, selectedItems, onSelect }) {
  return (
    <div className="genui-card-list space-y-3">
      {items.map((item, idx) => (
        <ItemCard
          key={item.id || idx}
          item={item}
          fields={fields}
          actions={actions?.item_actions}
          onAction={onAction}
          selectable={actions?.bulk_actions?.length > 0}
          selected={selectedItems?.includes(item.id)}
          onSelect={() => onSelect?.(item.id)}
          layout="horizontal"
        />
      ))}

      {/* Bulk actions bar */}
      {selectedItems?.length > 0 && actions?.bulk_actions?.length > 0 && (
        <ActionBar
          actions={actions.bulk_actions}
          selectedItems={selectedItems}
          items={items}
          onAction={onAction}
          isBulk={true}
          className="sticky bottom-0 bg-white shadow-lg p-4 rounded-lg"
        />
      )}
    </div>
  )
}

/**
 * Item Card - Individual item card component
 */
function ItemCard({ item, fields, actions, onAction, selectable, selected, onSelect, layout = 'vertical' }) {
  const primaryFields = fields?.primary || []
  const imageField = fields?.image

  const isHorizontal = layout === 'horizontal'

  const getFieldValue = (fieldConfig, item) => {
    const value = item[fieldConfig.field]
    if (value === undefined || value === null) return null

    if (fieldConfig.type === 'currency' && fieldConfig.format) {
      return fieldConfig.format.replace('{value}', value.toLocaleString())
    }
    return value
  }

  return (
    <div
      className={`genui-item-card bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow
        ${isHorizontal ? 'flex items-center' : ''}
        ${selected ? 'ring-2 ring-blue-500' : ''}
        ${selectable ? 'cursor-pointer' : ''}`}
      onClick={selectable ? onSelect : undefined}
    >
      {selectable && (
        <div className="mr-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => {}}
            className="w-5 h-5 rounded border-gray-300"
          />
        </div>
      )}

      {imageField && item[imageField.field] && (
        <div className={isHorizontal ? 'w-20 h-20 mr-4 flex-shrink-0' : 'mb-3'}>
          <img
            src={item[imageField.field]}
            alt={item.name || 'Item'}
            className={`object-cover rounded ${isHorizontal ? 'w-full h-full' : 'w-full h-32'}`}
          />
        </div>
      )}

      <div className={`flex-1 ${isHorizontal ? '' : ''}`}>
        {primaryFields.slice(0, 3).map((field, idx) => {
          const value = getFieldValue(field, item)
          if (value === null) return null

          return (
            <div key={idx} className={idx === 0 ? 'font-semibold' : 'text-sm text-gray-600'}>
              {field.icon && <i className={`${field.icon} mr-1`}></i>}
              {value}
            </div>
          )
        })}
      </div>

      {actions && actions.length > 0 && !selectable && (
        <div className={`${isHorizontal ? 'ml-4' : 'mt-3 pt-3 border-t'} flex space-x-2`}>
          {actions.slice(0, 2).map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                onAction?.(action, item)
              }}
              className={`px-3 py-1 text-sm rounded ${
                action.variant === 'primary' ? 'bg-blue-500 text-white' :
                action.variant === 'danger' ? 'bg-red-500 text-white' :
                'bg-gray-100 text-gray-700'
              }`}
            >
              {action.icon && <i className={`${action.icon} mr-1`}></i>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Data Table - 11+ items in table format
 */
function DataTable({ items, fields, actions, onAction, selectedItems, onSelect, onSelectAll }) {
  const primaryFields = fields?.primary || []
  const secondaryFields = fields?.secondary || []
  const allFields = [...primaryFields, ...secondaryFields].slice(0, 6)

  const allSelected = selectedItems?.length === items.length

  return (
    <div className="genui-data-table genui-table overflow-x-auto" data-component="table">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {actions?.bulk_actions?.length > 0 && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onSelectAll?.(!allSelected)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </th>
            )}
            {allFields.map((field, idx) => (
              <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {field.icon && <i className={`${field.icon} mr-1`}></i>}
                {field.label}
              </th>
            ))}
            {actions?.item_actions?.length > 0 && (
              <th className="px-4 py-3 text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, idx) => (
            <tr key={item.id || idx} className={selectedItems?.includes(item.id) ? 'bg-blue-50' : ''}>
              {actions?.bulk_actions?.length > 0 && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems?.includes(item.id)}
                    onChange={() => onSelect?.(item.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
              )}
              {allFields.map((field, fieldIdx) => (
                <td key={fieldIdx} className="px-4 py-3 whitespace-nowrap">
                  {item[field.field]}
                </td>
              ))}
              {actions?.item_actions?.length > 0 && (
                <td className="px-4 py-3 text-right space-x-1">
                  {actions.item_actions.slice(0, 2).map((action, actionIdx) => (
                    <button
                      key={actionIdx}
                      onClick={() => onAction?.(action, item)}
                      className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                      title={action.label}
                    >
                      {action.icon && <i className={action.icon}></i>}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bulk actions bar */}
      {selectedItems?.length > 0 && actions?.bulk_actions?.length > 0 && (
        <ActionBar
          actions={actions.bulk_actions}
          selectedItems={selectedItems}
          items={items}
          onAction={onAction}
          isBulk={true}
          className="mt-4 p-4 bg-blue-50 rounded-lg"
        />
      )}
    </div>
  )
}

/**
 * Main ComponentRouter
 *
 * Routes to appropriate component based on render config
 */
function ComponentRouter({
  response,  // Complete tool response from backend
  onAction,  // Action handler callback
  onSendMessage,  // For chat-type actions
}) {
  // Extract from response
  const { data, render, actions, suggestions } = response || {}

  // State for selection
  const [selectedItems, setSelectedItems] = React.useState([])

  // Handle item selection
  const handleSelect = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = (selectAll) => {
    const items = Array.isArray(data) ? data : data?.items || []
    setSelectedItems(selectAll ? items.map(item => item.id) : [])
  }

  // Handle action execution
  const handleAction = async (action, item) => {
    if (action.type === 'chat') {
      // Send message to chat
      const message = action.message_template?.replace(/\{\{item\.(\w+)\}\}/g, (_, field) => item?.[field] || '')
      onSendMessage?.(message)
    } else if (action.type === 'confirm') {
      // Show confirmation dialog
      if (window.confirm(action.confirm_message || 'Are you sure?')) {
        onAction?.(action, item)
      }
    } else {
      // Instant or form action
      onAction?.(action, item)
    }
  }

  // No render config - return raw data display
  if (!render) {
    return (
      <div className="genui-raw-data">
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  // Get items array
  const items = Array.isArray(data) ? data : data?.items || (data ? [data] : [])
  const component = render.component
  const fields = render.fields

  // Render title
  const renderTitle = render.title && (
    <h3 className="text-lg font-semibold mb-4">{render.title}</h3>
  )

  // Route to appropriate component
  switch (component) {
    case 'empty':
      return (
        <div className="genui-component-router">
          {renderTitle}
          <EmptyState
            message={render.empty_message}
            suggestions={suggestions}
          />
        </div>
      )

    case 'detail_card':
      return (
        <div className="genui-component-router">
          {renderTitle}
          <DetailCard
            item={items[0]}
            fields={fields}
            actions={actions}
            onAction={handleAction}
          />
        </div>
      )

    case 'card_grid':
      return (
        <div className="genui-component-router">
          {renderTitle}
          <CardGrid
            items={items}
            fields={fields}
            actions={actions}
            onAction={handleAction}
          />
        </div>
      )

    case 'card_list':
      return (
        <div className="genui-component-router">
          {renderTitle}
          <CardList
            items={items}
            fields={fields}
            actions={actions}
            onAction={handleAction}
            selectedItems={selectedItems}
            onSelect={handleSelect}
          />
        </div>
      )

    case 'data_table':
      return (
        <div className="genui-component-router">
          {renderTitle}
          <DataTable
            items={items}
            fields={fields}
            actions={actions}
            onAction={handleAction}
            selectedItems={selectedItems}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        </div>
      )

    case 'chart':
      // Use existing ChartComponent
      return (
        <div className="genui-component-router">
          {renderTitle}
          <div className="genui-chart-placeholder p-8 text-center text-gray-500">
            Chart component - data visualization pending
          </div>
        </div>
      )

    case 'qr_payment':
      // QR Payment component for VietQR bank transfers
      return (
        <div className="genui-component-router">
          {renderTitle}
          <QRPaymentComponent
            data={items[0] || data}
            onAction={handleAction}
          />
        </div>
      )

    case 'gallery':
      // Gallery component for product exploration
      return (
        <div className="genui-component-router">
          {renderTitle}
          <GalleryComponent
            items={items}
            layout="grid"
            showPrice={true}
            showCTA={true}
            onItemClick={(item) => handleAction({ type: 'view' }, item)}
            onCTAClick={(item, cta) => handleAction(cta, item)}
            onSendMessage={onSendMessage}
          />
        </div>
      )

    default:
      // Fallback to card list
      return (
        <div className="genui-component-router">
          {renderTitle}
          <CardList
            items={items}
            fields={fields}
            actions={actions}
            onAction={handleAction}
            selectedItems={selectedItems}
            onSelect={handleSelect}
          />
        </div>
      )
  }
}

// Need React for useState
import React from 'react'

export default ComponentRouter
