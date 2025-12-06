/**
 * BubbleWindow - Chat window for BubbleChat
 *
 * Version: 9.4.0 - Material Design 3 Edition
 */

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import MessageBubble from '../b2c/MessageBubble';

const BubbleWindow = forwardRef(({
    inputRef,
    messages,
    isLoading,
    isThinking,
    thinkingText,
    currentAnswer,
    activeTools = [],
    ragStatus,
    suggestions,
    error,
    agentName,
    greeting,
    onSend,
    onSuggestionClick,
    onExpand,
    onClose,
    onClear
}, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
    const [isToolsExpanded, setIsToolsExpanded] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, currentAnswer, isThinking]);

    // Handle send
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSend(inputValue);
            setInputValue('');
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="bubble-window" ref={ref}>
            {/* Header */}
            <div className="bubble-window__header">
                <div className="bubble-window__header-info">
                    <div className="bubble-window__avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                    </div>
                    <div className="bubble-window__header-text">
                        <span className="bubble-window__agent-name">{agentName}</span>
                        <span className="bubble-window__status">
                            {isLoading ? 'Typing...' : 'Online'}
                        </span>
                    </div>
                </div>
                <div className="bubble-window__header-actions">
                    {/* Expand Button */}
                    <button
                        className="bubble-window__action-btn"
                        onClick={onExpand}
                        title="Expand to full view"
                        aria-label="Expand chat"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </button>
                    {/* Close Button */}
                    <button
                        className="bubble-window__action-btn"
                        onClick={onClose}
                        title="Close chat"
                        aria-label="Close chat"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="bubble-window__messages">
                {/* Greeting */}
                {greeting && messages.length === 0 && (
                    <div className="bubble-window__greeting">
                        <p>{greeting}</p>
                    </div>
                )}

                {/* Message List */}
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        compact={true}
                    />
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                    <div className="bubble-window__thinking">
                        <button
                            className="bubble-window__thinking-header"
                            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                        >
                            <div className="bubble-window__thinking-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="bubble-window__thinking-label">Dang suy nghi...</span>
                            <svg
                                className={`bubble-window__expand-icon ${isThinkingExpanded ? 'expanded' : ''}`}
                                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        {thinkingText && isThinkingExpanded && (
                            <div className="bubble-window__thinking-content">
                                <pre className="bubble-window__thinking-text">{thinkingText}</pre>
                            </div>
                        )}
                        {thinkingText && !isThinkingExpanded && (
                            <div className="bubble-window__thinking-preview">
                                {thinkingText.slice(0, 80)}...
                            </div>
                        )}
                    </div>
                )}

                {/* Active Tools Display */}
                {activeTools.length > 0 && (
                    <div className="bubble-window__tools">
                        <button
                            className="bubble-window__tools-header"
                            onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                            </svg>
                            <span>Cong cu ({activeTools.length})</span>
                            <svg
                                className={`bubble-window__expand-icon ${isToolsExpanded ? 'expanded' : ''}`}
                                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        {isToolsExpanded && (
                            <div className="bubble-window__tools-list">
                                {activeTools.map((tool, index) => (
                                    <div key={tool.id || index} className={`bubble-window__tool-item ${tool.status || 'running'}`}>
                                        <span className="bubble-window__tool-name">{tool.tool || tool.name}</span>
                                        {tool.status === 'completed' && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                            </svg>
                                        )}
                                        {tool.status === 'running' && (
                                            <span className="bubble-window__tool-spinner" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Streaming Answer */}
                {currentAnswer && !isThinking && (
                    <div className="bubble-window__streaming">
                        <MessageBubble
                            message={{
                                id: 'streaming',
                                role: 'assistant',
                                content: currentAnswer
                            }}
                            compact={true}
                            isStreaming={true}
                        />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bubble-window__error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions && suggestions.buttons && suggestions.buttons.length > 0 && (
                <div className="bubble-window__suggestions">
                    {suggestions.buttons.slice(0, 3).map((suggestion, index) => (
                        <button
                            key={index}
                            className="bubble-window__suggestion-btn"
                            onClick={() => onSuggestionClick(suggestion)}
                        >
                            {suggestion.label || suggestion.text}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form className="bubble-window__input-form" onSubmit={handleSubmit}>
                <div className="bubble-window__input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="bubble-window__input"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    className="bubble-window__send-btn"
                    disabled={!inputValue.trim() || isLoading}
                    aria-label="Send message"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </form>

            {/* Footer */}
            <div className="bubble-window__footer">
                <span className="bubble-window__powered">Powered by AI</span>
                <button
                    className="bubble-window__expand-link"
                    onClick={onExpand}
                >
                    Open full view
                </button>
            </div>
        </div>
    );
});

BubbleWindow.displayName = 'BubbleWindow';

export default BubbleWindow;
