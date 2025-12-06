/**
 * ActionBar - v9.3.0 uniAI Component & Action System
 *
 * Renders action buttons for tool results.
 * Supports:
 * - Item actions (per-record actions)
 * - Bulk actions (multi-select actions)
 * - Action types: instant, form, confirm, chat
 * - Button variants: primary, secondary, success, danger, warning, outline
 */

import React, { useState } from 'react'
import InlineForm from './InlineForm'

/**
 * Icon component - renders icon based on name
 */
function ActionIcon({ name, className = '' }) {
  // Map common icon names to simple SVG or text
  const icons = {
    'cart': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'eye': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    'trash': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    'edit': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    'chat': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    'download': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    'compare': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    'list': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    'arrow-right': (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    ),
  }

  return icons[name] || <span className={className}>{name}</span>
}

/**
 * Action Button Component
 */
function ActionButton({
  action,
  item,
  onClick,
  disabled = false,
  size = 'md',
}) {
  // Variant styles
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const baseClasses = 'inline-flex items-center rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClass = variantClasses[action.variant] || variantClasses.primary
  const sizeClass = sizeClasses[size]

  return (
    <button
      onClick={() => onClick?.(action, item)}
      disabled={disabled}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${action.css_class || ''}`}
      title={action.label}
    >
      {action.icon && (
        <ActionIcon name={action.icon} className="mr-1.5" />
      )}
      {action.label}
    </button>
  )
}

/**
 * Confirmation Dialog
 */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Main ActionBar Component
 */
function ActionBar({
  actions = [],
  item = null,          // For item actions
  items = [],           // For bulk actions
  selectedItems = [],   // Selected item IDs for bulk
  onAction,
  onSendMessage,        // For chat-type actions
  isBulk = false,
  className = '',
}) {
  const [showForm, setShowForm] = useState(null)  // Action with form
  const [showConfirm, setShowConfirm] = useState(null)  // Action needing confirm
  const [loading, setLoading] = useState(false)

  // Handle action click
  const handleActionClick = async (action, targetItem) => {
    switch (action.type) {
      case 'form':
        // Show inline form
        setShowForm({ action, item: targetItem })
        break

      case 'confirm':
        // Show confirmation dialog
        setShowConfirm({ action, item: targetItem })
        break

      case 'chat':
        // Send message to chat
        let message = action.message_template || ''
        if (targetItem) {
          message = message.replace(/\{\{item\.(\w+)\}\}/g, (_, field) => targetItem[field] || '')
        }
        onSendMessage?.(message)
        break

      case 'instant':
      default:
        // Execute immediately
        await executeAction(action, targetItem)
        break
    }
  }

  // Execute action (call tool)
  const executeAction = async (action, targetItem) => {
    setLoading(true)
    try {
      // Build params from template
      let params = {}
      if (action.params && targetItem) {
        params = JSON.parse(
          JSON.stringify(action.params).replace(
            /\{\{item\.(\w+)\}\}/g,
            (_, field) => targetItem[field] || ''
          )
        )
      }

      await onAction?.(action, targetItem, params)
    } catch (error) {
      console.error('Action execution failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle form submit
  // v9.4.1: Support ai_message submit mode (send to AI queue instead of direct tool call)
  const handleFormSubmit = async (formData) => {
    if (!showForm) return

    const { action, item: targetItem } = showForm
    const form = action.form || {}

    // v9.4.1: Check submit_mode
    if (form.submit_mode === 'ai_message' && form.submit_message_template) {
      // Build AI message from template
      let message = form.submit_message_template

      // Replace {{field_name}} with form field values
      Object.entries(formData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        message = message.replace(regex, value || '')
      })

      // Replace {{item.field}} with item values
      if (targetItem) {
        message = message.replace(
          /\{\{item\.(\w+)\}\}/g,
          (_, field) => targetItem[field] || ''
        )
      }

      // Send message to AI queue
      onSendMessage?.(message)
      setShowForm(null)
    } else {
      // Default: call tool directly
      await onAction?.(action, targetItem, formData)
      setShowForm(null)
    }
  }

  // Handle confirm
  const handleConfirm = async () => {
    if (!showConfirm) return

    const { action, item: targetItem } = showConfirm
    await executeAction(action, targetItem)
    setShowConfirm(null)
  }

  // Filter available actions for bulk
  const availableActions = isBulk
    ? actions.filter(a => a.available !== false)
    : actions

  if (availableActions.length === 0) return null

  return (
    <>
      <div className={`genui-action-bar flex flex-wrap gap-2 ${className}`}>
        {isBulk && selectedItems.length > 0 && (
          <span className="inline-flex items-center text-sm text-gray-600 mr-2">
            {selectedItems.length} selected
          </span>
        )}

        {availableActions.map((action, idx) => (
          <ActionButton
            key={action.id || idx}
            action={action}
            item={isBulk ? null : item}
            onClick={handleActionClick}
            disabled={loading || (isBulk && action.available === false)}
          />
        ))}

        {/* Show reason for unavailable bulk actions */}
        {isBulk && actions.filter(a => a.available === false).map((action, idx) => (
          <span key={`unavail-${idx}`} className="text-xs text-gray-400" title={action.reason}>
            {action.label} ({action.reason})
          </span>
        ))}
      </div>

      {/* Inline Form Modal */}
      {showForm && showForm.action.form && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <InlineForm
              config={showForm.action.form}
              item={showForm.item}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(null)}
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <ConfirmDialog
          message={showConfirm.action.confirm_message || 'Are you sure you want to perform this action?'}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  )
}

export default ActionBar
