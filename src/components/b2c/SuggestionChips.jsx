/**
 * SuggestionChips - Clickable suggestion chips for B2C customers
 * Part of Story 1: Welcome Screen & Onboarding
 *
 * v9.2.0: Now accepts dynamic chips from API instead of hardcoded
 *
 * @version 2.0.0
 * @since 8.13.0
 * @updated 9.2.0 - Dynamic chips from chat.channel config
 */

/**
 * Icon mapping for suggestion chips
 * Maps backend icon names to FontAwesome classes
 */
const ICON_MAP = {
  'shopping-bag': 'fa fa-shopping-bag',
  'list-alt': 'fa fa-list-alt',
  'question-circle': 'fa fa-question-circle',
  'comments': 'fa fa-comments',
  'search': 'fa fa-search',
  'phone': 'fa fa-phone',
  'headset': 'fa fa-headset',
  'calculator': 'fa fa-calculator',
  'file-text': 'fa fa-file-text',
  'shield': 'fa fa-shield',
  'car': 'fa fa-car',
  'home': 'fa fa-home',
  'heart': 'fa fa-heart',
  'star': 'fa fa-star',
  'tag': 'fa fa-tag',
  'truck': 'fa fa-truck',
  'credit-card': 'fa fa-credit-card',
  'user': 'fa fa-user',
  'cog': 'fa fa-cog',
  'info-circle': 'fa fa-info-circle',
}

// Default suggestions (fallback when API not available) - Vietnamese with diacritics
const DEFAULT_SUGGESTIONS = [
  {
    id: 'find-product',
    icon: 'shopping-bag',
    label: 'Tìm sản phẩm phù hợp',
    message: 'Tôi muốn tìm sản phẩm phù hợp với nhu cầu của tôi',
  },
  {
    id: 'view-orders',
    icon: 'list-alt',
    label: 'Xem đơn hàng của tôi',
    message: 'Cho tôi xem thông tin đơn hàng của tôi',
  },
  {
    id: 'ask-question',
    icon: 'question-circle',
    label: 'Giải đáp thắc mắc',
    message: 'Tôi có một số câu hỏi cần được giải đáp',
  },
  {
    id: 'free-chat',
    icon: 'comments',
    label: 'Nói chuyện tự do',
    message: 'Xin chào, tôi muốn trò chuyện với bạn',
  },
]

/**
 * SuggestionChips component
 *
 * @param {Object} props
 * @param {Array} props.chips - Dynamic chips from API [{id, icon, label, message}, ...]
 * @param {Function} props.onSelect - Callback when chip is clicked, receives message string
 * @param {boolean} props.disabled - Disable all chips
 * @param {string} props.prompt - Optional prompt text above chips
 */
function SuggestionChips({
  chips = null,
  onSelect,
  disabled = false,
  prompt = 'Tôi có thể giúp bạn:'
}) {
  // Use provided chips or fallback to defaults
  const suggestions = chips && chips.length > 0 ? chips : DEFAULT_SUGGESTIONS

  const handleClick = (suggestion) => {
    if (!disabled && onSelect) {
      // v9.4.0: Pass whole suggestion object for action handling
      // If suggestion has action, parent handles it
      // Otherwise, send message/label to AI (backward compatible)
      onSelect(suggestion)
    }
  }

  const getIconClass = (iconName) => {
    return ICON_MAP[iconName] || `fa fa-${iconName}` || 'fa fa-circle'
  }

  return (
    <div className="suggestion-chips-container">
      {prompt && (
        <p className="text-sm text-gray-500 mb-3 text-center">
          {prompt}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleClick(suggestion)}
            disabled={disabled}
            className={`
              suggestion-chip
              inline-flex items-center gap-2
              px-4 py-2.5
              bg-white border border-gray-200
              rounded-full
              text-sm font-medium text-gray-700
              hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-sm hover:shadow
            `}
            data-suggestion={suggestion.id}
          >
            {suggestion.icon && (
              <i className={`${getIconClass(suggestion.icon)} text-base`}></i>
            )}
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SuggestionChips
export { DEFAULT_SUGGESTIONS, ICON_MAP }
