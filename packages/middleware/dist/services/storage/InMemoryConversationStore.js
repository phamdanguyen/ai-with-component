"use strict";
/**
 * InMemoryConversationStore
 *
 * In-memory message storage for conversations within sessions
 * Stores messages with full metadata for context window management
 * Pattern: Repository pattern for data persistence
 * SOLID: Single Responsibility - only manages conversation messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryConversationStore = void 0;
class InMemoryConversationStore {
    constructor() {
        this.conversations = new Map();
    }
    async addMessage(sessionId, message) {
        // Initialize conversation if needed
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
        }
        const messages = this.conversations.get(sessionId);
        const storedMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            sessionId,
        };
        messages.push(storedMessage);
        console.log(`[ConversationStore] Added message to session ${sessionId}:`, `role=${storedMessage.role} id=${storedMessage.id}`);
        return storedMessage;
    }
    async getMessages(sessionId, limit, offset = 0) {
        const messages = this.conversations.get(sessionId) || [];
        // Apply offset and limit
        let result = messages.slice(offset);
        if (limit) {
            result = result.slice(0, limit);
        }
        return result;
    }
    async getLastNMessages(sessionId, n) {
        const messages = this.conversations.get(sessionId) || [];
        if (messages.length <= n) {
            return messages;
        }
        return messages.slice(messages.length - n);
    }
    async deleteMessage(sessionId, messageId) {
        const messages = this.conversations.get(sessionId);
        if (!messages) {
            return;
        }
        const index = messages.findIndex((msg) => msg.id === messageId);
        if (index !== -1) {
            messages.splice(index, 1);
            console.log(`[ConversationStore] Deleted message ${messageId} from session ${sessionId}`);
        }
    }
    async clearConversation(sessionId) {
        this.conversations.delete(sessionId);
        console.log(`[ConversationStore] Cleared conversation for session ${sessionId}`);
    }
    async getConversationLength(sessionId) {
        const messages = this.conversations.get(sessionId) || [];
        return messages.length;
    }
    async searchMessages(sessionId, query) {
        const messages = this.conversations.get(sessionId) || [];
        const lowerQuery = query.toLowerCase();
        return messages.filter((msg) => msg.content.toLowerCase().includes(lowerQuery) ||
            msg.role.toLowerCase().includes(lowerQuery));
    }
    /**
     * Get all conversations (for debugging/admin)
     */
    getAllConversations() {
        return new Map(this.conversations);
    }
    /**
     * Get statistics about stored conversations
     */
    getStats() {
        const totalConversations = this.conversations.size;
        let totalMessages = 0;
        for (const messages of this.conversations.values()) {
            totalMessages += messages.length;
        }
        return {
            totalConversations,
            totalMessages,
            averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
        };
    }
}
exports.InMemoryConversationStore = InMemoryConversationStore;
//# sourceMappingURL=InMemoryConversationStore.js.map