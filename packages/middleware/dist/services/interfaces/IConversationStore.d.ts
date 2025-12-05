/**
 * IConversationStore Interface
 *
 * Abstraction for message storage within conversations
 * Handles message persistence, retrieval, and context window management
 */
import type { ComponentSpec } from '../../types/core.types';
export interface StoredMessage {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    componentSpec?: ComponentSpec;
    timestamp: string;
    toolResults?: Record<string, unknown>;
    metadata?: {
        modelUsed?: string;
        executionTime?: number;
        tokensUsed?: number;
    };
}
export interface IConversationStore {
    /**
     * Add message to conversation
     */
    addMessage(sessionId: string, message: Omit<StoredMessage, 'id' | 'sessionId'>): Promise<StoredMessage>;
    /**
     * Get messages from conversation with pagination
     */
    getMessages(sessionId: string, limit?: number, offset?: number): Promise<StoredMessage[]>;
    /**
     * Get last N messages (for context window)
     */
    getLastNMessages(sessionId: string, n: number): Promise<StoredMessage[]>;
    /**
     * Delete specific message
     */
    deleteMessage(sessionId: string, messageId: string): Promise<void>;
    /**
     * Clear entire conversation
     */
    clearConversation(sessionId: string): Promise<void>;
    /**
     * Get total message count in conversation
     */
    getConversationLength(sessionId: string): Promise<number>;
    /**
     * Search messages by content (for future)
     */
    searchMessages(sessionId: string, query: string): Promise<StoredMessage[]>;
}
//# sourceMappingURL=IConversationStore.d.ts.map