/**
 * SmartTriggerService - Intelligent transition triggers
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * Detects when to suggest or auto-trigger transition from Bubble to Super Chat.
 *
 * Triggers:
 * - Complex GenUI component detected (table, chart, form)
 * - Multiple products/items in response
 * - User shows buying intent
 * - Conversation length exceeds threshold
 * - AI explicitly suggests expansion
 */

class SmartTriggerService {
    constructor(options = {}) {
        this.options = {
            // Conversation thresholds
            maxBubbleMessages: 5, // Suggest expand after N messages
            maxBubbleTools: 2, // Suggest expand after N tool calls

            // Component size thresholds
            largeComponentThreshold: 3, // Items count for "large" component
            tableRowThreshold: 3, // Rows for table to trigger expand

            // Intent patterns
            buyingIntentPatterns: [
                /mua|buy|order|dat hang|thanh toan|payment/i,
                /gia|price|cost|chi phi|bao nhieu/i,
                /so sanh|compare|versus|vs/i,
                /chi tiet|detail|more info|xem them/i
            ],

            ...options
        };

        this.messageCount = 0;
        this.toolCallCount = 0;
    }

    /**
     * Analyze message and determine if transition should be triggered
     *
     * @param {Object} context - Analysis context
     * @param {Object} context.message - Latest message
     * @param {Array} context.messages - All messages
     * @param {Object} context.component - GenUI component (if any)
     * @param {Array} context.toolsExecuted - Tools executed
     * @param {Object} context.suggestions - AI suggestions
     * @returns {Object} { shouldTrigger, triggerType, reason, isAutomatic }
     */
    analyze(context) {
        const {
            message,
            messages = [],
            component,
            toolsExecuted = [],
            suggestions
        } = context;

        this.messageCount = messages.length;
        this.toolCallCount = toolsExecuted.length;

        // Check various trigger conditions
        const checks = [
            this._checkLargeComponent(component),
            this._checkConversationLength(messages),
            this._checkToolUsage(toolsExecuted),
            this._checkBuyingIntent(message),
            this._checkAISuggestion(suggestions),
            this._checkMultipleProducts(component)
        ];

        // Find first triggered condition
        const triggered = checks.find(c => c.shouldTrigger);

        if (triggered) {
            return triggered;
        }

        return {
            shouldTrigger: false,
            triggerType: null,
            reason: null,
            isAutomatic: false
        };
    }

    /**
     * Check if component is too large for Bubble Chat
     */
    _checkLargeComponent(component) {
        if (!component) {
            return { shouldTrigger: false };
        }

        const { componentType, props = {}, componentSize } = component;

        // Check explicit size marker
        if (componentSize === 'large' || componentSize === 'fullscreen') {
            return {
                shouldTrigger: true,
                triggerType: 'large_component',
                reason: `Component "${componentType}" requires expanded view`,
                isAutomatic: true // Auto-expand for large components
            };
        }

        // Check table rows
        if (componentType === 'table' || componentType === 'ProductTable') {
            const rows = props.data?.length || props.rows?.length || 0;
            if (rows >= this.options.tableRowThreshold) {
                return {
                    shouldTrigger: true,
                    triggerType: 'large_table',
                    reason: `Table has ${rows} rows - better viewed in expanded mode`,
                    isAutomatic: false // Suggest, don't auto
                };
            }
        }

        // Check gallery items
        if (componentType === 'gallery' || componentType === 'ProductGallery') {
            const items = props.items?.length || props.products?.length || 0;
            if (items >= this.options.largeComponentThreshold) {
                return {
                    shouldTrigger: true,
                    triggerType: 'large_gallery',
                    reason: `Gallery has ${items} items`,
                    isAutomatic: false
                };
            }
        }

        // Check forms
        if (componentType === 'form' || componentType === 'ContactForm' || componentType === 'QuoteForm') {
            return {
                shouldTrigger: true,
                triggerType: 'form_component',
                reason: 'Forms are easier to fill in expanded view',
                isAutomatic: false
            };
        }

        return { shouldTrigger: false };
    }

    /**
     * Check conversation length
     */
    _checkConversationLength(messages) {
        if (messages.length >= this.options.maxBubbleMessages) {
            return {
                shouldTrigger: true,
                triggerType: 'conversation_length',
                reason: `Conversation has ${messages.length} messages - consider expanding for better experience`,
                isAutomatic: false
            };
        }

        return { shouldTrigger: false };
    }

    /**
     * Check tool usage
     */
    _checkToolUsage(toolsExecuted) {
        if (toolsExecuted.length >= this.options.maxBubbleTools) {
            return {
                shouldTrigger: true,
                triggerType: 'tool_heavy',
                reason: `${toolsExecuted.length} tools used - expanded view shows more details`,
                isAutomatic: false
            };
        }

        return { shouldTrigger: false };
    }

    /**
     * Check for buying intent in user message
     */
    _checkBuyingIntent(message) {
        if (!message || message.role !== 'user') {
            return { shouldTrigger: false };
        }

        const content = message.content || '';

        for (const pattern of this.options.buyingIntentPatterns) {
            if (pattern.test(content)) {
                return {
                    shouldTrigger: true,
                    triggerType: 'buying_intent',
                    reason: 'User shows buying intent - expanded view provides better shopping experience',
                    isAutomatic: false
                };
            }
        }

        return { shouldTrigger: false };
    }

    /**
     * Check if AI suggested expansion
     */
    _checkAISuggestion(suggestions) {
        if (!suggestions || !suggestions.buttons) {
            return { shouldTrigger: false };
        }

        const expandButton = suggestions.buttons.find(b =>
            b.action === 'expand_chat' ||
            b.requiresExpand === true ||
            (b.label && /expand|mo rong|xem day du/i.test(b.label))
        );

        if (expandButton) {
            return {
                shouldTrigger: true,
                triggerType: 'ai_suggestion',
                reason: 'AI suggests expanding for better experience',
                isAutomatic: false
            };
        }

        return { shouldTrigger: false };
    }

    /**
     * Check for multiple products in component
     */
    _checkMultipleProducts(component) {
        if (!component) {
            return { shouldTrigger: false };
        }

        const { props = {} } = component;
        const products = props.products || props.items || props.data || [];

        if (Array.isArray(products) && products.length >= 3) {
            return {
                shouldTrigger: true,
                triggerType: 'multiple_products',
                reason: `${products.length} products found - expanded view shows all details`,
                isAutomatic: false
            };
        }

        return { shouldTrigger: false };
    }

    /**
     * Reset counters (call when session resets)
     */
    reset() {
        this.messageCount = 0;
        this.toolCallCount = 0;
    }
}

export default SmartTriggerService;
