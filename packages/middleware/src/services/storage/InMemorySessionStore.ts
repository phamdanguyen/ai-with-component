/**
 * InMemorySessionStore
 *
 * In-memory session storage with LRU (Least Recently Used) eviction
 * Pattern: Strategy pattern with eviction policy
 * SOLID: Single Responsibility - only manages session lifecycle
 */

import type { ISessionStore, Session } from '../interfaces';

export class InMemorySessionStore implements ISessionStore {
  private sessions: Map<string, Session> = new Map();
  private accessIndex: Map<string, number> = new Map();
  private accessCounter: number = 0;
  private maxSessions: number;

  constructor(maxSessions: number = 100) {
    this.maxSessions = maxSessions;
  }

  async createSession(sessionId: string, metadata?: Record<string, any>): Promise<Session> {
    // Evict LRU session if at capacity
    if (this.sessions.size >= this.maxSessions) {
      this.evictLRUSession();
    }

    const session: Session = {
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

  async getSession(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);

    if (session) {
      // Update access tracking
      session.lastAccessedAt = new Date();
      this.accessIndex.set(sessionId, this.accessCounter++);
    }

    return session || null;
  }

  async updateSession(sessionId: string, data: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update fields
    // Allow explicit lastAccessedAt override (for testing/manual control)
    const updated: Session = {
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

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.accessIndex.delete(sessionId);

    console.log(`[SessionStore] Deleted session: ${sessionId}`);
  }

  async listSessions(limit?: number): Promise<Session[]> {
    const sessions = Array.from(this.sessions.values());

    if (limit) {
      return sessions.slice(0, limit);
    }

    return sessions;
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    return this.sessions.has(sessionId);
  }

  async touch(sessionId: string): Promise<void> {
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
  private evictLRUSession(): void {
    let lruSessionId: string | null = null;
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
  getStats(): {
    totalSessions: number;
    maxSessions: number;
    utilizationPercent: number;
  } {
    return {
      totalSessions: this.sessions.size,
      maxSessions: this.maxSessions,
      utilizationPercent: (this.sessions.size / this.maxSessions) * 100,
    };
  }
}
