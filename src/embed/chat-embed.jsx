/**
 * Chat Embed Entry Point
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * This file is the entry point for embedding the unified chat widget
 * into any website page. It auto-initializes when loaded.
 *
 * Usage in HTML:
 *   <script src="/superchat/build/chat-embed.js"></script>
 *   <script>
 *     AIChatWidget.init({
 *       agentName: 'My Assistant',
 *       greeting: 'Hello! How can I help?',
 *       primaryColor: '#667eea'
 *     });
 *   </script>
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatContainer from '../components/ChatContainer';

// Global namespace
window.AIChatWidget = window.AIChatWidget || {};

/**
 * Initialize chat widget
 *
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - DOM container ID (default: auto-create)
 * @param {string} options.defaultMode - 'bubble' or 'super' (default: 'bubble')
 * @param {string} options.agentName - Agent display name
 * @param {string} options.greeting - Welcome message
 * @param {string} options.primaryColor - Primary brand color
 * @param {string} options.position - 'bottom-right' or 'bottom-left'
 * @param {boolean} options.allowCollapse - Allow collapsing Super to Bubble
 * @param {Function} options.onModeChange - Callback when mode changes
 */
window.AIChatWidget.init = function(options = {}) {
    const {
        containerId = null,
        defaultMode = 'bubble',
        agentName = 'AI Assistant',
        greeting = '',
        primaryColor = '#667eea',
        position = 'bottom-right',
        allowCollapse = true,
        onModeChange = null
    } = options;

    // Get or create container
    let container;
    if (containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('[AIChatWidget] Container not found:', containerId);
            return;
        }
    } else {
        // Auto-create container
        container = document.createElement('div');
        container.id = 'ai-chat-widget-root';
        document.body.appendChild(container);
    }

    // Create React root
    const root = createRoot(container);

    // Render
    root.render(
        <React.StrictMode>
            <ChatContainer
                defaultMode={defaultMode}
                agentName={agentName}
                greeting={greeting}
                primaryColor={primaryColor}
                position={position}
                allowCollapse={allowCollapse}
                onModeChange={onModeChange}
            />
        </React.StrictMode>
    );

    // Store root for cleanup
    window.AIChatWidget._root = root;
    window.AIChatWidget._container = container;

    console.log('[AIChatWidget] Initialized successfully');
    return window.AIChatWidget;
};

/**
 * Destroy chat widget
 */
window.AIChatWidget.destroy = function() {
    if (window.AIChatWidget._root) {
        window.AIChatWidget._root.unmount();
        window.AIChatWidget._root = null;
    }

    if (window.AIChatWidget._container && !window.AIChatWidget._containerWasProvided) {
        window.AIChatWidget._container.remove();
        window.AIChatWidget._container = null;
    }

    console.log('[AIChatWidget] Destroyed');
};

/**
 * Open chat programmatically
 */
window.AIChatWidget.open = function() {
    // Dispatch custom event that ChatContainer listens to
    window.dispatchEvent(new CustomEvent('ai-chat-open'));
};

/**
 * Close chat programmatically
 */
window.AIChatWidget.close = function() {
    window.dispatchEvent(new CustomEvent('ai-chat-close'));
};

/**
 * Expand to Super Chat programmatically
 */
window.AIChatWidget.expand = function() {
    window.dispatchEvent(new CustomEvent('ai-chat-expand'));
};

/**
 * Send message programmatically
 * @param {string} message
 */
window.AIChatWidget.sendMessage = function(message) {
    window.dispatchEvent(new CustomEvent('ai-chat-send', { detail: { message } }));
};

// Auto-initialize if data attributes present
document.addEventListener('DOMContentLoaded', () => {
    const autoInitScript = document.querySelector('script[data-ai-chat-auto-init]');
    if (autoInitScript) {
        const options = {
            agentName: autoInitScript.dataset.agentName,
            greeting: autoInitScript.dataset.greeting,
            primaryColor: autoInitScript.dataset.primaryColor,
            position: autoInitScript.dataset.position,
            defaultMode: autoInitScript.dataset.defaultMode
        };

        // Filter undefined
        Object.keys(options).forEach(key => {
            if (options[key] === undefined) delete options[key];
        });

        window.AIChatWidget.init(options);
    }
});

export default window.AIChatWidget;
