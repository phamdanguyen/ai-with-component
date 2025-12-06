/**
 * ChatContainer - Unified container managing Bubble and Super Chat
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * This component orchestrates the seamless transition between
 * Bubble Chat (compact) and Super Chat (expanded) modes.
 *
 * Features:
 * - Single mount point for both modes
 * - Smooth animated transitions
 * - State preservation across modes
 * - Lazy loading of Super Chat
 *
 * Usage:
 *   <ChatContainer
 *     defaultMode="bubble"
 *     agentName="AI Assistant"
 *     greeting="Hello! How can I help?"
 *   />
 */

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { BubbleChat } from './bubble';
import TransitionManager from '../shared/services/TransitionManager';
import SessionManager from '../shared/services/SessionManager';
import './ChatContainer.css';

// Lazy load Super Chat for better initial performance
const SuperChatExpanded = lazy(() => import('./super/SuperChatExpanded'));

/**
 * Chat mode enum
 */
const CHAT_MODE = {
    BUBBLE: 'bubble',
    SUPER: 'super',
    TRANSITIONING: 'transitioning'
};

const ChatContainer = ({
    defaultMode = CHAT_MODE.BUBBLE,
    agentName = 'AI Assistant',
    greeting = '',
    primaryColor = '#6750A4',  // Material Design 3 Deep Purple
    position = 'bottom-right',
    allowCollapse = true,
    onModeChange = null
}) => {
    // State
    const [mode, setMode] = useState(defaultMode);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionData, setTransitionData] = useState(null);

    // Refs
    const containerRef = useRef(null);
    const bubbleRef = useRef(null);
    const superRef = useRef(null);

    // Check for pending transition on mount
    useEffect(() => {
        const pendingTransition = SessionManager.completeTransition(
            mode === CHAT_MODE.BUBBLE ? 'bubble' : 'super'
        );

        if (pendingTransition) {
            console.log('[ChatContainer] Restored from transition:', pendingTransition);
            setTransitionData(pendingTransition);
        }

        // Subscribe to transition events
        const unsubscribe = TransitionManager.onTransition((event, data) => {
            console.log('[ChatContainer] Transition event:', event, data);

            if (event === 'transition:complete') {
                setMode(data.to);
                setIsTransitioning(false);
                if (onModeChange) {
                    onModeChange(data.to);
                }
            } else if (event === 'transition:error') {
                setIsTransitioning(false);
                console.error('[ChatContainer] Transition error:', data.error);
            }
        });

        return () => unsubscribe();
    }, []);

    /**
     * Handle expand request from Bubble
     */
    const handleExpand = useCallback(async (transferData) => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        try {
            const result = await TransitionManager.expandToSuper({
                bubbleElement: bubbleRef.current,
                targetContainer: containerRef.current,
                uiState: {
                    mode: CHAT_MODE.BUBBLE
                }
            });

            if (result.success) {
                setTransitionData(result.transferData);
                setMode(CHAT_MODE.SUPER);
            }
        } catch (error) {
            console.error('[ChatContainer] Expand error:', error);
        } finally {
            setIsTransitioning(false);
        }
    }, [isTransitioning]);

    /**
     * Handle collapse request from Super Chat
     */
    const handleCollapse = useCallback(async () => {
        if (isTransitioning || !allowCollapse) return;

        setIsTransitioning(true);

        try {
            const result = await TransitionManager.collapseToTubble({
                superElement: superRef.current,
                uiState: {
                    mode: CHAT_MODE.SUPER
                }
            });

            if (result.success) {
                setTransitionData(result.transferData);
                setMode(CHAT_MODE.BUBBLE);
            }
        } catch (error) {
            console.error('[ChatContainer] Collapse error:', error);
        } finally {
            setIsTransitioning(false);
        }
    }, [isTransitioning, allowCollapse]);

    /**
     * Loading fallback for Super Chat
     */
    const SuperChatLoading = () => (
        <div className="chat-container__loading">
            <div className="chat-container__loading-spinner" />
            <p>Loading chat...</p>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={`chat-container chat-container--${mode} ${isTransitioning ? 'chat-container--transitioning' : ''}`}
        >
            {/* Bubble Chat Mode */}
            {mode === CHAT_MODE.BUBBLE && (
                <div ref={bubbleRef} className="chat-container__bubble">
                    <BubbleChat
                        position={position}
                        greeting={greeting}
                        agentName={agentName}
                        primaryColor={primaryColor}
                        onExpand={handleExpand}
                    />
                </div>
            )}

            {/* Super Chat Mode (Expanded) */}
            {mode === CHAT_MODE.SUPER && (
                <div ref={superRef} className="chat-container__super">
                    <Suspense fallback={<SuperChatLoading />}>
                        <SuperChatExpanded
                            agentName={agentName}
                            primaryColor={primaryColor}
                            transitionData={transitionData}
                            allowCollapse={allowCollapse}
                            onCollapse={handleCollapse}
                        />
                    </Suspense>
                </div>
            )}

            {/* Transition Overlay */}
            {isTransitioning && (
                <div className="chat-container__transition-overlay">
                    <div className="chat-container__transition-content">
                        <div className="chat-container__loading-spinner" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContainer;
export { CHAT_MODE };
