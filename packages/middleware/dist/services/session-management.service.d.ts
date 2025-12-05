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
import type { ISessionStore, IConversationStore, Session, StoredMessage } from './interfaces';
import type { DualResponse, ChatMessage } from '../types/core.types';
/**
 * Session Management Configuration
 */
export interface SessionManagerConfig {
    contextWindowSize?: number;
    sessionTTL?: number;
    cleanupInterval?: number;
    enableAutoCleanup?: boolean;
    maxSessions?: number;
    onSessionExpired?: (sessionId: string) => void;
}
export declare class SessionManagementService {
    private sessionStore;
    private conversationStore;
    private config;
    private cleanupTimer;
    private cleanupStats;
    constructor(sessionStore: ISessionStore, conversationStore: IConversationStore, config?: SessionManagerConfig);
    /**
     * Start automatic session cleanup
     */
    startAutoCleanup(): void;
    /**
     * Stop automatic session cleanup
     */
    stopAutoCleanup(): void;
    /**
     * Check if auto-cleanup is running
     */
    isAutoCleanupRunning(): boolean;
    /**
     * Initialize or retrieve session
     * Generates new session ID if not provided
     */
    initializeSession(sessionId?: string): Promise<Session>;
    /**
     * Add user message to conversation
     */
    addUserMessage(sessionId: string, content: string): Promise<StoredMessage>;
    /**
     * Store assistant response with metadata
     */
    storeAssistantResponse(sessionId: string, response: DualResponse, toolResults?: Record<string, unknown>): Promise<StoredMessage>;
    /**
     * Get context window for LLM (last N messages)
     * Used for conversation history in LLM prompt
     */
    getContextWindow(sessionId: string, size?: number): Promise<ChatMessage[]>;
    /**
     * Get full conversation history
     */
    getConversationHistory(sessionId: string, limit?: number): Promise<StoredMessage[]>;
    /**
     * Get session with full context
     */
    getSessionWithContext(sessionId: string): Promise<{
        session: Session | null;
        messageCount: number;
        contextWindow: ChatMessage[];
    } | null>;
    /**
     * Delete conversation
     */
    deleteConversation(sessionId: string): Promise<void>;
    /**
     * Clean up expired sessions (TTL-based)
     */
    cleanupExpiredSessions(ttlMs?: number): Promise<number>;
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
    };
    /**
     * Force immediate cleanup (for testing/admin)
     */
    forceCleanup(): Promise<number>;
    /**
     * Get current configuration
     */
    getConfig(): SessionManagerConfig;
    /**
     * Destroy service - stop timers and cleanup
     */
    destroy(): void;
    /**
     * Get statistics about all sessions
     */
    getSessionStats(): Promise<{
        totalSessions: number;
        totalMessages: number;
        averageMessagesPerSession: number;
    }>;
}
//# sourceMappingURL=session-management.service.d.ts.map