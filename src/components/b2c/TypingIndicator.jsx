/**
 * TypingIndicator - Enhanced typing indicator with status text
 * Part of Story 4: AI Avatar & Typing Indicator
 *
 * Features:
 * - AI avatar
 * - Animated dots
 * - Status text (thinking, generating, etc.)
 *
 * @version 1.0.0
 * @since 8.13.0
 */

/**
 * TypingIndicator component
 * @param {Object} props
 * @param {string} props.status - Status text (optional)
 */
function TypingIndicator({ status = 'Dang suy nghi...' }) {
  return (
    <div className="typing-indicator flex gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
          <i className="fa fa-robot text-white text-sm"></i>
        </div>
      </div>

      {/* Typing Bubble */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Animated Dots */}
          <div className="flex space-x-1">
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>

          {/* Status Text */}
          {status && (
            <span className="text-xs text-gray-500 ml-2">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
