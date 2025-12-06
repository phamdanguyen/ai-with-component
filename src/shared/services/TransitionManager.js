/**
 * TransitionManager - Handles seamless transitions between Bubble and Super Chat
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * Manages the visual and data transition between compact (Bubble) and
 * expanded (Super) chat modes without page reload.
 *
 * Features:
 * - Smooth CSS animations
 * - State preservation during transition
 * - Scroll position restoration
 * - Input draft preservation
 * - Fallback handling
 */

import SessionManager from './SessionManager';

class TransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.transitionCallbacks = new Set();
        this.currentMode = 'bubble'; // 'bubble' or 'super'
    }

    /**
     * Register callback for transition events
     * @param {Function} callback - (event, data) => void
     * @returns {Function} Unsubscribe function
     */
    onTransition(callback) {
        this.transitionCallbacks.add(callback);
        return () => this.transitionCallbacks.delete(callback);
    }

    /**
     * Emit transition event to all listeners
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    _emit(event, data) {
        this.transitionCallbacks.forEach(cb => {
            try {
                cb(event, data);
            } catch (e) {
                console.error('[TransitionManager] Callback error:', e);
            }
        });
    }

    /**
     * Start transition from Bubble to Super Chat
     *
     * @param {Object} options - Transition options
     * @param {HTMLElement} options.bubbleElement - Bubble chat DOM element
     * @param {HTMLElement} options.targetContainer - Target container for Super Chat
     * @param {Object} options.uiState - Current UI state to preserve
     * @returns {Promise<Object>} Transition result
     */
    async expandToSuper(options = {}) {
        if (this.isTransitioning) {
            console.warn('[TransitionManager] Transition already in progress');
            return { success: false, error: 'Transition in progress' };
        }

        this.isTransitioning = true;
        this._emit('transition:start', { from: 'bubble', to: 'super' });

        try {
            const {
                bubbleElement,
                targetContainer,
                uiState = {}
            } = options;

            // 1. Save current state
            const transferData = SessionManager.prepareTransition('bubble', 'super');
            SessionManager.saveUIState({
                ...uiState,
                transitionType: 'expand',
                timestamp: Date.now()
            });

            // 2. Animate bubble expansion
            if (bubbleElement) {
                await this._animateExpand(bubbleElement);
            }

            // 3. Update mode
            this.currentMode = 'super';

            // 4. Emit completion
            this._emit('transition:complete', {
                from: 'bubble',
                to: 'super',
                transferData,
                targetContainer
            });

            this.isTransitioning = false;
            return { success: true, transferData };

        } catch (error) {
            console.error('[TransitionManager] Expand failed:', error);
            this.isTransitioning = false;
            this._emit('transition:error', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Start transition from Super Chat back to Bubble
     *
     * @param {Object} options - Transition options
     * @returns {Promise<Object>} Transition result
     */
    async collapseToTubble(options = {}) {
        if (this.isTransitioning) {
            return { success: false, error: 'Transition in progress' };
        }

        this.isTransitioning = true;
        this._emit('transition:start', { from: 'super', to: 'bubble' });

        try {
            const { superElement, uiState = {} } = options;

            // 1. Save state
            const transferData = SessionManager.prepareTransition('super', 'bubble');
            SessionManager.saveUIState({
                ...uiState,
                transitionType: 'collapse',
                timestamp: Date.now()
            });

            // 2. Animate collapse
            if (superElement) {
                await this._animateCollapse(superElement);
            }

            // 3. Update mode
            this.currentMode = 'bubble';

            // 4. Emit completion
            this._emit('transition:complete', {
                from: 'super',
                to: 'bubble',
                transferData
            });

            this.isTransitioning = false;
            return { success: true, transferData };

        } catch (error) {
            console.error('[TransitionManager] Collapse failed:', error);
            this.isTransitioning = false;
            this._emit('transition:error', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Animate expansion from bubble to fullscreen
     * @param {HTMLElement} element
     * @returns {Promise}
     */
    _animateExpand(element) {
        return new Promise((resolve) => {
            // Get current position
            const rect = element.getBoundingClientRect();

            // Create overlay for animation
            const overlay = document.createElement('div');
            overlay.className = 'chat-transition-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            `;

            document.body.appendChild(overlay);

            // Hide original
            element.style.opacity = '0';

            // Trigger animation
            requestAnimationFrame(() => {
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.borderRadius = '0';
            });

            // Cleanup after animation
            setTimeout(() => {
                overlay.remove();
                element.style.opacity = '';
                resolve();
            }, 400);
        });
    }

    /**
     * Animate collapse from fullscreen to bubble
     * @param {HTMLElement} element
     * @returns {Promise}
     */
    _animateCollapse(element) {
        return new Promise((resolve) => {
            // Get target bubble position (bottom-right corner)
            const targetRect = {
                top: window.innerHeight - 570, // 500px height + 70px from bottom
                left: window.innerWidth - 380, // 360px width + 20px from right
                width: 360,
                height: 500
            };

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'chat-transition-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: white;
                border-radius: 0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            `;

            document.body.appendChild(overlay);
            element.style.opacity = '0';

            // Trigger animation
            requestAnimationFrame(() => {
                overlay.style.top = `${targetRect.top}px`;
                overlay.style.left = `${targetRect.left}px`;
                overlay.style.width = `${targetRect.width}px`;
                overlay.style.height = `${targetRect.height}px`;
                overlay.style.borderRadius = '16px';
            });

            // Cleanup
            setTimeout(() => {
                overlay.remove();
                element.style.opacity = '';
                resolve();
            }, 400);
        });
    }

    /**
     * Get current chat mode
     * @returns {string} 'bubble' or 'super'
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Check if transition is in progress
     * @returns {boolean}
     */
    isInTransition() {
        return this.isTransitioning;
    }

    /**
     * Restore UI state after transition
     * @returns {Object} Saved UI state
     */
    restoreUIState() {
        const state = SessionManager.getUIState();
        SessionManager.clearUIState();
        return state;
    }
}

// Singleton instance
const transitionManager = new TransitionManager();

export default transitionManager;
