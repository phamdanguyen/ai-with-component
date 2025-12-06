import React, { useState, useEffect, useRef } from 'react'
import InteractionTracker from './shared/services/InteractionTracker'

/**
 * Form Component - Renders interactive form with validation
 *
 * Enhanced in v9.4.0 (Sprint 2):
 * - Rich interaction tracking via InteractionTracker
 * - Component context capture for AI
 * - User signals included in submit callback
 *
 * Props:
 * - fields: Array of field definitions {name, type, label, required, options}
 * - onSubmit: Submit handler receives (formData, structuredData)
 * - title: Optional form title
 * - formId: Unique form identifier for tracking
 * - triggerContext: Context from the component that triggered this form
 *   { componentType, productId, triggerAction, itemData }
 */
function FormComponent({ fields, onSubmit, title, formId = 'generic_form', triggerContext = {} }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const formOpenTime = useRef(Date.now())
  const fieldInteractionCount = useRef({})

  // Track form open on mount
  useEffect(() => {
    formOpenTime.current = Date.now()
    InteractionTracker.trackFormInteraction(formId, 'open', {
      fields_count: fields?.length || 0,
      trigger_context: triggerContext,
    })
  }, [formId])

  if (!fields || fields.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No fields available for form
      </div>
    )
  }

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    // Clear error when user types
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }))
    }

    // Track field interaction count
    fieldInteractionCount.current[fieldName] = (fieldInteractionCount.current[fieldName] || 0) + 1

    // Track significant field changes (first interaction or every 3rd change)
    if (fieldInteractionCount.current[fieldName] === 1 || fieldInteractionCount.current[fieldName] % 3 === 0) {
      InteractionTracker.trackFormInteraction(formId, 'field_change', {
        field_name: fieldName,
        interaction_count: fieldInteractionCount.current[fieldName],
        has_value: !!value,
        trigger_context: triggerContext,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    const newErrors = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Track validation failure
      InteractionTracker.trackFormInteraction(formId, 'validation_error', {
        error_fields: Object.keys(newErrors),
        trigger_context: triggerContext,
      })
      return
    }

    // Calculate form completion time
    const completionTimeSeconds = Math.round((Date.now() - formOpenTime.current) / 1000)

    // Track form submit
    InteractionTracker.trackFormInteraction(formId, 'submit', {
      fields_filled: Object.keys(formData).length,
      total_fields: fields.length,
      completion_time_seconds: completionTimeSeconds,
      field_interaction_counts: { ...fieldInteractionCount.current },
      trigger_context: triggerContext,
    })

    // Build component context for structured data
    const componentContext = {
      componentType: 'form',
      triggerComponent: triggerContext.componentType || 'unknown',
      triggerAction: triggerContext.triggerAction || 'form_submit',
      productId: triggerContext.productId || formData.product_id || null,
    }

    // Build enriched structured data
    const structuredData = InteractionTracker.buildStructuredData(
      'form_submit',
      {
        form_id: formId,
        form_data: formData,
        completion_time_seconds: completionTimeSeconds,
        fields_count: fields.length,
      },
      componentContext
    )

    // Call submit handler with both formData and structuredData
    if (onSubmit) {
      onSubmit(formData, structuredData)
    } else {
      alert('Form submitted:\n' + JSON.stringify(formData, null, 2))
    }
  }

  const renderField = (field) => {
    const { name, type, label, required, options, placeholder } = field

    switch (type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
        return (
          <input
            type={type}
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            placeholder={placeholder || label}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors[name]
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            placeholder={placeholder || label}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors[name]
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        )

      case 'select':
        return (
          <select
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors[name]
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            <option value="">Select {label}</option>
            {options &&
              options.map((option, idx) => (
                <option key={idx} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
          </select>
        )

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[name] || false}
              onChange={(e) => handleChange(name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        )

      default:
        return (
          <div className="text-gray-500 text-sm italic">
            Field type "{type}" not supported
          </div>
        )
    }
  }

  return (
    <div className="mt-4 p-4 bg-white border border-gray-300 rounded-lg">
      {title && (
        <div className="text-lg font-semibold text-gray-800 mb-4">{title}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="space-y-1">
            {field.type !== 'checkbox' && (
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {renderField(field)}

            {errors[field.name] && (
              <p className="text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default FormComponent
