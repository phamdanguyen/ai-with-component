/**
 * BubbleChat Widget Entry Point
 *
 * Version: 9.4.16
 * Updated: 2025-11-26
 *
 * This file mounts the React BubbleChat widget to replace the Vanilla JS
 * website_ai_chat_widget.js. It provides the same functionality but with
 * shared codebase with SuperChat.
 *
 * v9.4.16: Added defaultSuggestions support
 *
 * Usage in Odoo template:
 *   <script src="/odoo_ai_chat/static/superchat/build/bubble/bubble-widget.js"></script>
 *
 * The widget auto-initializes on DOMContentLoaded.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BubbleChat } from '../components/bubble';
import SessionManager from '../shared/services/SessionManager';
import '../components/bubble/BubbleChat.css';

// Global namespace
window.AIBubbleChat = window.AIBubbleChat || {};

/**
 * Initialize BubbleChat widget
 *
 * @param {Object} config - Configuration from Odoo
 * @param {string} config.agentName - Agent display name
 * @param {string} config.greeting - Welcome message
 * @param {string} config.primaryColor - Primary brand color
 * @param {string} config.position - 'bottom-right' or 'bottom-left'
 * @param {string} config.superChatUrl - URL for SuperChat expand
 * @param {Array} config.defaultSuggestions - Default suggestions shown on open
 */
window.AIBubbleChat.init = function(config = {}) {
    const {
        agentName = 'AI Assistant',
        greeting = '',
        primaryColor = '#6750A4',  // Material Design 3 Deep Purple
        position = 'bottom-right',
        superChatUrl = '/superchat/expand',
        defaultSuggestions = null  // Will use component default if null
    } = config;

    // Create container
    let container = document.getElementById('ai-bubble-chat-root');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ai-bubble-chat-root';
        document.body.appendChild(container);
    }

    // Handle expand to SuperChat
    const handleExpand = (transferData) => {
        // Save session state
        SessionManager.saveUIState({
            expandedFrom: 'bubble',
            timestamp: Date.now()
        });

        // Navigate to SuperChat with session
        const sessionId = SessionManager.getSessionId();
        const url = sessionId
            ? `${superChatUrl}?session=${sessionId}`
            : superChatUrl;

        window.location.href = url;
    };

    // Create React root and render
    // Note: StrictMode removed to avoid double-render issues with hooks
    const root = createRoot(container);
    root.render(
        <BubbleChat
            position={position}
            greeting={greeting}
            agentName={agentName}
            primaryColor={primaryColor}
            onExpand={handleExpand}
            defaultSuggestions={defaultSuggestions}
        />
    );

    // Store for cleanup
    window.AIBubbleChat._root = root;
    window.AIBubbleChat._container = container;

    console.log('[AIBubbleChat] React widget initialized');
    return window.AIBubbleChat;
};

/**
 * Destroy widget
 */
window.AIBubbleChat.destroy = function() {
    if (window.AIBubbleChat._root) {
        window.AIBubbleChat._root.unmount();
        window.AIBubbleChat._root = null;
    }
    if (window.AIBubbleChat._container) {
        window.AIBubbleChat._container.remove();
        window.AIBubbleChat._container = null;
    }
    console.log('[AIBubbleChat] Widget destroyed');
};

/**
 * Open chat programmatically
 */
window.AIBubbleChat.open = function() {
    window.dispatchEvent(new CustomEvent('bubble-chat-open'));
};

/**
 * Close chat programmatically
 */
window.AIBubbleChat.close = function() {
    window.dispatchEvent(new CustomEvent('bubble-chat-close'));
};

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for config from Odoo
    const configScript = document.getElementById('ai-bubble-chat-config');
    let config = {};

    if (configScript) {
        try {
            config = JSON.parse(configScript.textContent || '{}');
        } catch (e) {
            console.error('[AIBubbleChat] Config parse error:', e);
        }
    }

    // Also check data attributes on script tag
    const scriptTag = document.querySelector('script[data-bubble-chat]');
    if (scriptTag) {
        config = {
            ...config,
            agentName: scriptTag.dataset.agentName || config.agentName,
            greeting: scriptTag.dataset.greeting || config.greeting,
            primaryColor: scriptTag.dataset.primaryColor || config.primaryColor,
            position: scriptTag.dataset.position || config.position,
            superChatUrl: scriptTag.dataset.superChatUrl || config.superChatUrl
        };
    }

    // Initialize
    window.AIBubbleChat.init(config);
});

export default window.AIBubbleChat;
