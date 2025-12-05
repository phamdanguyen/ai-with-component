/**
 * SessionManagementService
 *
 * Orchestrates session and conversation management
 * Handles context window management for LLM context
 * Pattern: Facade pattern for session lifecycle
 * SOLID: Single Responsibility - manages session operations
 *
 * Features:
 * - Session CRUD operations
 * - Conversation history management
 * - Automatic session cleanup (TTL-based)
 * - LRU eviction support
 */

import type {
  ISessionStore,
  IConversationStore,
  Session,
  StoredMessage,
} from './interfaces';
import type { DualResponse, ChatMessage } from '../types/core.types';

/**
 * Session Management Configuration
 */
export interface SessionManagerConfig {
  contextWindowSize?: number;
  sessionTTL?: number; // milliseconds (default: 7 days)
  cleanupInterval?: number; // milliseconds (default: 1 hour)
  enableAutoCleanup?: boolean; // default: true
  maxSessions?: number; // max sessions before LRU eviction
  onSessionExpired?: (sessionId: string) => void;
}

const DEFAULT_CONFIG: Required<SessionManagerConfig> = {
  contextWindowSize: 5,
  sessionTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  enableAutoCleanup: true,
  maxSessions: 100,
  onSessionExpired: () => { },
};

export class SessionManagementService {
  private config: Required<SessionManagerConfig>;
  private cleanupTimer: any = null;
  private cleanupStats = {
    totalExpired: 0,
    lastCleanup: null as Date | null,
  };

  constructor(
    private sessionStore: ISessionStore,
    private conversationStore: IConversationStore,
    config: SessionManagerConfig = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Start auto-cleanup if enabled
    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Start automatic session cleanup
   */
  startAutoCleanup(): void {
    if (this.cleanupTimer) {
      return; // Already running
    }

    console.log(
      `[SessionManagement] Starting auto-cleanup (interval: ${this.config.cleanupInterval}ms)`
    );

    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        console.error('[SessionManagement] Auto-cleanup error:', error);
      }
    }, this.config.cleanupInterval);

    // Don't block process exit
    // if (this.cleanupTimer && this.cleanupTimer.unref) {
    //   this.cleanupTimer.unref();
    // }
  }

  /**
   * Stop automatic session cleanup
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log('[SessionManagement] Auto-cleanup stopped');
    }
  }

  /**
   * Check if auto-cleanup is running
   */
  isAutoCleanupRunning(): boolean {
    return this.cleanupTimer !== null;
  }

  /**
   * Initialize or retrieve session
   * Generates new session ID if not provided
   */
  async initializeSession(sessionId?: string): Promise<Session> {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const existing = await this.sessionStore.getSession(id);
    if (existing) {
      return existing;
    }

    return await this.sessionStore.createSession(id);
  }

  /**
   * Add user message to conversation
   */
  async addUserMessage(sessionId: string, content: string): Promise<StoredMessage> {
    const message: Omit<StoredMessage, 'id' | 'sessionId'> = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const stored = await this.conversationStore.addMessage(sessionId, message);

    // Update session
    const session = await this.sessionStore.getSession(sessionId);
    if (session) {
      if (!session.messages) {
        session.messages = [];
      }
      session.messages.push(stored.id);
      await this.sessionStore.updateSession(sessionId, { messages: session.messages });
    }

    return stored;
  }

  /**
   * Store assistant response with metadata
   */
  async storeAssistantResponse(
    sessionId: string,
    response: DualResponse,
    toolResults?: Record<string, unknown>
  ): Promise<StoredMessage> {
    const message: Omit<StoredMessage, 'id' | 'sessionId'> = {
      role: 'assistant',
      content: response.textSummary,
      componentSpec: response.componentSpec,
      timestamp: new Date().toISOString(),
      toolResults,
      metadata: {
        modelUsed: response.metadata?.textModel,
        executionTime: response.metadata?.executionTime,
      },
    };

    const stored = await this.conversationStore.addMessage(sessionId, message);

    // Update session
    const session = await this.sessionStore.getSession(sessionId);
    if (session) {
      if (!session.messages) {
        session.messages = [];
      }
      session.messages.push(stored.id);
      session.componentState = {
        ...session.componentState,
        [response.componentSpec.id]: response.componentSpec,
      };
      await this.sessionStore.updateSession(sessionId, {
        messages: session.messages,
        componentState: session.componentState,
      });
    }

    return stored;
  }

  /**
   * Get context window for LLM (last N messages)
   * Used for conversation history in LLM prompt
   */
  async getContextWindow(sessionId: string, size?: number): Promise<ChatMessage[]> {
    const windowSize = size || this.config.contextWindowSize;
    const messages = await this.conversationStore.getLastNMessages(sessionId, windowSize);

    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  }

  /**
   * Get full conversation history
   */
  async getConversationHistory(
    sessionId: string,
    limit?: number
  ): Promise<StoredMessage[]> {
    return await this.conversationStore.getMessages(sessionId, limit);
  }

  /**
   * Get session with full context
   */
  async getSessionWithContext(sessionId: string): Promise<{
    session: Session | null;
    messageCount: number;
    contextWindow: ChatMessage[];
  } | null> {
    const session = await this.sessionStore.getSession(sessionId);
    if (!session) {
      return null;
    }

    const messageCount = await this.conversationStore.getConversationLength(sessionId);
    const contextWindow = await this.getContextWindow(sessionId);

    return {
      session,
      messageCount,
      contextWindow,
    };
  }

  /**
   * Delete conversation
   */
  async deleteConversation(sessionId: string): Promise<void> {
    await this.conversationStore.clearConversation(sessionId);
    await this.sessionStore.deleteSession(sessionId);

    console.log(`[SessionManagement] Deleted session and conversation: ${sessionId}`);
  }

  /**
   * Clean up expired sessions (TTL-based)
   */
  async cleanupExpiredSessions(ttlMs?: number): Promise<number> {
    const ttl = ttlMs ?? this.config.sessionTTL;
    const sessions = await this.sessionStore.listSessions();
    let count = 0;
    const errors: string[] = [];

    for (const session of sessions) {
      try {
        const age = Date.now() - session.lastAccessedAt.getTime();
        if (age > ttl) {
          // Notify before deletion
          this.config.onSessionExpired(session.id);

          await this.deleteConversation(session.id);
          count++;
        }
      } catch (error) {
        // Continue cleanup even if one session fails
        errors.push(`Failed to delete session ${session.id}: ${error}`);
      }
    }

    // Update stats
    this.cleanupStats.totalExpired += count;
    this.cleanupStats.lastCleanup = new Date();

    if (count > 0) {
      console.log(`[SessionManagement] Cleaned up ${count} expired sessions`);
    }
    if (errors.length > 0) {
      console.error('[SessionManagement] Cleanup errors:', errors);
    }

    return count;
  }

  /**
   * Get cleanup statistics
   */
  getCleanupStats(): {
    totalExpired: number;
    lastCleanup: Date | null;
    isAutoCleanupRunning: boolean;
    config: {
      sessionTTL: number;
      cleanupInterval: number;
    };
  } {
    return {
      totalExpired: this.cleanupStats.totalExpired,
      lastCleanup: this.cleanupStats.lastCleanup,
      isAutoCleanupRunning: this.isAutoCleanupRunning(),
      config: {
        sessionTTL: this.config.sessionTTL,
        cleanupInterval: this.config.cleanupInterval,
      },
    };
  }

  /**
   * Force immediate cleanup (for testing/admin)
   */
  async forceCleanup(): Promise<number> {
    return this.cleanupExpiredSessions();
  }

  /**
   * Get current configuration
   */
  getConfig(): SessionManagerConfig {
    return { ...this.config };
  }

  /**
   * Destroy service - stop timers and cleanup
   */
  destroy(): void {
    this.stopAutoCleanup();
  }

  /**
   * Get statistics about all sessions
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
  }> {
    const sessions = await this.sessionStore.listSessions();
    let totalMessages = 0;

    for (const session of sessions) {
      const length = await this.conversationStore.getConversationLength(session.id);
      totalMessages += length;
    }

    return {
      totalSessions: sessions.length,
      totalMessages,
      averageMessagesPerSession:
        sessions.length > 0 ? totalMessages / sessions.length : 0,
    };
  }
}
