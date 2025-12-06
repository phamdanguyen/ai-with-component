/**
 * WelcomeScreen - Welcome screen for B2C customers
 * Part of Story 1: Welcome Screen & Onboarding
 *
 * v9.2.0: Now accepts dynamic configuration from API
 * - initial_chips: From chat.channel.initial_suggestion_chips
 * - popular_questions: From chat.channel.popular_questions
 * - welcome_config: Additional display settings
 *
 * v10.7.0: AI Personalization
 * - Merges personalized suggestions with generic chips
 * - Prioritizes personalized suggestions for returning users
 *
 * v11.0.0: Phase 1 P0 - Social Proof Counts
 * - Show ask_count for popular questions ("X người đã hỏi")
 * - Backward compatible with string[] format
 *
 * @version 2.2.0
 * @since 8.13.0
 * @updated 9.2.0 - Dynamic config from chat.channel
 * @updated 10.7.0 - AI Personalization
 * @updated 2025-12-03 - Phase 1 P0: Social Proof
 */

import { useState, useEffect } from 'react'
import SuggestionChips from './SuggestionChips'

// Default popular questions (fallback)
const DEFAULT_POPULAR_QUESTIONS = []

/**
 * WelcomeScreen component
 *
 * @param {Object} props
 * @param {string} props.companyName - Company name for greeting
 * @param {string} props.customerName - Customer name if known
 * @param {Function} props.onSuggestionSelect - Callback when suggestion is clicked
 * @param {boolean} props.isReturningVisitor - Show "welcome back" for returning visitors
 * @param {Function} props.onContinueConversation - Callback for "Continue" button (v9.6.0)
 * @param {Function} props.onStartNew - Callback for "Start New" button (v9.6.0)
 * @param {Object} props.initConfig - Configuration from API (v9.2.0)
 *   {
 *     greeting_message: string,
 *     initial_chips: Array,
 *     popular_questions: Array,
 *     welcome_config: { show_avatar, show_chips, show_popular_questions, avatar_icon, tagline }
 *   }
 * @param {String} props.partnerId - Partner ID for personalization (v10.7.0)
 * @param {String} props.sessionId - Session ID for personalization (v10.7.0)
 */
function WelcomeScreen({
  companyName = 'UniAI',
  customerName = null,
  onSuggestionSelect,
  isReturningVisitor = false,
  onContinueConversation = null,
  onStartNew = null,
  initConfig = null,
  partnerId = null,
  sessionId = null,
}) {
  // State for personalized chips (v10.7.0)
  const [mergedChips, setMergedChips] = useState(null)
  const [hasPersonalization, setHasPersonalization] = useState(false)

  // Extract config values with defaults
  const config = initConfig || {}
  const welcomeConfig = config.welcome_config || {}
  const genericChips = config.initial_chips || null
  const popularQuestions = config.popular_questions || DEFAULT_POPULAR_QUESTIONS
  const tagline = welcomeConfig.tagline || 'Tôi là trợ lý AI, sẵn sàng hỗ trợ bạn 24/7'
  const avatarIcon = welcomeConfig.avatar_icon || 'robot'
  const showAvatar = welcomeConfig.show_avatar !== false
  const showChips = welcomeConfig.show_chips !== false
  const showPopularQuestions = welcomeConfig.show_popular_questions !== false && popularQuestions.length > 0

  // Fetch personalized suggestions and merge with generic (v10.7.0)
  useEffect(() => {
    fetchPersonalizedSuggestions()
  }, [partnerId, sessionId, genericChips])

  const fetchPersonalizedSuggestions = async () => {
    try {
      // Call personalization API
      const response = await fetch('/superchat/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            partner_id: partnerId,
            session_id: sessionId,
          },
          id: Date.now(),
        }),
      })

      const data = await response.json()

      if (data.result && data.result.success && data.result.suggestions && data.result.suggestions.length > 0) {
        const personalizedSuggestions = data.result.suggestions || []

        // Transform personalized suggestions to chip format
        const personalizedChips = personalizedSuggestions.map((s) => ({
          id: `personalized_${s.label.replace(/\s+/g, '_').toLowerCase()}`,
          icon: s.icon || 'fa-comment',
          label: s.label,
          message: s.message,
          isPersonalized: true, // Mark as personalized for styling
        }))

        // Merge: Personalized (top 3) + Generic (remaining)
        const merged = [...personalizedChips.slice(0, 3)]

        // Add generic chips if we have less than 5 total
        if (genericChips && Array.isArray(genericChips)) {
          const remaining = 5 - merged.length
          merged.push(...genericChips.slice(0, remaining))
        }

        setMergedChips(merged)
        setHasPersonalization(true)

        console.log('[WelcomeScreen] Merged personalized + generic suggestions:', merged.length)
      } else {
        // No personalization - use generic chips
        setMergedChips(genericChips)
        setHasPersonalization(false)
      }
    } catch (error) {
      console.error('[WelcomeScreen] Failed to fetch personalized suggestions:', error)
      // Fallback: Use generic chips
      setMergedChips(genericChips)
      setHasPersonalization(false)
    }
  }

  // Build greeting
  const greeting = isReturningVisitor
    ? `Chào mừng trở lại${customerName ? `, ${customerName}` : ''}!`
    : config.greeting_message || `Chào mừng bạn đến ${companyName} Assistant!`

  // Helper: Normalize popular questions format (Phase 1 P0)
  // Support both string[] (old) and object[] (new with ask_count)
  const normalizeQuestion = (q) => {
    if (typeof q === 'string') {
      return { text: q, ask_count: null }
    }
    return { text: q.text || q, ask_count: q.ask_count || null }
  }

  const handlePopularClick = (question) => {
    if (onSuggestionSelect) {
      // Extract text if object format
      const questionText = typeof question === 'string' ? question : (question.text || question)
      onSuggestionSelect(questionText)
    }
  }

  return (
    <div className="welcome-screen flex flex-col items-center justify-center py-6 px-4">
      {/* AI Avatar + Welcome Message - Horizontal Layout */}
      <div className="flex items-center gap-4 mb-6">
        {/* AI Avatar - Compact */}
        {showAvatar && (
          <div className="ai-avatar relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <i className={`fa fa-${avatarIcon} text-2xl text-white`}></i>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}

        {/* Welcome Message - Aligned with Avatar */}
        <div className="text-left">
          <h2 className="text-xl font-bold text-gray-800">
            {greeting}
          </h2>
          <p className="text-gray-600 text-sm">
            {tagline}
          </p>
        </div>
      </div>

      {/* Returning Visitor Actions - v9.6.0 AC7.3 */}
      {isReturningVisitor && onContinueConversation && onStartNew && (
        <div className="w-full max-w-md mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onContinueConversation}
              className="
                px-4 py-3
                bg-primary-600 hover:bg-primary-700
                text-white font-medium
                rounded-lg
                transition-all duration-200
                flex items-center justify-center gap-2
                shadow-md hover:shadow-lg
              "
            >
              <i className="fa fa-history"></i>
              <span>Tiep tuc</span>
            </button>
            <button
              onClick={onStartNew}
              className="
                px-4 py-3
                bg-gray-100 hover:bg-gray-200
                text-gray-700 font-medium
                rounded-lg
                border border-gray-300
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <i className="fa fa-plus-circle"></i>
              <span>Bat dau moi</span>
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Chips - Now Dynamic + Personalized (v10.7.0) */}
      {showChips && (
        <div className="w-full max-w-3xl mb-8">
          {hasPersonalization && (
            <p className="text-xs text-purple-600 mb-2 text-center font-medium flex items-center justify-center gap-1">
              <i className="fa fa-sparkles"></i>
              Gợi ý dành riêng cho bạn
            </p>
          )}
          <SuggestionChips
            chips={mergedChips}
            onSelect={onSuggestionSelect}
          />
        </div>
      )}

      {/* Popular Questions - Now Dynamic, 2 columns on desktop + Social Proof (Phase 1 P0) */}
      {showPopularQuestions && (
        <div className="w-full max-w-4xl">
          <p className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wide">
            Câu hỏi phổ biến
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {popularQuestions.map((question, index) => {
              const q = normalizeQuestion(question)
              return (
                <button
                  key={index}
                  onClick={() => handlePopularClick(question)}
                  className="
                    w-full text-left px-4 py-3
                    bg-gray-50 hover:bg-gray-100
                    border border-gray-200 hover:border-gray-300
                    rounded-lg
                    text-sm text-gray-700
                    transition-all duration-200
                    flex items-center justify-between gap-2
                  "
                >
                  <div className="flex items-center gap-2 flex-1">
                    <i className="fa fa-lightbulb-o text-yellow-500 flex-shrink-0"></i>
                    <span>"{q.text}"</span>
                  </div>
                  {q.ask_count !== null && q.ask_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <i className="fa fa-users"></i>
                      <span>{q.ask_count.toLocaleString()}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default WelcomeScreen
