/**
 * BubbleToggle - Floating toggle button for BubbleChat
 *
 * Version: 9.3.0
 */

import React from 'react';

const BubbleToggle = ({
    isOpen,
    hasUnread,
    onClick,
    primaryColor = '#667eea'
}) => {
    return (
        <button
            className={`bubble-toggle ${isOpen ? 'bubble-toggle--open' : ''}`}
            onClick={onClick}
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
            style={{ backgroundColor: primaryColor }}
        >
            {/* Chat Icon */}
            <svg
                className={`bubble-toggle__icon bubble-toggle__icon--chat ${isOpen ? 'hidden' : ''}`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>

            {/* Close Icon */}
            <svg
                className={`bubble-toggle__icon bubble-toggle__icon--close ${isOpen ? '' : 'hidden'}`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>

            {/* Unread Badge */}
            {hasUnread && !isOpen && (
                <span className="bubble-toggle__badge" aria-label="New message">
                    <span className="bubble-toggle__badge-dot" />
                </span>
            )}
        </button>
    );
};

export default BubbleToggle;
