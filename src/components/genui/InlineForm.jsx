/**
 * InlineForm - v9.3.0 uniAI Component & Action System
 *
 * Renders inline forms within the chat interface.
 * Supports various field types and validation rules.
 *
 * Field types: text, textarea, number, email, tel, date, datetime, select, radio, checkbox, hidden
 */

import React, { useState, useEffect } from 'react'

/**
 * Form Field Component
 */
function FormField({ field, value, onChange, error }) {
  const {
    name,
    label,
    type,
    placeholder,
    help_text,
    required,
    options = [],
    validation = {},
  } = field

  const baseInputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error ? 'border-red-500' : 'border-gray-300'}`

  switch (type) {
    case 'textarea':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            rows={4}
            className={baseInputClass}
            required={required}
            minLength={validation.minLength}
            maxLength={validation.maxLength}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'number':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            required={required}
            min={validation.min}
            max={validation.max}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'email':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            required={required}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'tel':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            required={required}
            pattern={validation.pattern}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'date':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            className={baseInputClass}
            required={required}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'datetime':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="datetime-local"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            className={baseInputClass}
            required={required}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'select':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            className={baseInputClass}
            required={required}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'radio':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(name, e.target.value)}
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                  required={required}
                />
                <span className="ml-2 text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'checkbox':
      return (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={(e) => onChange(name, e.target.checked)}
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </span>
          </label>
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'hidden':
      return (
        <input type="hidden" name={name} value={value || ''} />
      )

    case 'text':
    default:
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name={name}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={baseInputClass}
            required={required}
            minLength={validation.minLength}
            maxLength={validation.maxLength}
            pattern={validation.pattern}
          />
          {help_text && <p className="mt-1 text-xs text-gray-500">{help_text}</p>}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )
  }
}

/**
 * Main InlineForm Component
 */
function InlineForm({ config, item, onSubmit, onCancel }) {
  const {
    title,
    description,
    fields = [],
    submit_label = 'Submit',
    cancel_label = 'Cancel',
    show_cancel = true,
    success_message,
  } = config

  // Initialize form data with default values
  const initFormData = () => {
    const data = {}
    fields.forEach(field => {
      let defaultValue = field.default_value || ''

      // Replace {{item.field}} placeholders with actual values
      if (defaultValue && item) {
        defaultValue = defaultValue.replace(
          /\{\{item\.(\w+)\}\}/g,
          (_, fieldName) => item[fieldName] || ''
        )
      }

      data[field.name] = defaultValue
    })
    return data
  }

  const [formData, setFormData] = useState(initFormData)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Update form data on item change
  useEffect(() => {
    setFormData(initFormData())
  }, [item])

  // Handle field change
  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    fields.forEach(field => {
      const value = formData[field.name]
      const validation = field.validation || {}

      // Required check
      if (field.required && !value && value !== 0 && value !== false) {
        newErrors[field.name] = `${field.label} is required`
        return
      }

      // Skip further validation if empty and not required
      if (!value && value !== 0) return

      // Min/Max length
      if (validation.minLength && String(value).length < validation.minLength) {
        newErrors[field.name] = `Minimum ${validation.minLength} characters required`
      }
      if (validation.maxLength && String(value).length > validation.maxLength) {
        newErrors[field.name] = `Maximum ${validation.maxLength} characters allowed`
      }

      // Min/Max value (for numbers)
      if (field.type === 'number') {
        const numValue = Number(value)
        if (validation.min !== undefined && numValue < validation.min) {
          newErrors[field.name] = `Minimum value is ${validation.min}`
        }
        if (validation.max !== undefined && numValue > validation.max) {
          newErrors[field.name] = `Maximum value is ${validation.max}`
        }
      }

      // Pattern validation
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(String(value))) {
          newErrors[field.name] = `Invalid format`
        }
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Invalid email address'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    try {
      await onSubmit?.(formData)
      setSubmitted(true)
    } catch (error) {
      console.error('Form submission failed:', error)
      setErrors({ _form: 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Show success message
  if (submitted && success_message) {
    return (
      <div className="genui-inline-form p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-green-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600">{success_message}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="genui-inline-form">
      {/* Header */}
      {title && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* Form error */}
        {errors._form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {errors._form}
          </div>
        )}

        {/* Fields */}
        {fields.map((field, idx) => (
          <FormField
            key={field.name || idx}
            field={field}
            value={formData[field.name]}
            onChange={handleFieldChange}
            error={errors[field.name]}
          />
        ))}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
          {show_cancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              disabled={submitting}
            >
              {cancel_label}
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : submit_label}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InlineForm
