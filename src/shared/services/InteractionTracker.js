/**
 * InteractionTracker - Track user interactions for rich context capture
 *
 * Version: 1.0.0
 * Created: 2025-11-26
 * Part of: Sprint 2 - Story 2.1 (Structured Data Enhancement)
 *
 * Purpose:
 * - Track user interactions (clicks, scrolls, time spent)
 * - Capture component context for AI processing
 * - Calculate engagement signals for goal-aware AI
 *
 * Usage:
 *   InteractionTracker.startSession();
 *   InteractionTracker.trackProductView(productId, productData);
 *   InteractionTracker.trackButtonClick('buy', componentContext);
 *   const signals = InteractionTracker.getUserSignals();
 */

const STORAGE_KEY = 'ai_interaction_data';

class InteractionTracker {
    // ============================================================
    // INTERNAL STATE
    // ============================================================

    static _data = {
        sessionStartTime: null,
        lastInteractionTime: null,
        interactions: [],
        productViews: [],
        componentInteractions: [],
        scrollDepth: 0,
        clickCount: 0,
        messageCount: 0,
        formInteractions: [],
    };

    static _initialized = false;

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * Initialize tracker for current session
     */
    static init() {
        if (this._initialized) return;

        // Load existing data
        const stored = this._getFromStorage();
        if (stored) {
            this._data = { ...this._data, ...stored };
        }

        // Set session start time if not exists
        if (!this._data.sessionStartTime) {
            this._data.sessionStartTime = Date.now();
        }

        // Setup event listeners
        this._setupScrollTracking();
        this._setupVisibilityTracking();

        this._initialized = true;
        console.log('[InteractionTracker] Initialized');
    }

    /**
     * Start a new tracking session
     */
    static startSession() {
        this._data = {
            sessionStartTime: Date.now(),
            lastInteractionTime: Date.now(),
            interactions: [],
            productViews: [],
            componentInteractions: [],
            scrollDepth: 0,
            clickCount: 0,
            messageCount: 0,
            formInteractions: [],
        };
        this._saveToStorage();
        console.log('[InteractionTracker] New session started');
    }

    // ============================================================
    // TRACKING METHODS
    // ============================================================

    /**
     * Track product view
     *
     * @param {number} productId - Product ID
     * @param {Object} productData - Product details
     */
    static trackProductView(productId, productData = {}) {
        this._ensureInitialized();

        const view = {
            productId,
            productData,
            timestamp: Date.now(),
            viewDuration: 0, // Updated on next interaction
        };

        // Update duration of previous view
        if (this._data.productViews.length > 0) {
            const lastView = this._data.productViews[this._data.productViews.length - 1];
            lastView.viewDuration = Date.now() - lastView.timestamp;
        }

        this._data.productViews.push(view);
        this._data.lastInteractionTime = Date.now();
        this._saveToStorage();

        console.log('[InteractionTracker] Product view:', productId);
    }

    /**
     * Track button/suggestion click
     *
     * @param {string} buttonId - Button identifier
     * @param {Object} context - Component context
     */
    static trackButtonClick(buttonId, context = {}) {
        this._ensureInitialized();

        const interaction = {
            type: 'button_click',
            buttonId,
            componentType: context.componentType || 'unknown',
            triggerComponent: context.triggerComponent || null,
            timestamp: Date.now(),
            timeFromSessionStart: Date.now() - this._data.sessionStartTime,
            timeFromLastInteraction: this._data.lastInteractionTime
                ? Date.now() - this._data.lastInteractionTime
                : 0,
            context,
        };

        this._data.interactions.push(interaction);
        this._data.componentInteractions.push(interaction);
        this._data.clickCount++;
        this._data.lastInteractionTime = Date.now();
        this._saveToStorage();

        console.log('[InteractionTracker] Button click:', buttonId);
        return interaction;
    }

    /**
     * Track form interaction
     *
     * @param {string} formId - Form identifier
     * @param {string} action - 'open', 'field_change', 'submit', 'cancel'
     * @param {Object} data - Form data
     */
    static trackFormInteraction(formId, action, data = {}) {
        this._ensureInitialized();

        const interaction = {
            formId,
            action,
            timestamp: Date.now(),
            data,
            timeFromSessionStart: Date.now() - this._data.sessionStartTime,
        };

        this._data.formInteractions.push(interaction);
        this._data.lastInteractionTime = Date.now();
        this._saveToStorage();

        console.log('[InteractionTracker] Form interaction:', formId, action);
        return interaction;
    }

    /**
     * Track message sent/received
     *
     * @param {string} role - 'user' or 'assistant'
     * @param {string} type - 'text', 'structured', etc.
     */
    static trackMessage(role, type = 'text') {
        this._ensureInitialized();

        const interaction = {
            type: 'message',
            role,
            messageType: type,
            timestamp: Date.now(),
            timeFromSessionStart: Date.now() - this._data.sessionStartTime,
        };

        this._data.interactions.push(interaction);
        this._data.messageCount++;
        this._data.lastInteractionTime = Date.now();
        this._saveToStorage();
    }

    /**
     * Track scroll depth
     *
     * @param {number} depth - Scroll depth percentage (0-100)
     */
    static trackScrollDepth(depth) {
        this._ensureInitialized();

        if (depth > this._data.scrollDepth) {
            this._data.scrollDepth = depth;
            this._saveToStorage();
        }
    }

    // ============================================================
    // USER SIGNALS (for AI context)
    // ============================================================

    /**
     * Get user engagement signals for AI
     *
     * @returns {Object} User signals for AI prompt enrichment
     */
    static getUserSignals() {
        this._ensureInitialized();

        const sessionDuration = Date.now() - (this._data.sessionStartTime || Date.now());
        const avgTimeBetweenInteractions = this._calculateAvgInteractionTime();

        return {
            engagement_score: this._calculateEngagementScore(),
            decision_speed: this._classifyDecisionSpeed(avgTimeBetweenInteractions),
            price_checked: this._hasCheckedPrice(),
            products_compared: this._getComparedProducts(),
            session_duration_seconds: Math.round(sessionDuration / 1000),
            total_clicks: this._data.clickCount,
            message_count: this._data.messageCount,
            scroll_depth: this._data.scrollDepth,
            products_viewed_count: this._data.productViews.length,
            avg_view_time_seconds: this._calculateAvgViewTime(),
        };
    }

    /**
     * Get session context for structured message
     *
     * @returns {Object} Session context
     */
    static getSessionContext() {
        this._ensureInitialized();

        return {
            products_viewed: this._data.productViews.map(v => ({
                id: v.productId,
                duration_seconds: Math.round((v.viewDuration || 0) / 1000),
            })),
            total_interactions: this._data.interactions.length,
            total_time_seconds: Math.round(
                (Date.now() - (this._data.sessionStartTime || Date.now())) / 1000
            ),
            last_interaction_type: this._getLastInteractionType(),
        };
    }

    /**
     * Get component context for the last interaction
     *
     * @returns {Object} Component context
     */
    static getLastComponentContext() {
        if (this._data.componentInteractions.length === 0) {
            return null;
        }
        return this._data.componentInteractions[
            this._data.componentInteractions.length - 1
        ];
    }

    /**
     * Build enriched structured message data
     *
     * @param {string} action - Action type
     * @param {Object} params - Action parameters
     * @param {Object} componentContext - Component that triggered the action
     * @returns {Object} Enriched structured data for backend
     */
    static buildStructuredData(action, params, componentContext = {}) {
        return {
            action,
            params,
            component_context: {
                component_type: componentContext.componentType || 'unknown',
                trigger_component: componentContext.triggerComponent || null,
                trigger_action: componentContext.triggerAction || action,
                product_id: componentContext.productId || null,
                product_viewed_time: this._getProductViewTime(componentContext.productId),
            },
            user_signals: this.getUserSignals(),
            session_context: this.getSessionContext(),
            timestamp: new Date().toISOString(),
        };
    }

    // ============================================================
    // PRIVATE HELPER METHODS
    // ============================================================

    static _ensureInitialized() {
        if (!this._initialized) {
            this.init();
        }
    }

    static _setupScrollTracking() {
        if (typeof window === 'undefined') return;

        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const depth = Math.round((scrolled / scrollHeight) * 100);
            this.trackScrollDepth(depth);
        }, { passive: true });
    }

    static _setupVisibilityTracking() {
        if (typeof document === 'undefined') return;

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // User left the page - finalize current view
                if (this._data.productViews.length > 0) {
                    const lastView = this._data.productViews[this._data.productViews.length - 1];
                    if (!lastView.viewDuration) {
                        lastView.viewDuration = Date.now() - lastView.timestamp;
                    }
                    this._saveToStorage();
                }
            }
        });
    }

    static _calculateEngagementScore() {
        // Score 0.0 - 1.0 based on multiple factors
        const factors = {
            clicks: Math.min(this._data.clickCount / 10, 1) * 0.3,
            messages: Math.min(this._data.messageCount / 5, 1) * 0.3,
            scroll: (this._data.scrollDepth / 100) * 0.2,
            products: Math.min(this._data.productViews.length / 3, 1) * 0.2,
        };

        return Math.round(
            (factors.clicks + factors.messages + factors.scroll + factors.products) * 100
        ) / 100;
    }

    static _calculateAvgInteractionTime() {
        if (this._data.interactions.length < 2) return 0;

        const times = this._data.interactions.map(i => i.timestamp).sort((a, b) => a - b);
        let totalDiff = 0;
        for (let i = 1; i < times.length; i++) {
            totalDiff += times[i] - times[i - 1];
        }
        return totalDiff / (times.length - 1);
    }

    static _classifyDecisionSpeed(avgTime) {
        if (avgTime < 5000) return 'fast';        // < 5 seconds
        if (avgTime < 15000) return 'normal';     // 5-15 seconds
        return 'deliberate';                       // > 15 seconds
    }

    static _hasCheckedPrice() {
        return this._data.interactions.some(i =>
            i.buttonId === 'get_pricing' ||
            i.buttonId === 'calculate' ||
            (i.context && i.context.action === 'price')
        );
    }

    static _getComparedProducts() {
        // Return product IDs that were viewed for comparison
        const viewedIds = this._data.productViews.map(v => v.productId);
        return [...new Set(viewedIds)].slice(0, 5); // Unique, max 5
    }

    static _calculateAvgViewTime() {
        if (this._data.productViews.length === 0) return 0;

        const totalDuration = this._data.productViews.reduce((sum, v) => {
            return sum + (v.viewDuration || 0);
        }, 0);

        return Math.round(totalDuration / this._data.productViews.length / 1000);
    }

    static _getProductViewTime(productId) {
        if (!productId) return 0;

        const view = this._data.productViews.find(v => v.productId === productId);
        return view ? Math.round((view.viewDuration || 0) / 1000) : 0;
    }

    static _getLastInteractionType() {
        if (this._data.interactions.length === 0) return null;
        return this._data.interactions[this._data.interactions.length - 1].type;
    }

    // ============================================================
    // STORAGE
    // ============================================================

    static _saveToStorage() {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
        } catch (e) {
            console.warn('[InteractionTracker] Storage save failed:', e);
        }
    }

    static _getFromStorage() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('[InteractionTracker] Storage read failed:', e);
            return null;
        }
    }
}

export default InteractionTracker;
