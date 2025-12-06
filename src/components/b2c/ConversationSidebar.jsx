/**
 * ConversationSidebar - ChatGPT/Claude style conversation list
 * Displays conversation history with ghost button actions
 *
 * Features:
 * - Ghost button style (40x40, rounded-lg, hover:bg-gray-100)
 * - New Chat button (plus icon)
 * - Clear History button (trash icon, hover: red, conditional)
 * - Buttons inline with title (space-efficient)
 * - Conversation list with timestamps
 * - Active conversation highlight
 *
 * @version 1.5.0 (v10.7.0)
 * @since 8.14.0
 * @changes v10.7.0:
 *   - Removed search & collapse button
 *   - Ghost button style (subtle hover background)
 *   - Buttons inline with title
 *   - Clean, modern appearance
 * @changes v10.9.2:
 *   - Added user dropdown menu in footer (Sign Out, My Portal)
 */

import { useState, useEffect, useRef } from 'react'

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

/**
 * ConversationItem - Single conversation in the list
 */
function ConversationItem({ conversation, isActive, onClick, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={`
        group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer
        transition-all duration-200
        ${isActive
          ? 'bg-primary-100 border-l-4 border-primary-500'
          : 'hover:bg-gray-100 border-l-4 border-transparent'
        }
      `}
      onClick={onClick}
    >
      {/* Chat icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
        ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}
      `}>
        <i className="fa fa-comment-o text-sm"></i>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`
          text-sm font-medium truncate
          ${isActive ? 'text-primary-700' : 'text-gray-700'}
        `}>
          {conversation.title || 'Cuộc trò chuyện mới'}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {formatRelativeTime(conversation.updated_at || conversation.created_at)}
        </p>
      </div>

      {/* Menu button */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="w-7 h-7 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
        >
          <i className="fa fa-ellipsis-v text-xs"></i>
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-2 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
            <button
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(conversation.id)
                setShowMenu(false)
              }}
            >
              <i className="fa fa-trash-o"></i>
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ConversationSidebar component
 * v9.6.0: Added onClearAll for AC7.4
 * v10.9.1: Added userInfo and userLoading props for footer display
 */
function ConversationSidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll = null,
  isCollapsed = false,
  onToggleCollapse,
  userInfo = null,
  userLoading = false,
}) {
  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Use conversations directly (search removed for space optimization)
  const filteredConversations = conversations

  // Group conversations by date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const groupedConversations = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  }

  filteredConversations.forEach(conv => {
    const convDate = new Date(conv.updated_at || conv.created_at)
    convDate.setHours(0, 0, 0, 0)

    if (convDate >= today) {
      groupedConversations.today.push(conv)
    } else if (convDate >= yesterday) {
      groupedConversations.yesterday.push(conv)
    } else if (convDate >= lastWeek) {
      groupedConversations.lastWeek.push(conv)
    } else {
      groupedConversations.older.push(conv)
    }
  })

  // Collapsed state - show only toggle button
  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <button
          className="w-10 h-10 rounded-lg bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center shadow-md mb-4"
          onClick={onNewChat}
          title="Trò chuyện mới"
        >
          <i className="fa fa-plus"></i>
        </button>
        <button
          className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-500"
          onClick={onToggleCollapse}
          title="Mở rộng sidebar"
        >
          <i className="fa fa-chevron-right"></i>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Title + Action Buttons (inline) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Trò chuyện</h2>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* New Chat Button */}
            <button
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              onClick={onNewChat}
              title="Trò chuyện mới"
            >
              <i className="fa fa-plus"></i>
            </button>

            {/* Clear History Button */}
            {onClearAll && conversations.length > 0 && (
              <button
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
                onClick={onClearAll}
                title="Xóa tất cả lịch sử trò chuyện"
              >
                <i className="fa fa-trash-o"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <i className="fa fa-comments-o text-4xl mb-3 block"></i>
            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
            <p className="text-xs mt-1">Bắt đầu trò chuyện mới!</p>
          </div>
        ) : (
          <>
            {/* Today */}
            {groupedConversations.today.length > 0 && (
              <div className="mb-4">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Hôm nay</p>
                {groupedConversations.today.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => onSelectConversation?.(conv.id)}
                    onDelete={onDeleteConversation}
                  />
                ))}
              </div>
            )}

            {/* Yesterday */}
            {groupedConversations.yesterday.length > 0 && (
              <div className="mb-4">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Hôm qua</p>
                {groupedConversations.yesterday.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => onSelectConversation?.(conv.id)}
                    onDelete={onDeleteConversation}
                  />
                ))}
              </div>
            )}

            {/* Last 7 days */}
            {groupedConversations.lastWeek.length > 0 && (
              <div className="mb-4">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">7 ngày trước</p>
                {groupedConversations.lastWeek.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => onSelectConversation?.(conv.id)}
                    onDelete={onDeleteConversation}
                  />
                ))}
              </div>
            )}

            {/* Older */}
            {groupedConversations.older.length > 0 && (
              <div className="mb-4">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Trước đó</p>
                {groupedConversations.older.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => onSelectConversation?.(conv.id)}
                    onDelete={onDeleteConversation}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white relative" ref={userMenuRef}>
        {userLoading ? (
          /* Loading state */
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ) : userInfo ? (
          /* Logged in - Show user info with dropdown */
          <>
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {userInfo.avatar_url ? (
                <img
                  src={userInfo.avatar_url}
                  alt={userInfo.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{userInfo.name}</p>
                <p className="text-xs text-gray-400">Đã đăng nhập</p>
              </div>
              <i className={`fa fa-chevron-${showUserMenu ? 'down' : 'up'} text-gray-400 text-xs`}></i>
            </div>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a
                  href="/superchat/portal"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <i className="fa fa-user-circle text-gray-400"></i>
                  <span>My Portal</span>
                </a>
                <div className="border-t border-gray-100"></div>
                <a
                  href="/web/session/logout"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <i className="fa fa-sign-out text-red-600"></i>
                  <span>Sign Out</span>
                </a>
              </div>
            )}
          </>
        ) : (
          /* Not logged in - Show Sign In button */
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <i className="fa fa-user text-gray-500 text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <a
                href="/web/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Đăng nhập
              </a>
              <p className="text-xs text-gray-400">Để lưu lịch sử trò chuyện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationSidebar
