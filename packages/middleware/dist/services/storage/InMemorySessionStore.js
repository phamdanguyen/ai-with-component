"use strict";
/**
 * InMemorySessionStore
 *
 * In-memory session storage with LRU (Least Recently Used) eviction
 * Pattern: Strategy pattern with eviction policy
 * SOLID: Single Responsibility - only manages session lifecycle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySessionStore = void 0;
class InMemorySessionStore {
    constructor(maxSessions = 100) {
        this.sessions = new Map();
        this.accessIndex = new Map();
        this.accessCounter = 0;
        this.maxSessions = maxSessions;
    }
    async createSession(sessionId, metadata) {
        // Evict LRU session if at capacity
        if (this.sessions.size >= this.maxSessions) {
            this.evictLRUSession();
        }
        const session = {
            id: sessionId,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessedAt: new Date(),
            messages: [],
            metadata,
        };
        this.sessions.set(sessionId, session);
        this.accessIndex.set(sessionId, this.accessCounter++);
        console.log(`[SessionStore] Created session: ${sessionId}`);
        return session;
    }
    async getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            // Update access tracking
            session.lastAccessedAt = new Date();
            this.accessIndex.set(sessionId, this.accessCounter++);
        }
        return session || null;
    }
    async updateSession(sessionId, data) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // Update fields
        // Allow explicit lastAccessedAt override (for testing/manual control)
        const updated = {
            ...session,
            ...data,
            id: sessionId, // Prevent ID changes
            createdAt: session.createdAt, // Prevent creation date changes
            updatedAt: new Date(),
            lastAccessedAt: data.lastAccessedAt ?? new Date(),
        };
        this.sessions.set(sessionId, updated);
        this.accessIndex.set(sessionId, this.accessCounter++);
        return updated;
    }
    async deleteSession(sessionId) {
        this.sessions.delete(sessionId);
        this.accessIndex.delete(sessionId);
        console.log(`[SessionStore] Deleted session: ${sessionId}`);
    }
    async listSessions(limit) {
        const sessions = Array.from(this.sessions.values());
        if (limit) {
            return sessions.slice(0, limit);
        }
        return sessions;
    }
    async sessionExists(sessionId) {
        return this.sessions.has(sessionId);
    }
    async touch(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastAccessedAt = new Date();
            this.accessIndex.set(sessionId, this.accessCounter++);
        }
    }
    /**
     * Evict least recently used session
     * Private method for internal LRU management
     */
    evictLRUSession() {
        let lruSessionId = null;
        let minAccessCount = Infinity;
        // Find least recently accessed session
        for (const [sessionId, accessCount] of this.accessIndex.entries()) {
            if (accessCount < minAccessCount) {
                minAccessCount = accessCount;
                lruSessionId = sessionId;
            }
        }
        if (lruSessionId) {
            this.sessions.delete(lruSessionId);
            this.accessIndex.delete(lruSessionId);
            console.log(`[SessionStore] Evicted LRU session: ${lruSessionId}`);
        }
    }
    /**
     * Get storage statistics (for debugging)
     */
    getStats() {
        return {
            totalSessions: this.sessions.size,
            maxSessions: this.maxSessions,
            utilizationPercent: (this.sessions.size / this.maxSessions) * 100,
        };
    }
}
exports.InMemorySessionStore = InMemorySessionStore;
//# sourceMappingURL=InMemorySessionStore.js.map