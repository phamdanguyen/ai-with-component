/**
 * BubbleChat - AI Chat Bubble Widget with Direct SSE Integration
 * Version: 9.5.0 - Dynamic Suggestion Chips from API
 *
 * This version integrates SSE streaming directly in the component
 * without the complex useChat hook that was causing React Error #174.
 *
 * v9.5.0: Fetches suggestion chips from /superchat/api/init-config
 * - Loads chips from chat.channel configuration in Admin
 * - Falls back to DEFAULT_SUGGESTIONS if API fails
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import BubbleToggle from './BubbleToggle';
import SSEChatClient from '../../shared/services/SSEChatClient';
import SessionManager from '../../shared/services/SessionManager';
import './BubbleChat.css';

// SVG icons as strings
const AI_AVATAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
const USER_AVATAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Generate ENTIRE message HTML to avoid SVG namespace contamination
const getAIMessageHTML = (content) => `
<div class="bubble-window__ai-response">
    <div class="bubble-window__ai-avatar">${AI_AVATAR_SVG}</div>
    <div class="bubble-window__ai-content">
        <div class="bubble-message__content">${escapeHtml(content)}</div>
    </div>
</div>`;

const getUserMessageHTML = (content) => `
<div class="bubble-window__user-response">
    <div class="bubble-window__user-content">
        <div class="bubble-message__content">${escapeHtml(content)}</div>
    </div>
    <div class="bubble-window__user-avatar">${USER_AVATAR_SVG}</div>
</div>`;

const getStreamingHTML = (content) => `
<div class="bubble-window__ai-response">
    <div class="bubble-window__ai-avatar">${AI_AVATAR_SVG}</div>
    <div class="bubble-window__ai-content">
        <div class="bubble-message__content bubble-message__content--streaming">
            ${escapeHtml(content)}<span class="typing-cursor">|</span>
        </div>
    </div>
</div>`;

const getLoadingHTML = () => `
<div class="bubble-window__ai-response">
    <div class="bubble-window__ai-avatar">${AI_AVATAR_SVG}</div>
    <div class="bubble-window__ai-content">
        <div class="bubble-window__thinking">
            <div class="bubble-window__thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>
</div>`;

// Default suggestions shown when chat first opens (Vietnamese with diacritics)
const DEFAULT_SUGGESTIONS = [
    { label: 'Tư vấn sản phẩm', text: 'Tôi muốn được tư vấn về sản phẩm' },
    { label: 'Báo giá dịch vụ', text: 'Cho tôi xem bảng giá dịch vụ' },
    { label: 'Hỗ trợ kỹ thuật', text: 'Tôi cần hỗ trợ kỹ thuật' },
    { label: 'Liên hệ nhân viên', text: 'Tôi muốn liên hệ với nhân viên tư vấn' }
];

const BubbleChat = ({
    position = 'bottom-right',
    greeting = '',
    agentName = 'AI Assistant',
    primaryColor = '#6750A4',
    onExpand = null,
    defaultSuggestions = DEFAULT_SUGGESTIONS
}) => {
    // =====================================================
    // HOOKS SECTION - All hooks at top level, unconditional
    // =====================================================

    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Chat State
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [suggestions, setSuggestions] = useState(null);
    const [error, setError] = useState(null);

    // v9.5.0: Dynamic config from API
    const [initialChips, setInitialChips] = useState(null);
    const [dynamicGreeting, setDynamicGreeting] = useState(null);
    const [configLoaded, setConfigLoaded] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const sseClientRef = useRef(null);
    const sessionIdRef = useRef(null);

    // Initialize SSE client and session on mount
    useEffect(() => {
        // Get or create session
        const session = SessionManager.getOrCreate('bubble');
        sessionIdRef.current = session.sessionId;

        // Load existing messages
        const existingMessages = SessionManager.getMessages();
        if (existingMessages.length > 0) {
            setMessages(existingMessages);
        }

        // Create SSE client
        sseClientRef.current = new SSEChatClient('/website/chat/stream', {
            source: 'bubble'
        });

        // Cleanup on unmount
        return () => {
            if (sseClientRef.current) {
                sseClientRef.current.close();
            }
        };
    }, []); // Empty deps - only run once on mount

    // v9.5.0: Fetch dynamic config from API
    useEffect(() => {
        const fetchInitConfig = async () => {
            try {
                const response = await fetch('/superchat/api/init-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ params: {} })
                });

                const data = await response.json();

                if (data.result && data.result.success) {
                    // Convert API format to component format
                    // API returns: {label, message, icon}
                    // Component expects: {label, text}
                    const chips = (data.result.initial_chips || []).map(chip => ({
                        label: chip.label,
                        text: chip.message || chip.label,
                        icon: chip.icon
                    }));

                    if (chips.length > 0) {
                        setInitialChips(chips);
                        console.log('[BubbleChat] Loaded dynamic chips:', chips.length);
                    }

                    if (data.result.greeting_message) {
                        setDynamicGreeting(data.result.greeting_message);
                    }
                }
            } catch (err) {
                console.warn('[BubbleChat] Failed to load init config, using defaults:', err.message);
            } finally {
                setConfigLoaded(true);
            }
        };

        fetchInitConfig();
    }, []); // Run once on mount

    // Scroll to bottom effect
    useEffect(() => {
        if (messagesEndRef.current && isOpen) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, currentAnswer, isOpen]);

    // =====================================================
    // CALLBACKS SECTION
    // =====================================================

    const toggleChat = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleSend = useCallback(async () => {
        const text = inputValue.trim();
        if (!text || isLoading) return;

        // Clear input immediately
        setInputValue('');
        setError(null);
        setIsLoading(true);
        setCurrentAnswer('');
        setSuggestions(null);

        // Add user message
        const userMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        SessionManager.addMessage(userMessage);

        // Buffer for streaming answer
        let answerBuffer = '';

        try {
            await sseClientRef.current.send(text, {
                onAnswer: (chunk) => {
                    answerBuffer += chunk;
                    setCurrentAnswer(answerBuffer);
                },

                onSuggestions: (suggestionsData) => {
                    // Handle both array and object formats
                    if (Array.isArray(suggestionsData)) {
                        setSuggestions(suggestionsData);
                    } else if (suggestionsData && suggestionsData.buttons) {
                        setSuggestions(suggestionsData.buttons);
                    } else if (suggestionsData && suggestionsData.data) {
                        setSuggestions(suggestionsData.data);
                    }
                },

                onDone: (result) => {
                    // Create final assistant message
                    const assistantMessage = {
                        id: `assistant_${Date.now()}`,
                        role: 'assistant',
                        content: answerBuffer,
                        timestamp: new Date().toISOString()
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                    SessionManager.addMessage(assistantMessage);

                    // Clear streaming state
                    setCurrentAnswer('');
                    setIsLoading(false);
                },

                onError: (err) => {
                    console.error('[BubbleChat] SSE Error:', err);
                    setError(err.message || 'An error occurred');
                    setIsLoading(false);
                    setCurrentAnswer('');
                }
            }, sessionIdRef.current);

        } catch (err) {
            console.error('[BubbleChat] Send failed:', err);
            setError(err.message || 'Failed to send message');
            setIsLoading(false);
            setCurrentAnswer('');
        }
    }, [inputValue, isLoading]);

    const handleClear = useCallback(() => {
        setMessages([]);
        setCurrentAnswer('');
        setSuggestions(null);
        setError(null);
        SessionManager.clearMessages();
    }, []);

    const handleExpandClick = useCallback(() => {
        if (onExpand) {
            onExpand();
        }
    }, [onExpand]);

    const onSuggestionClick = useCallback((suggestion) => {
        // Handle both string and object suggestions
        let text = '';
        if (typeof suggestion === 'string') {
            text = suggestion;
        } else if (suggestion && suggestion.text) {
            text = suggestion.text;
        } else if (suggestion && suggestion.label) {
            text = suggestion.label;
        }

        if (text) {
            setInputValue(text);
            // Auto-send after short delay
            setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} };
                // We need to send directly since inputValue won't be updated yet
                if (text.trim() && !isLoading) {
                    setInputValue('');
                    // Directly trigger send logic
                    sendMessage(text);
                }
            }, 100);
        }
    }, [isLoading]);

    // Helper function for sending (used by suggestion click)
    const sendMessage = useCallback(async (text) => {
        if (!text || isLoading) return;

        setError(null);
        setIsLoading(true);
        setCurrentAnswer('');
        setSuggestions(null);

        const userMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        SessionManager.addMessage(userMessage);

        let answerBuffer = '';

        try {
            await sseClientRef.current.send(text, {
                onAnswer: (chunk) => {
                    answerBuffer += chunk;
                    setCurrentAnswer(answerBuffer);
                },
                onSuggestions: (suggestionsData) => {
                    if (Array.isArray(suggestionsData)) {
                        setSuggestions(suggestionsData);
                    } else if (suggestionsData && suggestionsData.buttons) {
                        setSuggestions(suggestionsData.buttons);
                    }
                },
                onDone: () => {
                    const assistantMessage = {
                        id: `assistant_${Date.now()}`,
                        role: 'assistant',
                        content: answerBuffer,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                    SessionManager.addMessage(assistantMessage);
                    setCurrentAnswer('');
                    setIsLoading(false);
                },
                onError: (err) => {
                    setError(err.message || 'An error occurred');
                    setIsLoading(false);
                    setCurrentAnswer('');
                }
            }, sessionIdRef.current);
        } catch (err) {
            setError(err.message || 'Failed to send');
            setIsLoading(false);
            setCurrentAnswer('');
        }
    }, [isLoading]);

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        handleSend();
    }, [handleSend]);

    const onInputChange = useCallback((e) => {
        setInputValue(e.target.value);
    }, []);

    // =====================================================
    // RENDER SECTION - No hooks after this point
    // =====================================================

    const hasMessages = messages.length > 0;
    // v9.5.0: Use dynamic greeting from API if available
    const effectiveGreeting = dynamicGreeting || greeting;
    const showGreeting = effectiveGreeting && !hasMessages && !currentAnswer;
    const isStreaming = isLoading && currentAnswer;
    // v9.5.0: Use dynamic chips from API, fallback to prop
    const effectiveChips = initialChips || defaultSuggestions;

    return (
        <div
            className={`bubble-chat bubble-chat--${position}`}
            style={{ '--bubble-primary-color': primaryColor }}
        >
            {/* Always render window, use CSS to show/hide - fixes SVG namespace bug */}
            <div className="bubble-window" style={{ display: isOpen ? 'flex' : 'none' }}>
                    {/* Header */}
                    <div className="bubble-window__header">
                        <div className="bubble-window__header-info">
                            <span className="bubble-window__agent-name">{agentName}</span>
                            <span className="bubble-window__status">
                                {isLoading ? 'Typing...' : 'Online'}
                            </span>
                        </div>
                        <div className="bubble-window__header-actions">
                            {onExpand && (
                                <button
                                    className="bubble-window__action-btn"
                                    onClick={handleExpandClick}
                                    title="Expand"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15,3 21,3 21,9" />
                                        <polyline points="9,21 3,21 3,15" />
                                        <line x1="21" y1="3" x2="14" y2="10" />
                                        <line x1="3" y1="21" x2="10" y2="14" />
                                    </svg>
                                </button>
                            )}
                            <button
                                className="bubble-window__action-btn"
                                onClick={handleClear}
                                title="Clear chat"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3,6 5,6 21,6" />
                                    <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2" />
                                </svg>
                            </button>
                            <button
                                className="bubble-window__action-btn"
                                onClick={toggleChat}
                                title="Close"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area - ALL elements use CSS display to avoid SVG namespace bug */}
                    <div className="bubble-window__messages">
                        {/* Greeting - Always render, use CSS to show/hide */}
                        {/* v9.5.0: Use effectiveGreeting (dynamic from API or prop) */}
                        <div
                            className="bubble-window__greeting"
                            style={{ display: showGreeting ? 'block' : 'none' }}
                        >
                            <p>{effectiveGreeting}</p>
                        </div>

                        {/* Messages - Using dangerouslySetInnerHTML for ENTIRE message to fix SVG namespace */}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                dangerouslySetInnerHTML={{
                                    __html: msg.role === 'assistant'
                                        ? getAIMessageHTML(msg.content)
                                        : getUserMessageHTML(msg.content)
                                }}
                            />
                        ))}

                        {/* Streaming Response - Always render, use CSS to show/hide */}
                        <div
                            style={{ display: isStreaming ? 'block' : 'none' }}
                            dangerouslySetInnerHTML={{ __html: getStreamingHTML(currentAnswer) }}
                        />

                        {/* Loading Indicator - Always render, use CSS to show/hide */}
                        <div
                            style={{ display: (isLoading && !isStreaming) ? 'block' : 'none' }}
                            dangerouslySetInnerHTML={{ __html: getLoadingHTML() }}
                        />

                        {/* Error Display - Always render, use CSS to show/hide */}
                        <div
                            className="bubble-window__error"
                            style={{ display: error ? 'block' : 'none' }}
                        >
                            <span>Error: {error}</span>
                        </div>

                        {/* Default Suggestions - Always render, use CSS to show/hide */}
                        {/* v9.5.0: Use effectiveChips (dynamic from API or prop fallback) */}
                        <div
                            className="bubble-window__suggestions bubble-window__suggestions--default"
                            style={{ display: (showGreeting && effectiveChips && effectiveChips.length > 0 && !isLoading) ? 'flex' : 'none' }}
                        >
                            {(effectiveChips || []).map((suggestion, index) => {
                                const label = typeof suggestion === 'string'
                                    ? suggestion
                                    : (suggestion.label || suggestion.text);
                                const icon = typeof suggestion === 'object' ? suggestion.icon : null;
                                return (
                                    <button
                                        key={`default-${index}`}
                                        className="bubble-window__suggestion-btn"
                                        onClick={() => onSuggestionClick(suggestion)}
                                    >
                                        {icon && <i className={`fa fa-${icon}`}></i>}
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Response Suggestions - Always render, use CSS to show/hide */}
                        <div
                            className="bubble-window__suggestions"
                            style={{ display: (suggestions && suggestions.length > 0 && !isLoading && !showGreeting) ? 'flex' : 'none' }}
                        >
                            {(suggestions || []).map((suggestion, index) => {
                                const label = typeof suggestion === 'string'
                                    ? suggestion
                                    : (suggestion.label || suggestion.text);
                                return (
                                    <button
                                        key={index}
                                        className="bubble-window__suggestion-btn"
                                        onClick={() => onSuggestionClick(suggestion)}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form className="bubble-window__input-form" onSubmit={onSubmit}>
                        <div className="bubble-window__input-wrapper">
                            <input
                                type="text"
                                className="bubble-window__input"
                                placeholder="Nhập tin nhắn của bạn..."
                                value={inputValue}
                                onChange={onInputChange}
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bubble-window__send-btn"
                            disabled={!inputValue.trim() || isLoading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </form>
                </div>

            <BubbleToggle
                isOpen={isOpen}
                hasUnread={false}
                onClick={toggleChat}
                primaryColor={primaryColor}
            />
        </div>
    );
};

export default BubbleChat;
