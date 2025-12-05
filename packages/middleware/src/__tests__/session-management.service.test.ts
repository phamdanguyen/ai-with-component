/**
 * SessionManagementService Tests
 *
 * Story 5-2: Session Lifecycle Management
 * Coverage: Session CRUD, Cleanup, TTL, Auto-cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SessionManagementService,
  SessionManagerConfig,
} from '../services/session-management.service';
import { InMemorySessionStore } from '../services/storage/InMemorySessionStore';
import { InMemoryConversationStore } from '../services/storage/InMemoryConversationStore';

describe('SessionManagementService', () => {
  let service: SessionManagementService;
  let sessionStore: InMemorySessionStore;
  let conversationStore: InMemoryConversationStore;

  beforeEach(() => {
    sessionStore = new InMemorySessionStore(100);
    conversationStore = new InMemoryConversationStore();

    // Disable auto-cleanup for tests by default
    service = new SessionManagementService(sessionStore, conversationStore, {
      enableAutoCleanup: false,
      sessionTTL: 60000, // 1 minute for testing
      contextWindowSize: 5,
    });
  });

  afterEach(() => {
    service.destroy();
  });

  describe('Session Initialization', () => {
    it('should create a new session', async () => {
      const session = await service.initializeSession();

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^session_/);
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    it('should create session with provided ID', async () => {
      const session = await service.initializeSession('custom-session-123');

      expect(session.id).toBe('custom-session-123');
    });

    it('should return existing session if ID exists', async () => {
      const session1 = await service.initializeSession('existing-session');
      const session2 = await service.initializeSession('existing-session');

      expect(session1.id).toBe(session2.id);
      expect(session1.createdAt.getTime()).toBe(session2.createdAt.getTime());
    });
  });

  describe('Message Management', () => {
    it('should add user message to conversation', async () => {
      const session = await service.initializeSession('test-session');
      const message = await service.addUserMessage(
        session.id,
        'Hello, assistant!'
      );

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, assistant!');
      expect(message.sessionId).toBe('test-session');
    });

    it('should store assistant response', async () => {
      const session = await service.initializeSession('test-session');

      const response = {
        textSummary: 'Hello! How can I help?',
        componentSpec: {
          id: 'comp-1',
          type: 'card' as const,
          props: { title: 'Test' },
        },
        metadata: {
          textModel: 'gemini-flash',
          executionTime: 500,
        },
      };

      const message = await service.storeAssistantResponse(
        session.id,
        response as any
      );

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Hello! How can I help?');
      expect(message.componentSpec).toBeDefined();
    });

    it('should get context window', async () => {
      const session = await service.initializeSession('test-session');

      // Add multiple messages
      await service.addUserMessage(session.id, 'Message 1');
      await service.addUserMessage(session.id, 'Message 2');
      await service.addUserMessage(session.id, 'Message 3');

      const context = await service.getContextWindow(session.id, 2);

      expect(context).toHaveLength(2);
      expect(context[0].content).toBe('Message 2');
      expect(context[1].content).toBe('Message 3');
    });

    it('should get conversation history', async () => {
      const session = await service.initializeSession('test-session');

      await service.addUserMessage(session.id, 'First message');
      await service.addUserMessage(session.id, 'Second message');

      const history = await service.getConversationHistory(session.id);

      expect(history).toHaveLength(2);
    });
  });

  describe('Session Deletion', () => {
    it('should delete session and conversation', async () => {
      const session = await service.initializeSession('to-delete');
      await service.addUserMessage(session.id, 'Test message');

      await service.deleteConversation(session.id);

      const deletedSession = await sessionStore.getSession('to-delete');
      expect(deletedSession).toBeNull();
    });
  });

  describe('Session Cleanup (TTL)', () => {
    it('should cleanup expired sessions', async () => {
      // Create sessions
      const session1 = await service.initializeSession('session-1');
      const session2 = await service.initializeSession('session-2');

      // Manually set old lastAccessedAt
      await sessionStore.updateSession(session1.id, {
        lastAccessedAt: new Date(Date.now() - 120000), // 2 minutes ago
      });

      // Cleanup with 1 minute TTL
      const cleaned = await service.cleanupExpiredSessions(60000);

      expect(cleaned).toBe(1);

      // session-1 should be deleted, session-2 should remain
      const s1 = await sessionStore.getSession('session-1');
      const s2 = await sessionStore.getSession('session-2');

      expect(s1).toBeNull();
      expect(s2).not.toBeNull();
    });

    it('should use config TTL when not specified', async () => {
      const config = service.getConfig();
      expect(config.sessionTTL).toBe(60000);
    });

    it('should call onSessionExpired callback', async () => {
      const expiredSessions: string[] = [];

      const serviceWithCallback = new SessionManagementService(
        sessionStore,
        conversationStore,
        {
          enableAutoCleanup: false,
          sessionTTL: 60000,
          onSessionExpired: (id) => expiredSessions.push(id),
        }
      );

      const session = await serviceWithCallback.initializeSession('will-expire');
      await sessionStore.updateSession(session.id, {
        lastAccessedAt: new Date(Date.now() - 120000),
      });

      await serviceWithCallback.cleanupExpiredSessions();

      expect(expiredSessions).toContain('will-expire');
      serviceWithCallback.destroy();
    });

    it('should track cleanup statistics', async () => {
      const session = await service.initializeSession('stats-test');
      await sessionStore.updateSession(session.id, {
        lastAccessedAt: new Date(Date.now() - 120000),
      });

      await service.cleanupExpiredSessions(60000);

      const stats = service.getCleanupStats();
      expect(stats.totalExpired).toBe(1);
      expect(stats.lastCleanup).toBeInstanceOf(Date);
    });

    it('should continue cleanup even if one session fails', async () => {
      // Create multiple sessions
      await service.initializeSession('session-a');
      await service.initializeSession('session-b');

      // Set both as expired
      await sessionStore.updateSession('session-a', {
        lastAccessedAt: new Date(Date.now() - 120000),
      });
      await sessionStore.updateSession('session-b', {
        lastAccessedAt: new Date(Date.now() - 120000),
      });

      // Should clean both without throwing
      const cleaned = await service.cleanupExpiredSessions(60000);
      expect(cleaned).toBe(2);
    });
  });

  describe('Auto-Cleanup', () => {
    it('should not auto-cleanup when disabled', () => {
      expect(service.isAutoCleanupRunning()).toBe(false);
    });

    it('should start and stop auto-cleanup', () => {
      service.startAutoCleanup();
      expect(service.isAutoCleanupRunning()).toBe(true);

      service.stopAutoCleanup();
      expect(service.isAutoCleanupRunning()).toBe(false);
    });

    it('should only start one cleanup timer', () => {
      service.startAutoCleanup();
      service.startAutoCleanup(); // Second call should be ignored

      expect(service.isAutoCleanupRunning()).toBe(true);
      service.stopAutoCleanup();
    });

    it('should auto-cleanup on interval', async () => {
      vi.useFakeTimers();

      const autoService = new SessionManagementService(
        sessionStore,
        conversationStore,
        {
          enableAutoCleanup: true,
          cleanupInterval: 1000, // 1 second for test
          sessionTTL: 500,
        }
      );

      // Create expired session
      const session = await autoService.initializeSession('auto-test');
      await sessionStore.updateSession(session.id, {
        lastAccessedAt: new Date(Date.now() - 1000),
      });

      // Advance timer
      await vi.advanceTimersByTimeAsync(1100);

      // Session should be cleaned up
      const s = await sessionStore.getSession('auto-test');
      expect(s).toBeNull();

      autoService.destroy();
      vi.useRealTimers();
    });
  });

  describe('Session Statistics', () => {
    it('should return session statistics', async () => {
      await service.initializeSession('stats-1');
      await service.initializeSession('stats-2');
      await service.addUserMessage('stats-1', 'Message 1');
      await service.addUserMessage('stats-1', 'Message 2');
      await service.addUserMessage('stats-2', 'Message 3');

      const stats = await service.getSessionStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMessages).toBe(3);
      expect(stats.averageMessagesPerSession).toBe(1.5);
    });

    it('should return zero stats for empty service', async () => {
      const stats = await service.getSessionStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMessages).toBe(0);
      expect(stats.averageMessagesPerSession).toBe(0);
    });
  });

  describe('Session with Context', () => {
    it('should get session with full context', async () => {
      const session = await service.initializeSession('context-test');
      await service.addUserMessage(session.id, 'Test message');

      const result = await service.getSessionWithContext(session.id);

      expect(result).not.toBeNull();
      expect(result?.session.id).toBe('context-test');
      expect(result?.messageCount).toBe(1);
      expect(result?.contextWindow).toHaveLength(1);
    });

    it('should return null for non-existent session', async () => {
      const result = await service.getSessionWithContext('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const defaultService = new SessionManagementService(
        sessionStore,
        conversationStore
      );

      const config = defaultService.getConfig();
      expect(config.contextWindowSize).toBe(5);
      expect(config.sessionTTL).toBe(7 * 24 * 60 * 60 * 1000);
      expect(config.enableAutoCleanup).toBe(true);

      defaultService.destroy();
    });

    it('should merge custom configuration', () => {
      const config = service.getConfig();

      expect(config.sessionTTL).toBe(60000);
      expect(config.enableAutoCleanup).toBe(false);
    });
  });

  describe('Force Cleanup', () => {
    it('should force immediate cleanup', async () => {
      const session = await service.initializeSession('force-test');
      await sessionStore.updateSession(session.id, {
        lastAccessedAt: new Date(Date.now() - 120000),
      });

      const cleaned = await service.forceCleanup();
      expect(cleaned).toBe(1);
    });
  });
});
