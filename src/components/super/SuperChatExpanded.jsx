/**
 * SuperChatExpanded - Fullscreen chat experience
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * Full-featured chat interface that receives transition from Bubble Chat.
 * Provides rich UI with GenUI components, tools, and advanced features.
 *
 * Features:
 * - Full message history from transition
 * - Rich GenUI component rendering
 * - Tool execution visualization
 * - RAG search results display
 * - Collapse back to Bubble option
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat, SessionManager, CHAT_SOURCES } from '../../shared';
import MessageBubble from '../b2c/MessageBubble';
import WelcomeScreen from '../b2c/WelcomeScreen';
import TypingIndicator from '../b2c/TypingIndicator';
import TrustFooter from '../b2c/TrustFooter';
import './SuperChatExpanded.css';

const SuperChatExpanded = ({
    agentName = 'AI Assistant',
    primaryColor = '#667eea',
    transitionData = null,
    allowCollapse = true,
    onCollapse = null
}) => {
    // State
    const [inputValue, setInputValue] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [isToolsExpanded, setIsToolsExpanded] = useState(true);

    // Chat hook
    const {
        messages,
        isLoading,
        isThinking,
        thinkingText,
        currentAnswer,
        activeTools,
        ragStatus,
        suggestions,
        error,
        send,
        clear,
        sessionId
    } = useChat({
        source: CHAT_SOURCES.SUPER,
        onError: (err) => console.error('[SuperChat] Error:', err)
    });

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, currentAnswer, isThinking, activeTools]);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Restore UI state from transition
    useEffect(() => {
        if (transitionData) {
            const uiState = SessionManager.getUIState();
            if (uiState.inputValue) {
                setInputValue(uiState.inputValue);
            }
            console.log('[SuperChat] Restored from transition:', transitionData);
        }
    }, [transitionData]);

    // Handle send
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            send(inputValue.trim());
            setInputValue('');
        }
    };

    // Handle suggestion click
    const handleSuggestion = useCallback((suggestion) => {
        if (suggestion.action === 'send_message') {
            send(suggestion.text || suggestion.label);
        } else if (suggestion.action === 'open_url' && suggestion.url) {
            window.open(suggestion.url, suggestion.target || '_blank');
        }
    }, [send]);

    // Handle collapse
    const handleCollapseClick = () => {
        if (allowCollapse && onCollapse) {
            // Save current state before collapse
            SessionManager.saveUIState({
                inputValue: inputValue,
                scrollPosition: document.querySelector('.super-chat__messages')?.scrollTop || 0
            });
            onCollapse();
        }
    };

    // Handle human support request
    const handleHumanSupport = useCallback(() => {
        console.log('[SuperChat] Human support requested');
        // TODO: Implement escalation logic (create ticket, notify agent, etc.)
        window.open('/contactus', '_blank');
    }, []);

    return (
        <div className="super-chat" style={{ '--super-primary': primaryColor }}>
            {/* Header */}
            <header className="super-chat__header">
                <div className="super-chat__header-left">
                    {allowCollapse && (
                        <button
                            className="super-chat__back-btn"
                            onClick={handleCollapseClick}
                            title="Collapse to bubble"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                    <div className="super-chat__agent-info">
                        <div className="super-chat__avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="super-chat__title">{agentName}</h1>
                            <span className="super-chat__status">
                                {isThinking ? 'Đang suy nghĩ...' :
                                 currentAnswer ? 'Đang tạo nội dung...' :
                                 isLoading ? 'Đang xử lý...' :
                                 'Online'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="super-chat__header-right">
                    <button
                        className="super-chat__header-btn"
                        onClick={() => setShowSidebar(!showSidebar)}
                        title="Toggle sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="3" x2="9" y2="21"/>
                        </svg>
                    </button>
                    <button
                        className="super-chat__header-btn"
                        onClick={clear}
                        title="Clear chat"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="super-chat__main">
                {/* Messages */}
                <div className="super-chat__messages">
                    {/* Welcome Screen with B2C Features */}
                    {messages.length === 0 && !isLoading && (
                        <WelcomeScreen
                            companyName="Bot247"
                            onSuggestionSelect={handleSuggestion}
                            isReturningVisitor={false}
                            initConfig={null}
                        />
                    )}

                    {/* Message List */}
                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            compact={false}
                            showAvatar={true}
                            agentName={agentName}
                        />
                    ))}

                    {/* RAG Status */}
                    {ragStatus && ragStatus.status === 'searching' && (
                        <div className="super-chat__rag-status">
                            <div className="super-chat__rag-spinner" />
                            <span>Searching knowledge base...</span>
                        </div>
                    )}

                    {/* Active Tools - Expandable */}
                    {activeTools.length > 0 && (
                        <div className="super-chat__tools">
                            <button
                                className="super-chat__tools-header"
                                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                                </svg>
                                <span>Cong cu ({activeTools.length})</span>
                                <svg
                                    className={`super-chat__expand-icon ${isToolsExpanded ? 'expanded' : ''}`}
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {isToolsExpanded && (
                                <div className="super-chat__tools-list">
                                    {activeTools.map((tool, index) => (
                                        <div key={index} className={`super-chat__tool super-chat__tool--${tool.status}`}>
                                            <span className="super-chat__tool-icon">
                                                {tool.status === 'executing' ? (
                                                    <div className="super-chat__tool-spinner" />
                                                ) : tool.status === 'success' ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                                    </svg>
                                                )}
                                            </span>
                                            <span className="super-chat__tool-name">{tool.tool || tool.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Typing Indicator - B2C Component */}
                    {isThinking && (
                        <TypingIndicator status="Dang suy nghi..." />
                    )}

                    {/* Streaming Answer */}
                    {currentAnswer && !isThinking && (
                        <MessageBubble
                            message={{
                                id: 'streaming',
                                role: 'assistant',
                                content: currentAnswer
                            }}
                            compact={false}
                            isStreaming={true}
                            agentName={agentName}
                        />
                    )}

                    {/* Error */}
                    {error && (
                        <div className="super-chat__error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Sidebar (optional) */}
                {showSidebar && (
                    <aside className="super-chat__sidebar">
                        <div className="super-chat__sidebar-header">
                            <h3>Session Info</h3>
                            <button onClick={() => setShowSidebar(false)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="super-chat__sidebar-content">
                            <p><strong>Session:</strong> {sessionId?.slice(0, 20)}...</p>
                            <p><strong>Messages:</strong> {messages.length}</p>
                            <p><strong>Tools Used:</strong> {activeTools.length}</p>
                        </div>
                    </aside>
                )}
            </div>

            {/* Suggestions */}
            {suggestions && suggestions.buttons && suggestions.buttons.length > 0 && (
                <div className="super-chat__suggestions">
                    {suggestions.buttons.map((suggestion, index) => (
                        <button
                            key={index}
                            className="super-chat__suggestion-btn"
                            onClick={() => handleSuggestion(suggestion)}
                        >
                            {suggestion.icon && <span>{suggestion.icon}</span>}
                            {suggestion.label || suggestion.text}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form className="super-chat__input-form" onSubmit={handleSubmit}>
                <div className="super-chat__input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="super-chat__input"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="super-chat__send-btn"
                        disabled={!inputValue.trim() || isLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
                <div className="super-chat__input-hint">
                    Press Enter to send
                </div>
            </form>

            {/* Trust Footer */}
            <TrustFooter
                onHumanSupport={handleHumanSupport}
                privacyUrl="/privacy"
                rating={4.8}
                reviewCount={500}
            />
        </div>
    );
};

export default SuperChatExpanded;
