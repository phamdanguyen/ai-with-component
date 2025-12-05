/**
 * InMemoryConversationStore
 *
 * In-memory message storage for conversations within sessions
 * Stores messages with full metadata for context window management
 * Pattern: Repository pattern for data persistence
 * SOLID: Single Responsibility - only manages conversation messages
 */
import type { IConversationStore, StoredMessage } from '../interfaces';
export declare class InMemoryConversationStore implements IConversationStore {
    private conversations;
    addMessage(sessionId: string, message: Omit<StoredMessage, 'id' | 'sessionId'>): Promise<StoredMessage>;
    getMessages(sessionId: string, limit?: number, offset?: number): Promise<StoredMessage[]>;
    getLastNMessages(sessionId: string, n: number): Promise<StoredMessage[]>;
    deleteMessage(sessionId: string, messageId: string): Promise<void>;
    clearConversation(sessionId: string): Promise<void>;
    getConversationLength(sessionId: string): Promise<number>;
    searchMessages(sessionId: string, query: string): Promise<StoredMessage[]>;
    /**
     * Get all conversations (for debugging/admin)
     */
    getAllConversations(): Map<string, StoredMessage[]>;
    /**
     * Get statistics about stored conversations
     */
    getStats(): {
        totalConversations: number;
        totalMessages: number;
        averageMessagesPerConversation: number;
    };
}
//# sourceMappingURL=InMemoryConversationStore.d.ts.map