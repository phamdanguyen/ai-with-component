import { useState } from 'react'
import SuggestionButtons from './SuggestionButtons'

/**
 * MessageBubble - Chat message bubble with AI avatar
 * Part of Story 4: AI Avatar & Typing Indicator
 *
 * Features:
 * - AI avatar for assistant messages
 * - User messages styled differently
 * - Thinking section display (collapsible)
 * - RAG section display (knowledge retrieval)
 * - Tools section display (tool execution)
 * - Handoff section display (agent handoff)
 * - GenUI component slot
 * - Suggestion buttons (v9.1.0)
 * - Smooth animations
 *
 * @version 2.1.0
 * @since 8.13.0
 * @updated 8.15.0 - Added activity sections (RAG, Tools, Handoff)
 * @updated 9.1.0 - Added SuggestionButtons integration
 */

/**
 * Activity Section Component - Collapsible section for activities
 */
function ActivitySection({ type, status, content, isCollapsed, onToggle }) {
  // Activity type configurations
  const activityConfig = {
    thinking: {
      icon: 'fa-lightbulb-o',
      label: 'Suy nghĩ',
      activeLabel: 'Đang suy nghĩ...',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-500',
    },
    rag: {
      icon: 'fa-database',
      label: 'Tra cứu kiến thức',
      activeLabel: 'Đang tra cứu...',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500',
    },
    tools: {
      icon: 'fa-wrench',
      label: 'Sử dụng công cụ',
      activeLabel: 'Đang thực thi...',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500',
    },
    handoff: {
      icon: 'fa-exchange',
      label: 'Chuyển tiếp',
      activeLabel: 'Đang chuyển tiếp...',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
    },
  }

  const config = activityConfig[type] || activityConfig.thinking

  return (
    <div className={`
      activity-section
      ${config.bgColor} ${config.borderColor}
      border rounded-lg mb-2 overflow-hidden
      transition-all duration-200
    `}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`
          w-full px-3 py-2 flex items-center justify-between
          hover:bg-opacity-70 transition-colors
          ${config.textColor}
        `}
      >
        <div className="flex items-center gap-2">
          <i className={`fa ${config.icon} ${config.iconColor}`}></i>
          <span className="text-xs font-medium">
            {status === 'active' ? config.activeLabel : config.label}
          </span>
          {status === 'active' && (
            <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
          )}
          {status === 'completed' && (
            <i className="fa fa-check text-green-500 text-xs"></i>
          )}
        </div>
        <i className={`fa ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs`}></i>
      </button>

      {/* Content - collapsible */}
      {!isCollapsed && content && (
        <div className={`
          px-3 pb-2 text-xs ${config.textColor}
          border-t ${config.borderColor}
          max-h-40 overflow-y-auto
        `}>
          <pre className="whitespace-pre-wrap font-sans">{content}</pre>
        </div>
      )}
    </div>
  )
}

/**
 * MessageBubble component
 * @param {Object} props
 * @param {Object} props.message - Message object {role, content, thinking, component, activities, suggestions}
 * @param {Function} props.renderComponent - Function to render GenUI component
 * @param {boolean} props.isNew - Animate as new message
 * @param {Function} props.onSuggestionClick - Callback when suggestion button clicked (buttonId, action)
 */
function MessageBubble({ message, renderComponent, isNew = false, onSuggestionClick }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Track collapsed state for each activity section
  const [collapsedSections, setCollapsedSections] = useState({
    thinking: true,
    rag: true,
    tools: true,
    handoff: true,
  })

  const toggleSection = (type) => {
    setCollapsedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Convert legacy thinking field to activities format
  const activities = message.activities || (message.thinking ? [{
    type: 'thinking',
    status: 'completed',
    content: message.thinking
  }] : [])

  return (
    <div
      className={`
        message-bubble
        flex gap-3
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
        ${isNew ? 'animate-fade-in-up' : ''}
      `}
    >
      {/* Avatar (only for assistant) */}
      {isAssistant && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
            <i className="fa fa-robot text-white text-sm"></i>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`
          ${isUser ? 'max-w-[75%]' : 'max-w-[95%]'}
          rounded-2xl
          px-4 py-3
          ${isUser
            ? 'bg-primary-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }
          shadow-sm
        `}
      >
        {/* Activity Sections (v8.15.0) */}
        {isAssistant && activities.length > 0 && (
          <div className="mb-3">
            {activities.map((activity, index) => (
              <ActivitySection
                key={`${activity.type}-${index}`}
                type={activity.type}
                status={activity.status}
                content={activity.content}
                isCollapsed={collapsedSections[activity.type]}
                onToggle={() => toggleSection(activity.type)}
              />
            ))}
          </div>
        )}

        {/* Message Text */}
        {message.content && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        )}

        {/* GenUI Component (if available) */}
        {console.log('[DEBUG MessageBubble] message.component:', message.component)}
        {console.log('[DEBUG MessageBubble] renderComponent:', typeof renderComponent)}
        {message.component && renderComponent && (
          <div className="mt-4 genui-container">
            {console.log('[DEBUG MessageBubble] Rendering component:', message.component.component_type)}
            {renderComponent(message.component)}
          </div>
        )}

        {/* Suggestion Buttons (v9.1.0 - after AI response) */}
        {isAssistant && message.suggestions && onSuggestionClick && (
          <SuggestionButtons
            data={message.suggestions}
            onSelect={onSuggestionClick}
          />
        )}
      </div>

      {/* User Avatar Placeholder (for alignment) */}
      {isUser && (
        <div className="w-8 flex-shrink-0"></div>
      )}
    </div>
  )
}

export default MessageBubble
