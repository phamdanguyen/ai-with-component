/**
 * useChat - React hook for AI Chat functionality
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * Provides complete chat functionality for React components.
 * Used by both Bubble Chat and Super Chat components.
 *
 * Features:
 * - Message state management
 * - SSE streaming integration
 * - Thinking/typing indicators
 * - Tool execution tracking
 * - GenUI component handling
 * - Session management
 *
 * Usage:
 *   const {
 *     messages,
 *     isLoading,
 *     isThinking,
 *     send,
 *     clear
 *   } = useChat({ source: 'bubble' });
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import SSEChatClient from '../services/SSEChatClient';
import SessionManager from '../services/SessionManager';

/**
 * Chat hook options
 * @typedef {Object} UseChatOptions
 * @property {string} source - 'bubble' or 'super'
 * @property {string} endpoint - API endpoint (default: '/ai-chat/stream')
 * @property {Function} onTransitionRequest - Called when AI suggests transition
 */

/**
 * Message object
 * @typedef {Object} Message
 * @property {string} id - Unique message ID
 * @property {string} role - 'user' | 'assistant' | 'system'
 * @property {string} content - Message text
 * @property {string} timestamp - ISO timestamp
 * @property {Object} thinking - Thinking data (for assistant)
 * @property {Array} toolCalls - Tool execution data
 * @property {Object} component - GenUI component data
 * @property {Object} suggestions - AI suggestions
 */

const useChat = (options = {}) => {
    const {
        source = 'bubble',
        // Use existing endpoint until unified API is activated
        // TODO: Change to '/ai-chat/stream' after Odoo restart
        endpoint = '/website/chat/stream',
        onTransitionRequest = null,
        onError = null
    } = options;

    // State
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingText, setThinkingText] = useState('');
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [activeTools, setActiveTools] = useState([]);
    const [ragStatus, setRagStatus] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);

    // Refs
    const clientRef = useRef(null);
    const answerBufferRef = useRef('');

    // Initialize session on mount
    useEffect(() => {
        const session = SessionManager.getOrCreate(source);
        setSessionId(session.sessionId);

        // Load existing messages
        const existingMessages = SessionManager.getMessages();
        if (existingMessages.length > 0) {
            setMessages(existingMessages);
        }

        // Check for pending transition
        const transition = SessionManager.completeTransition(source);
        if (transition) {
            console.log('[useChat] Transition received:', transition);
            setMessages(transition.messages || []);
        }

        // Initialize SSE client
        clientRef.current = new SSEChatClient(endpoint, { source });

        return () => {
            if (clientRef.current) {
                clientRef.current.close();
            }
        };
    }, [source, endpoint]);

    /**
     * Send message to AI
     *
     * @param {string} text - User message
     * @returns {Promise}
     */
    const send = useCallback(async (text) => {
        if (!text || !text.trim() || isLoading) {
            return;
        }

        setError(null);
        setIsLoading(true);
        setIsThinking(false);
        setThinkingText('');
        setCurrentAnswer('');
        answerBufferRef.current = '';
        setActiveTools([]);
        setRagStatus(null);
        setSuggestions(null);

        // Add user message
        const userMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: text.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        SessionManager.addMessage(userMessage);

        // Prepare assistant message placeholder
        const assistantId = `assistant_${Date.now()}`;

        try {
            await clientRef.current.send(text.trim(), {
                onThinking: (thinkingChunk) => {
                    setIsThinking(true);
                    setThinkingText(prev => prev + thinkingChunk);
                },

                onAnswer: (answerChunk) => {
                    setIsThinking(false);
                    answerBufferRef.current += answerChunk;
                    setCurrentAnswer(answerBufferRef.current);
                },

                onRAG: (ragData) => {
                    setRagStatus(ragData);
                },

                onToolCall: (toolData) => {
                    setActiveTools(prev => [...prev, {
                        ...toolData,
                        id: `tool_${Date.now()}`
                    }]);
                },

                onToolResult: (resultData) => {
                    setActiveTools(prev =>
                        prev.map(tool =>
                            tool.tool === resultData.tool
                                ? { ...tool, ...resultData }
                                : tool
                        )
                    );
                },

                onComponent: (componentData) => {
                    // Component will be added to final message
                    setMessages(prev => {
                        const lastIdx = prev.length - 1;
                        if (lastIdx >= 0 && prev[lastIdx].id === assistantId) {
                            const updated = [...prev];
                            updated[lastIdx] = {
                                ...updated[lastIdx],
                                component: componentData
                            };
                            return updated;
                        }
                        return prev;
                    });
                },

                onSuggestions: (suggestionsData) => {
                    setSuggestions(suggestionsData);
                },

                onHandoff: (handoffData) => {
                    // Handle handoff to human agent
                    console.log('[useChat] Handoff requested:', handoffData);
                },

                onDone: (result) => {
                    // Finalize assistant message
                    const finalContent = answerBufferRef.current;

                    const assistantMessage = {
                        id: assistantId,
                        role: 'assistant',
                        content: finalContent,
                        timestamp: new Date().toISOString(),
                        thinking: thinkingText || null,
                        toolCalls: activeTools.length > 0 ? activeTools : null,
                        sessionId: result.sessionId
                    };

                    // Replace placeholder or add new
                    setMessages(prev => {
                        const existing = prev.find(m => m.id === assistantId);
                        if (existing) {
                            return prev.map(m =>
                                m.id === assistantId
                                    ? { ...m, ...assistantMessage }
                                    : m
                            );
                        }
                        return [...prev, assistantMessage];
                    });

                    SessionManager.addMessage(assistantMessage);

                    // Clear streaming state - prevents duplicate display
                    setCurrentAnswer('');
                    setIsLoading(false);
                    setIsThinking(false);
                },

                onError: (err) => {
                    console.error('[useChat] Error:', err);
                    setError(err.message || 'An error occurred');
                    setIsLoading(false);
                    setIsThinking(false);

                    if (onError) {
                        onError(err);
                    }
                }
            }, sessionId);

        } catch (err) {
            console.error('[useChat] Send failed:', err);
            setError(err.message || 'Failed to send message');
            setIsLoading(false);
            setIsThinking(false);

            if (onError) {
                onError(err);
            }
        }
    }, [isLoading, sessionId, thinkingText, activeTools, onError]);

    /**
     * Clear chat history
     */
    const clear = useCallback(() => {
        setMessages([]);
        setThinkingText('');
        setCurrentAnswer('');
        setActiveTools([]);
        setRagStatus(null);
        setSuggestions(null);
        setError(null);
        SessionManager.clearMessages();
    }, []);

    /**
     * Reset session (new conversation)
     */
    const reset = useCallback(() => {
        clear();
        SessionManager.reset();
        const newSession = SessionManager.getOrCreate(source);
        setSessionId(newSession.sessionId);
    }, [clear, source]);

    /**
     * Prepare transition to another chat mode
     *
     * @param {string} targetSource - 'bubble' or 'super'
     * @returns {Object} Transfer data
     */
    const prepareTransition = useCallback((targetSource) => {
        return SessionManager.prepareTransition(source, targetSource);
    }, [source]);

    /**
     * Handle suggestion click
     *
     * @param {Object} suggestion - Suggestion button data
     */
    const handleSuggestion = useCallback((suggestion) => {
        if (suggestion.action === 'send_message') {
            send(suggestion.text || suggestion.label);
        } else if (suggestion.action === 'expand_chat' && onTransitionRequest) {
            onTransitionRequest('super');
        } else if (suggestion.action === 'open_url' && suggestion.url) {
            window.open(suggestion.url, suggestion.target || '_blank');
        }
    }, [send, onTransitionRequest]);

    return {
        // State
        messages,
        isLoading,
        isThinking,
        thinkingText,
        currentAnswer,
        activeTools,
        ragStatus,
        suggestions,
        sessionId,
        error,

        // Actions
        send,
        clear,
        reset,
        prepareTransition,
        handleSuggestion,

        // Utilities
        messageCount: messages.length,
        hasMessages: messages.length > 0,
        lastMessage: messages[messages.length - 1] || null
    };
};

export default useChat;
