/**
 * CardComponent
 *
 * Simple card layout component
 * Displays title, content, and footer with variant styles
 * Type-safe props from core types
 */

'use client';

import type { CardProps } from '@/lib/types';

const variantStyles = {
  default: 'border-gray-200 bg-white',
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

const variantTextStyles = {
  default: 'text-gray-900',
  success: 'text-green-900',
  warning: 'text-yellow-900',
  error: 'text-red-900',
  info: 'text-blue-900',
};

export function CardComponent({
  title,
  content,
  footer,
  variant = 'default',
  icon,
  image,
  actions,
  clickable = false,
}: CardProps) {
  return (
    <div
      className={`p-4 border rounded-lg transition-shadow ${variantStyles[variant]} ${
        clickable ? 'cursor-pointer hover:shadow-lg' : ''
      }`}
    >
      {/* Image */}
      {image && (
        <img
          src={image}
          alt={title || 'card-image'}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}

      {/* Title */}
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className={`font-semibold ${variantTextStyles[variant]}`}>
            {title}
          </h3>
        </div>
      )}

      {/* Content */}
      {content && (
        <p className={`text-sm mb-3 ${variantTextStyles[variant]}`}>
          {content}
        </p>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex gap-2 mb-3">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                variant === 'error'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : variant === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : variant === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              onClick={() => action.onClick && console.log(action.onClick)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <p className="text-xs text-gray-500 border-t pt-2">
          {footer}
        </p>
      )}
    </div>
  );
}
