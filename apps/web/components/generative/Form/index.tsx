'use client';

import React from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { FormProps, FormField } from '../../../types/generative';
import classNames from 'classnames';

export const Form: React.FC<FormProps> = ({
    title,
    fields,
    submitLabel = 'Submit',
    cancelLabel,
    layout = 'vertical',
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FieldValues>();

    const onFormSubmit: SubmitHandler<FieldValues> = async (data) => {
        console.log('Form data:', data);

        // If an action is defined, we might want to call it
        if (onSubmit) {
            // In a real app, this would likely trigger a server action or API call
            // For now, we simulate a delay and log the action
            console.log(`Submitting to ${onSubmit.endpoint || 'default endpoint'} with action ${onSubmit.action}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const renderField = (field: FormField) => {
        const isError = !!errors[field.name];
        const errorMessage = errors[field.name]?.message as string;

        const commonClasses = classNames(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
            {
                'border-red-300 focus:ring-red-500': isError,
                'border-gray-300': !isError,
            }
        );

        const validationRules = {
            required: field.required ? `${field.label} is required` : false,
            minLength: field.validation?.minLength ? {
                value: field.validation.minLength,
                message: `Minimum length is ${field.validation.minLength}`
            } : undefined,
            maxLength: field.validation?.maxLength ? {
                value: field.validation.maxLength,
                message: `Maximum length is ${field.validation.maxLength}`
            } : undefined,
            pattern: field.validation?.pattern ? {
                value: new RegExp(field.validation.pattern),
                message: 'Invalid format'
            } : undefined,
        };

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        {...register(field.name, validationRules)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        className={commonClasses}
                    />
                );

            case 'select':
                return (
                    <select
                        {...register(field.name, validationRules)}
                        className={commonClasses}
                        defaultValue=""
                    >
                        <option value="" disabled>Select an option</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={field.name}
                            {...register(field.name, validationRules)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                    </div>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((opt) => (
                            <div key={opt.value} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`${field.name}-${opt.value}`}
                                    value={opt.value}
                                    {...register(field.name, validationRules)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor={`${field.name}-${opt.value}`} className="ml-2 block text-sm text-gray-700">
                                    {opt.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            default:
                // text, email, password, number, date
                return (
                    <input
                        type={field.type}
                        {...register(field.name, validationRules)}
                        placeholder={field.placeholder}
                        className={commonClasses}
                    />
                );
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-full max-w-lg mx-auto">
            {title && <h3 className="text-xl font-semibold mb-6 text-gray-800">{title}</h3>}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                {fields.map((field) => (
                    <div key={field.name} className={classNames('flex flex-col', { 'items-start': field.type === 'checkbox' })}>
                        {/* Label for non-checkbox/radio inputs */}
                        {field.type !== 'checkbox' && (
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                        )}

                        {renderField(field)}

                        {errors[field.name] && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors[field.name]?.message as string}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Processing...' : submitLabel}
                    </button>

                    {cancelLabel && (
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
