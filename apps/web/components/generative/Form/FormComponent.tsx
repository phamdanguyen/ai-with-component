/**
 * FormComponent
 *
 * Dynamic form generator with client-side validation
 * Supports text, email, password, number, date, select, radio, checkbox, textarea
 * Type-safe props from core types
 */

'use client';

import React, { useState } from 'react';
import type { FormProps, FormField } from '@/lib/types';

interface FieldError {
  [key: string]: string;
}

export function FormComponent({
  title,
  fields,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  layout = 'vertical',
  onSubmit,
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.defaultValue || '',
      }),
      {}
    )
  );
  const [errors, setErrors] = useState<FieldError>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate field value
  const validateField = (field: FormField, value: any): string | null => {
    // Required check
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (!value) return null;

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Pattern validation
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return `Invalid format for ${field.label}`;
      }
    }

    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `${field.label} must be at most ${field.validation.maxLength} characters`;
    }

    return null;
  };

  // Handle field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FieldError = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      if (onSubmit?.action) {
        // If endpoint provided, make API call
        if (onSubmit.endpoint) {
          const response = await fetch(onSubmit.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error('Form submission failed');
          }
        }
      }

      // Reset form
      setTimeout(() => {
        setSubmitted(false);
        setFormData(
          fields.reduce(
            (acc, field) => ({
              ...acc,
              [field.name]: '',
            }),
            {}
          )
        );
      }, 2000);
    } catch (err) {
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(
      fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.defaultValue || '',
        }),
        {}
      )
    );
    setErrors({});
    setSubmitted(false);
  };

  // Get grid layout class
  const gridClass = layout === 'horizontal' ? 'grid grid-cols-2 gap-4' : 'space-y-4';

  // Render form field
  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];
    const fieldId = `field-${field.name}`;

    return (
      <div key={field.name}>
        {field.type !== 'checkbox' && field.type !== 'radio' && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Field */}
        {field.type === 'select' && (
          <select
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Textarea Field */}
        {field.type === 'textarea' && (
          <textarea
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors ${
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        )}

        {/* Radio Fields */}
        {field.type === 'radio' && (
          <div className="flex gap-4">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={formData[field.name] === opt.value}
                  onChange={handleChange}
                  required={field.required}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox Field */}
        {field.type === 'checkbox' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        )}

        {/* Other Input Fields */}
        {![
          'select',
          'textarea',
          'radio',
          'checkbox',
        ].includes(field.type) && (
          <input
            type={field.type}
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        )}

        {/* Error Message */}
        {hasError && <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>}
      </div>
    );
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-6 text-gray-900">{title}</h3>}

      <form onSubmit={handleSubmit} className={gridClass}>
        {fields.map((field) => renderField(field))}

        {/* Form-level error */}
        {errors.submit && (
          <div className="col-span-full p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Submit Success Message */}
        {submitted && !errors.submit && (
          <div className="col-span-full p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">✓ Form submitted successfully</p>
          </div>
        )}

        {/* Buttons */}
        <div className={`col-span-full flex gap-3 mt-6 ${layout === 'horizontal' ? 'justify-end' : ''}`}>
          {cancelLabel && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
