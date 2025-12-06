/**
 * ChatInput - Enhanced chat input with character counter and animations
 * Part of Story 3: Enhanced Input Experience
 *
 * Features:
 * - Character counter with warning
 * - Send button animation
 * - Focus states
 * - Loading state
 * - Multiline support (Shift+Enter)
 * - Auto-resize textarea
 *
 * @version 2.0.0
 * @since 8.13.0
 * @updated 9.5.0 - Multiline textarea support
 */

import { useState, useRef, useEffect } from 'react'

const MAX_CHARS = 500
const WARNING_THRESHOLD = 450
const MIN_HEIGHT = 44  // Minimum textarea height
const MAX_HEIGHT = 150 // Maximum textarea height

/**
 * ChatInput component
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Callback when input changes
 * @param {Function} props.onSend - Callback when send is triggered
 * @param {boolean} props.isLoading - Show loading state
 * @param {string} props.placeholder - Placeholder text
 */
function ChatInput({
  value = '',
  onChange,
  onSend,
  isLoading = false,
  placeholder = 'Nhập tin nhắn của bạn...',
}) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  const charCount = value.length
  const isOverWarning = charCount >= WARNING_THRESHOLD
  const isOverLimit = charCount >= MAX_CHARS
  const canSend = value.trim().length > 0 && !isLoading && !isOverLimit

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)
      textarea.style.height = `${newHeight}px`
    }
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARS && onChange) {
      onChange(newValue)
    }
  }

  // Use onKeyDown for better Enter detection
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault()
      onSend && onSend()
    }
    // Shift+Enter: Allow default behavior (newline)
  }

  const handleSendClick = () => {
    if (canSend && onSend) {
      onSend()
    }
  }

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Adjust height when value changes
  useEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <div className={`
      chat-input-container
      border-t border-gray-200
      bg-white
      transition-all duration-200
      w-full
      ${isFocused ? 'border-t-primary-300' : ''}
    `}>
      <div className="p-4 w-full">
        <div className={`
          w-full
          flex items-end gap-3
          rounded-xl
          border-2 transition-all duration-200
          ${isFocused ? 'border-primary-400 shadow-sm' : 'border-gray-200'}
          ${isOverLimit ? 'border-red-400' : ''}
          bg-gray-50
          p-2
        `}>
          {/* Textarea Field - Multiline Support */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={`
              flex-1
              bg-transparent
              px-2 py-2
              text-gray-800
              placeholder-gray-400
              focus:outline-none
              disabled:opacity-50
              resize-none
              overflow-y-auto
              min-h-[44px]
            `}
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          />

          {/* Send Button */}
          <button
            onClick={handleSendClick}
            disabled={!canSend}
            className={`
              send-button
              w-10 h-10
              rounded-full
              flex items-center justify-center
              flex-shrink-0
              transition-all duration-200
              ${canSend
                ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
              ${isLoading ? 'animate-pulse' : ''}
            `}
            title={isLoading ? 'Đang xử lý...' : 'Gửi tin nhắn (Enter)'}
          >
            {isLoading ? (
              <i className="fa fa-spinner fa-spin"></i>
            ) : (
              <i className="fa fa-paper-plane"></i>
            )}
          </button>
        </div>

        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2 px-2">
          <span className="text-xs text-gray-400">
            Enter gửi, Shift+Enter xuống dòng
          </span>
          <span className={`
            text-xs transition-colors
            ${isOverLimit ? 'text-red-500 font-medium' : ''}
            ${isOverWarning && !isOverLimit ? 'text-yellow-600' : ''}
            ${!isOverWarning ? 'text-gray-400' : ''}
          `}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
