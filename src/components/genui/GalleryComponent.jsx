/**
 * GalleryComponent - Product Gallery for GenUI v9.4.1
 *
 * Renders a grid/list of product cards with images, prices, and CTAs.
 * Used primarily for product exploration (intent: explore).
 *
 * v9.4.1: Added support for form-type CTAs (action_type: 'form')
 *         When CTA has form config, shows InlineForm instead of direct action
 *
 * @version 1.1.0
 * @since 9.2.0
 */

import { useState } from 'react'
import InlineForm from './InlineForm'

function GalleryComponent({
  title,
  items = [],
  layout = 'grid',
  columns = 2,
  showPrice = true,
  showCTA = true,
  onItemClick,
  onCTAClick,
  onSendMessage  // v9.4.1: For form-type CTAs with ai_message submit mode
}) {
  // v9.4.1: State for active form modal
  const [activeForm, setActiveForm] = useState(null)
  // Format price with currency
  const formatPrice = (price) => {
    if (!price) return null
    const value = price.current || price
    const currency = price.currency || 'VND'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  // Handle item click
  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }

  // Handle CTA button click
  // v9.4.1: Support form-type CTAs
  const handleCTAClick = (item, cta, e) => {
    e.stopPropagation()

    // v9.4.1: Check if CTA has form config (action_type: 'form')
    if (cta.action_type === 'form' && cta.form) {
      // Show form modal
      setActiveForm({ cta, item })
      return
    }

    if (onCTAClick) {
      onCTAClick(item, cta)
    } else {
      // Default behavior: log action
      console.log('[Gallery] CTA clicked:', cta.action, cta.actionData)
    }
  }

  // v9.4.1: Handle form submission
  const handleFormSubmit = (formData) => {
    if (!activeForm) return

    const { cta, item } = activeForm
    const form = cta.form || {}

    // Check submit_mode
    if (form.submit_mode === 'ai_message' && form.submit_message_template) {
      // Build AI message from template
      let message = form.submit_message_template

      // Replace {{field_name}} with form field values
      Object.entries(formData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        message = message.replace(regex, value || '')
      })

      // Replace {{item.field}} with item values
      if (item) {
        message = message.replace(
          /\{\{item\.(\w+)\}\}/g,
          (_, field) => item[field] || ''
        )
      }

      // Send message to AI queue
      if (onSendMessage) {
        onSendMessage(message)
      } else {
        console.log('[Gallery] Form submitted (ai_message mode):', message)
      }
    } else {
      // Legacy: just pass to onCTAClick with form data
      if (onCTAClick) {
        onCTAClick(item, { ...cta, formData })
      }
    }

    // Close form modal
    setActiveForm(null)
  }

  if (!items || items.length === 0) {
    return (
      <div className="gallery-empty p-4 text-center text-gray-500">
        <i className="fa fa-shopping-bag text-4xl mb-2"></i>
        <p>Không có sản phẩm nào</p>
      </div>
    )
  }

  return (
    <div className="gallery-component genui-gallery" data-component="gallery">
      {/* Title */}
      {title && (
        <h3 className="gallery-title text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h3>
      )}

      {/* Grid/List Layout */}
      <div
        className={`
          gallery-grid
          ${layout === 'grid'
            ? `grid gap-4 ${columns === 3 ? 'grid-cols-3' : columns === 1 ? 'grid-cols-1' : 'grid-cols-2'}`
            : 'flex flex-col gap-3'
          }
        `}
      >
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className={`
              gallery-item
              bg-white rounded-lg border border-gray-200 overflow-hidden
              hover:shadow-md hover:border-primary-300
              transition-all duration-200 cursor-pointer
              ${layout === 'list' ? 'flex' : ''}
            `}
            onClick={() => handleItemClick(item)}
          >
            {/* Image */}
            {item.image && (
              <div
                className={`
                  gallery-item-image
                  bg-gray-100 flex items-center justify-center
                  ${layout === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'}
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="hidden items-center justify-center w-full h-full text-gray-400">
                  <i className="fa fa-image text-3xl"></i>
                </div>
              </div>
            )}

            {/* Content */}
            <div className={`gallery-item-content p-3 ${layout === 'list' ? 'flex-1' : ''}`}>
              {/* Title */}
              <h4 className="gallery-item-title font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                {item.title}
              </h4>

              {/* Subtitle (Category) */}
              {item.subtitle && (
                <p className="gallery-item-subtitle text-xs text-gray-500 mb-1">
                  {item.subtitle}
                </p>
              )}

              {/* Description */}
              {item.description && layout === 'list' && (
                <p className="gallery-item-desc text-xs text-gray-600 line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}

              {/* Price */}
              {showPrice && item.price && (
                <div className="gallery-item-price mt-2">
                  <span className="text-primary-600 font-bold text-sm">
                    {formatPrice(item.price)}
                  </span>
                </div>
              )}

              {/* CTAs */}
              {showCTA && item.ctas && item.ctas.length > 0 && (
                <div className="gallery-item-ctas flex gap-2 mt-3">
                  {item.ctas.slice(0, 2).map((cta, ctaIndex) => (
                    <button
                      key={ctaIndex}
                      onClick={(e) => handleCTAClick(item, cta, e)}
                      className={`
                        text-xs px-3 py-1.5 rounded-full font-medium
                        transition-colors duration-200
                        ${cta.variant === 'primary'
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }
                      `}
                    >
                      {cta.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Item count */}
      <div className="gallery-footer text-xs text-gray-400 text-center mt-3">
        {items.length} san pham
      </div>

      {/* v9.4.1: Form Modal for form-type CTAs */}
      {activeForm && activeForm.cta.form && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <InlineForm
              config={activeForm.cta.form}
              item={activeForm.item}
              onSubmit={handleFormSubmit}
              onCancel={() => setActiveForm(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryComponent
