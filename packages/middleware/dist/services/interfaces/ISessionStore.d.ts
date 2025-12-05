/**
 * ISessionStore Interface
 *
 * Abstraction for session storage (in-memory or database)
 * Enables session creation, retrieval, and lifecycle management
 */
export interface Session {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt: Date;
    messages: string[];
    metadata?: Record<string, any>;
    componentState?: Record<string, any>;
    ttl?: number;
}
export interface ISessionStore {
    /**
     * Create a new session
     */
    createSession(sessionId: string, metadata?: Record<string, any>): Promise<Session>;
    /**
     * Retrieve existing session
     */
    getSession(sessionId: string): Promise<Session | null>;
    /**
     * Update session data
     */
    updateSession(sessionId: string, data: Partial<Session>): Promise<Session>;
    /**
     * Delete session completely
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * List sessions (for management)
     */
    listSessions(limit?: number): Promise<Session[]>;
    /**
     * Check if session exists
     */
    sessionExists(sessionId: string): Promise<boolean>;
    /**
     * Update last accessed time
     */
    touch(sessionId: string): Promise<void>;
}
//# sourceMappingURL=ISessionStore.d.ts.map