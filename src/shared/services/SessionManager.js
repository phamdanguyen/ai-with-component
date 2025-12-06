/**
 * SessionManager - Unified session management for AI Chat
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * Manages chat session state across Bubble and Super Chat.
 * Enables seamless transition without data loss.
 *
 * Features:
 * - Session ID generation and persistence
 * - Message history management
 * - State preservation during transition
 * - LocalStorage/SessionStorage abstraction
 *
 * Usage:
 *   const session = SessionManager.getOrCreate();
 *   SessionManager.addMessage({ role: 'user', content: 'Hello' });
 *   SessionManager.saveState({ scrollPosition: 100 });
 */

const STORAGE_KEY = 'ai_chat_session';
const MESSAGES_KEY = 'ai_chat_messages';
const STATE_KEY = 'ai_chat_ui_state';

class SessionManager {
    /**
     * Get or create session
     *
     * @param {string} source - 'bubble' or 'super'
     * @returns {Object} Session info { sessionId, visitorId, source, createdAt }
     */
    static getOrCreate(source = 'bubble') {
        let session = this._getFromStorage(STORAGE_KEY);

        if (!session || !session.sessionId) {
            // Create new session
            const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
            const randomPart = Math.random().toString(36).substring(2, 10);

            session = {
                sessionId: `chat_${timestamp}_${randomPart}`,
                visitorId: this._generateVisitorId(),
                source: source,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };

            this._saveToStorage(STORAGE_KEY, session);
            console.log('[SessionManager] New session created:', session.sessionId);
        } else {
            // Update last activity
            session.lastActivity = new Date().toISOString();
            session.source = source; // Update source on each access
            this._saveToStorage(STORAGE_KEY, session);
        }

        return session;
    }

    /**
     * Get current session ID
     * @returns {string|null}
     */
    static getSessionId() {
        const session = this._getFromStorage(STORAGE_KEY);
        return session ? session.sessionId : null;
    }

    /**
     * Generate unique visitor ID
     * @returns {string}
     */
    static _generateVisitorId() {
        // Check for existing visitor ID in cookie
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'ai_chat_visitor_id') {
                return value;
            }
        }

        // Generate new if not found
        return Math.random().toString(36).substring(2, 14);
    }

    /**
     * Add message to history
     *
     * @param {Object} message - { role: 'user'|'assistant', content: string, ... }
     */
    static addMessage(message) {
        const messages = this.getMessages();

        const newMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            ...message
        };

        messages.push(newMessage);

        // Limit to last 100 messages
        const limitedMessages = messages.slice(-100);
        this._saveToStorage(MESSAGES_KEY, limitedMessages);

        return newMessage;
    }

    /**
     * Get all messages for current session
     * @returns {Array}
     */
    static getMessages() {
        return this._getFromStorage(MESSAGES_KEY) || [];
    }

    /**
     * Clear message history
     */
    static clearMessages() {
        this._saveToStorage(MESSAGES_KEY, []);
    }

    /**
     * Save UI state for transition
     *
     * @param {Object} state - { scrollPosition, inputValue, expandedComponents, etc. }
     */
    static saveUIState(state) {
        const currentState = this._getFromStorage(STATE_KEY) || {};

        const newState = {
            ...currentState,
            ...state,
            savedAt: new Date().toISOString()
        };

        this._saveToStorage(STATE_KEY, newState);
        console.log('[SessionManager] UI state saved:', Object.keys(state));
    }

    /**
     * Get saved UI state
     * @returns {Object}
     */
    static getUIState() {
        return this._getFromStorage(STATE_KEY) || {};
    }

    /**
     * Clear UI state
     */
    static clearUIState() {
        this._saveToStorage(STATE_KEY, {});
    }

    /**
     * Prepare for transition (Bubble -> Super or vice versa)
     *
     * @param {string} fromSource - Current source
     * @param {string} toSource - Target source
     * @returns {Object} Transfer data
     */
    static prepareTransition(fromSource, toSource) {
        const session = this.getOrCreate(fromSource);
        const messages = this.getMessages();
        const uiState = this.getUIState();

        // Mark transition in progress
        const transferData = {
            sessionId: session.sessionId,
            fromSource,
            toSource,
            messageCount: messages.length,
            uiState,
            transferToken: Math.random().toString(36).substring(2, 18),
            timestamp: new Date().toISOString()
        };

        // Save transfer data (use sessionStorage for one-time transfers)
        this._saveToStorage('ai_chat_transfer', transferData, true);

        console.log(`[SessionManager] Transition prepared: ${fromSource} -> ${toSource}`);
        return transferData;
    }

    /**
     * Complete transition on target side
     *
     * @param {string} targetSource - Target source (should match toSource)
     * @returns {Object|null} Transfer data or null if no transition pending
     */
    static completeTransition(targetSource) {
        const transferData = this._getFromStorage('ai_chat_transfer', true);

        if (!transferData || transferData.toSource !== targetSource) {
            return null;
        }

        // Update session source
        const session = this.getOrCreate(targetSource);

        // Clear transfer data
        sessionStorage.removeItem('ai_chat_transfer');

        console.log(`[SessionManager] Transition completed: ${transferData.fromSource} -> ${targetSource}`);
        return {
            ...transferData,
            session,
            messages: this.getMessages()
        };
    }

    /**
     * Reset entire session (new conversation)
     */
    static reset() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MESSAGES_KEY);
        localStorage.removeItem(STATE_KEY);
        sessionStorage.removeItem('ai_chat_transfer'); // Keep transfer in sessionStorage
        console.log('[SessionManager] Session reset');
    }

    /**
     * Storage helpers
     * @param {string} key - Storage key
     * @param {boolean} useSessionStorage - Use sessionStorage instead of localStorage (default: false)
     */
    static _getFromStorage(key, useSessionStorage = false) {
        try {
            const storage = useSessionStorage ? sessionStorage : localStorage;
            const data = storage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[SessionManager] Storage read error:', e);
            return null;
        }
    }

    static _saveToStorage(key, data, useSessionStorage = false) {
        try {
            const storage = useSessionStorage ? sessionStorage : localStorage;
            storage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('[SessionManager] Storage write error:', e);
        }
    }

    /**
     * Export session data (for debugging/support)
     * @returns {Object}
     */
    static exportData() {
        return {
            session: this._getFromStorage(STORAGE_KEY),
            messages: this.getMessages(),
            uiState: this.getUIState(),
            exportedAt: new Date().toISOString()
        };
    }
}

export default SessionManager;
