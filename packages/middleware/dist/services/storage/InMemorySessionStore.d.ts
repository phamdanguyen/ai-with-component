/**
 * InMemorySessionStore
 *
 * In-memory session storage with LRU (Least Recently Used) eviction
 * Pattern: Strategy pattern with eviction policy
 * SOLID: Single Responsibility - only manages session lifecycle
 */
import type { ISessionStore, Session } from '../interfaces';
export declare class InMemorySessionStore implements ISessionStore {
    private sessions;
    private accessIndex;
    private accessCounter;
    private maxSessions;
    constructor(maxSessions?: number);
    createSession(sessionId: string, metadata?: Record<string, any>): Promise<Session>;
    getSession(sessionId: string): Promise<Session | null>;
    updateSession(sessionId: string, data: Partial<Session>): Promise<Session>;
    deleteSession(sessionId: string): Promise<void>;
    listSessions(limit?: number): Promise<Session[]>;
    sessionExists(sessionId: string): Promise<boolean>;
    touch(sessionId: string): Promise<void>;
    /**
     * Evict least recently used session
     * Private method for internal LRU management
     */
    private evictLRUSession;
    /**
     * Get storage statistics (for debugging)
     */
    getStats(): {
        totalSessions: number;
        maxSessions: number;
        utilizationPercent: number;
    };
}
//# sourceMappingURL=InMemorySessionStore.d.ts.map