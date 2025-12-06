/**
 * SuggestionButtons - Proactive AI suggestions after response
 * Part of v9.1.0: Suggestion Buttons for Super Chat
 *
 * Different from SuggestionChips (Welcome Screen):
 * - SuggestionChips: Fixed 4 options for new visitors
 * - SuggestionButtons: Dynamic, context-aware suggestions from AI
 *
 * Enhanced in v9.4.0 (Sprint 2):
 * - Rich interaction tracking via InteractionTracker
 * - Component context capture for AI
 * - User signals included in click callback
 *
 * @version 2.0.0
 * @since 9.1.0
 */

import InteractionTracker from '../../shared/services/InteractionTracker'

/**
 * Icon mapping for suggestion buttons
 * Maps backend icon names to FontAwesome classes
 */
const ICON_MAP = {
  search: 'fa-search',
  phone: 'fa-phone',
  comment: 'fa-comment',
  headset: 'fa-headset',
  eye: 'fa-eye',
  calculator: 'fa-calculator',
  'shopping-cart': 'fa-shopping-cart',
  refresh: 'fa-refresh',
  'balance-scale': 'fa-balance-scale',
  'credit-card': 'fa-credit-card',
  'file-text': 'fa-file-text',
  plus: 'fa-plus',
  question: 'fa-question',
  star: 'fa-star',
  list: 'fa-list',
  check: 'fa-check',
  times: 'fa-times',
  edit: 'fa-edit',
  home: 'fa-home',
}

/**
 * Variant styles for buttons
 */
const VARIANT_CLASSES = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 border-primary-600',
  outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500',
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100',
}

/**
 * SuggestionButtons component
 *
 * @param {Object} props
 * @param {Object} props.data - Suggestion data from backend
 *   {
 *     enabled: boolean,
 *     context: string,
 *     prompt: string,
 *     buttons: [{id, label, icon, variant, action}],
 *     source_message_id: string (optional - ID of message that generated these suggestions)
 *   }
 * @param {Function} props.onSelect - Callback when button is clicked
 *   onSelect(buttonId, action, structuredData) where structuredData includes tracking context
 * @param {boolean} props.disabled - Disable all buttons
 * @param {Object} props.triggerContext - Context from the component that triggered these suggestions
 *   { componentType, productId, triggerAction }
 */
function SuggestionButtons({ data, onSelect, disabled = false, triggerContext = {} }) {
  // Don't render if no data or disabled
  if (!data || !data.enabled || !data.buttons || data.buttons.length === 0) {
    return null
  }

  const handleClick = (button) => {
    if (disabled || !onSelect) return

    // Build component context for tracking
    const componentContext = {
      componentType: 'suggestion_button',
      triggerComponent: triggerContext.componentType || data.context || 'ai_response',
      triggerAction: button.action?.type || button.id,
      productId: triggerContext.productId || button.action?.product_id || null,
      sourceMessageId: data.source_message_id || null,
    }

    // Track the interaction
    const interaction = InteractionTracker.trackButtonClick(button.id, componentContext)

    // Build enriched structured data
    const structuredData = InteractionTracker.buildStructuredData(
      'suggestion_click',
      {
        button_id: button.id,
        button_label: button.label,
        action_type: button.action?.type,
        action_data: button.action,
      },
      componentContext
    )

    // Call original handler with enriched data
    onSelect(button.id, button.action, structuredData)
  }

  return (
    <div className="suggestion-buttons-container mt-3 pt-3 border-t border-gray-100">
      {/* Optional prompt text */}
      {data.prompt && (
        <p className="text-xs text-gray-500 mb-2">{data.prompt}</p>
      )}

      {/* Horizontal scrollable buttons */}
      <div className="flex flex-wrap gap-2">
        {data.buttons.map((button) => {
          const iconClass = ICON_MAP[button.icon] || 'fa-circle'
          const variantClass = VARIANT_CLASSES[button.variant] || VARIANT_CLASSES.outline

          return (
            <button
              key={button.id}
              onClick={() => handleClick(button)}
              disabled={disabled}
              className={`
                suggestion-btn
                inline-flex items-center gap-1.5
                px-3 py-1.5
                text-xs font-medium
                border rounded-full
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow
                ${variantClass}
              `}
              data-button-id={button.id}
              data-action-type={button.action?.type}
            >
              {button.icon && (
                <i className={`fa ${iconClass} text-xs`}></i>
              )}
              <span>{button.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SuggestionButtons
export { ICON_MAP, VARIANT_CLASSES }
