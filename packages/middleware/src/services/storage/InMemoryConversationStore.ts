/**
 * InMemoryConversationStore
 *
 * In-memory message storage for conversations within sessions
 * Stores messages with full metadata for context window management
 * Pattern: Repository pattern for data persistence
 * SOLID: Single Responsibility - only manages conversation messages
 */

import type { IConversationStore, StoredMessage } from '../interfaces';

export class InMemoryConversationStore implements IConversationStore {
  private conversations: Map<string, StoredMessage[]> = new Map();

  async addMessage(
    sessionId: string,
    message: Omit<StoredMessage, 'id' | 'sessionId'>
  ): Promise<StoredMessage> {
    // Initialize conversation if needed
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }

    const messages = this.conversations.get(sessionId)!;
    const storedMessage: StoredMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      sessionId,
    };

    messages.push(storedMessage);

    console.log(
      `[ConversationStore] Added message to session ${sessionId}:`,
      `role=${storedMessage.role} id=${storedMessage.id}`
    );

    return storedMessage;
  }

  async getMessages(
    sessionId: string,
    limit?: number,
    offset: number = 0
  ): Promise<StoredMessage[]> {
    const messages = this.conversations.get(sessionId) || [];

    // Apply offset and limit
    let result = messages.slice(offset);
    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  async getLastNMessages(sessionId: string, n: number): Promise<StoredMessage[]> {
    const messages = this.conversations.get(sessionId) || [];

    if (messages.length <= n) {
      return messages;
    }

    return messages.slice(messages.length - n);
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<void> {
    const messages = this.conversations.get(sessionId);

    if (!messages) {
      return;
    }

    const index = messages.findIndex((msg) => msg.id === messageId);

    if (index !== -1) {
      messages.splice(index, 1);
      console.log(
        `[ConversationStore] Deleted message ${messageId} from session ${sessionId}`
      );
    }
  }

  async clearConversation(sessionId: string): Promise<void> {
    this.conversations.delete(sessionId);

    console.log(`[ConversationStore] Cleared conversation for session ${sessionId}`);
  }

  async getConversationLength(sessionId: string): Promise<number> {
    const messages = this.conversations.get(sessionId) || [];
    return messages.length;
  }

  async searchMessages(sessionId: string, query: string): Promise<StoredMessage[]> {
    const messages = this.conversations.get(sessionId) || [];
    const lowerQuery = query.toLowerCase();

    return messages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(lowerQuery) ||
        msg.role.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all conversations (for debugging/admin)
   */
  getAllConversations(): Map<string, StoredMessage[]> {
    return new Map(this.conversations);
  }

  /**
   * Get statistics about stored conversations
   */
  getStats(): {
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  } {
    const totalConversations = this.conversations.size;
    let totalMessages = 0;

    for (const messages of this.conversations.values()) {
      totalMessages += messages.length;
    }

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation:
        totalConversations > 0 ? totalMessages / totalConversations : 0,
    };
  }
}
