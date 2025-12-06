/**
 * Shared Module - Unified exports for AI Chat components
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * This module provides all shared functionality for both
 * Bubble Chat and Super Chat React components.
 *
 * Usage:
 *   import { useChat, SSEChatClient, SessionManager } from './shared';
 */

// Services
export { default as SSEChatClient } from './services/SSEChatClient';
export { default as SessionManager } from './services/SessionManager';
export { default as TransitionManager } from './services/TransitionManager';

// Hooks
export { default as useChat } from './hooks/useChat';

// Re-export for convenience
export const CHAT_SOURCES = {
    BUBBLE: 'bubble',
    SUPER: 'super'
};

export const MESSAGE_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
};

export const SSE_EVENT_TYPES = {
    THINKING: 'thinking',
    ANSWER: 'answer',
    RAG: 'rag',
    TOOL_CALL: 'tool_call',
    TOOL_RESULT: 'tool_result',
    COMPONENT: 'component',
    SUGGESTIONS: 'suggestions',
    HANDOFF: 'handoff',
    DONE: 'done',
    ERROR: 'error'
};
