'use client';

import React from 'react';
import { CardProps } from '../../../types/generative';
import classNames from 'classnames';
import * as Icons from 'lucide-react';

export const Card: React.FC<CardProps> = ({
    title,
    content,
    footer,
    variant = 'default',
    icon,
    image,
    actions,
    clickable = false,
}) => {
    // Dynamic icon component
    const IconComponent = icon && (Icons as any)[icon
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')];

    const variantStyles = {
        default: 'bg-white border-gray-200',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const containerClasses = classNames(
        'rounded-lg border shadow-sm overflow-hidden transition-all duration-200',
        variantStyles[variant],
        {
            'hover:shadow-md cursor-pointer transform hover:-translate-y-1': clickable,
        }
    );

    return (
        <div className={containerClasses}>
            {image && (
                <div className="w-full h-48 bg-gray-100 relative">
                    {/* In a real app, use next/image */}
                    <img src={image} alt={title || 'Card image'} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent size={20} className="opacity-80" />}
                        {title && <h3 className="font-semibold text-lg">{title}</h3>}
                    </div>
                </div>

                <p className={classNames('text-sm opacity-90 leading-relaxed', { 'text-gray-600': variant === 'default' })}>
                    {content}
                </p>

                {actions && actions.length > 0 && (
                    <div className="mt-4 flex gap-2">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                className={classNames('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', {
                                    'bg-slate-800 text-white hover:bg-slate-700': variant === 'default',
                                    'bg-white bg-opacity-50 hover:bg-opacity-80 border border-current': variant !== 'default'
                                })}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Action clicked:', action.label, action.onClick);
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {footer && (
                <div className={classNames('px-5 py-3 border-t text-xs font-medium opacity-70', {
                    'border-gray-100': variant === 'default',
                    'border-black/5': variant !== 'default'
                })}>
                    {footer}
                </div>
            )}
        </div>
    );
};
