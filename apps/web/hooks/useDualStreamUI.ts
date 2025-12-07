'use client';

/**
 * useDualStreamUI Hook
 *
 * Core React hook for handling dual-stream responses
 * Manages streaming of both text summary and component spec
 *
 * Features:
 * - Handles async text + component loading
 * - Separate state for text and component
 * - Loading states for progressive disclosure
 * - Error handling
 */

import { useState, useCallback } from 'react';
import type { DualResponse, ComponentSpec } from '@/lib/types';
import { chatAPI } from '@/lib/api-client';

export interface DualStreamState {
  textSummary: string;
  componentSpec: ComponentSpec | null;
  isLoading: boolean;
  isTextReady: boolean;
  isComponentReady: boolean;
  error: string | null;
  retryCount: number;
  lastMessage: string | null;
  deepThinkLogs: string[];
  suggestions: string[];
}

export interface UseDualStreamUIReturn {
  state: DualStreamState;
  sendMessage: (message: string, sessionId?: string, options?: { deepThink?: boolean }) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for handling dual-stream UI generation
 *
 * @param sessionId - Optional session ID for conversation tracking
 * @returns State and functions for managing dual-stream UI
 */
const MAX_RETRIES = 2;

export function useDualStreamUI(sessionId?: string): UseDualStreamUIReturn {
  const [state, setState] = useState<DualStreamState>({
    textSummary: '',
    componentSpec: null,
    isLoading: false,
    isTextReady: false,
    isComponentReady: false,
    error: null,
    retryCount: 0,
    lastMessage: null,
    deepThinkLogs: [],
    suggestions: [],
  });

  /**
   * Send message to API and handle dual response with streaming
   * Phase 2: Uses SSE streaming for real-time updates
   */
  const sendMessage = useCallback(
    async (message: string, customSessionId?: string, options?: { deepThink?: boolean }) => {
      setState((prev) => ({
        textSummary: '',
        componentSpec: null,
        isLoading: true,
        isTextReady: false,
        isComponentReady: false,
        error: null,
        retryCount: prev.retryCount,
        lastMessage: message,
        deepThinkLogs: [],
        suggestions: [],
      }));

      try {
        let fullTextSummary = '';
        let fullComponentSpec: ComponentSpec | null = null;

        // Try streaming first (Phase 2 enhancement)
        // If not available, fall back to traditional API response
        try {
          // Stream chunks from server
          for await (const chunk of chatAPI.streamMessage(
            message,
            customSessionId || sessionId,
            options
          )) {
            // Handle text chunks - update state incrementally
            if (chunk.type === 'text') {
              fullTextSummary += chunk.data;
              setState((prev) => ({
                ...prev,
                textSummary: fullTextSummary,
                isTextReady: true, // Text is streaming
              }));
            }

            // Handle component chunks - update when ready
            if (chunk.type === 'component') {
              fullComponentSpec = chunk.data as ComponentSpec;
              console.log('[useDualStreamUI] Received component chunk:', fullComponentSpec);
              setState((prev) => ({
                ...prev,
                componentSpec: fullComponentSpec,
                isComponentReady: true,
              }));
            }



            // Handle suggestions
            if (chunk.type === 'suggestions') {
              const suggs = Array.isArray(chunk.data) ? chunk.data : [String(chunk.data)];
              setState((prev) => ({
                ...prev,
                suggestions: suggs as string[]
              }));
            }

            // Handle RAG (process log)
            if (chunk.type === 'rag') {
              const logs = [`RAG: Retrieved context from Odoo (${JSON.stringify(chunk.data)})`];
              setState((prev) => ({
                ...prev,
                deepThinkLogs: [...prev.deepThinkLogs, ...logs]
              }));
            }

            // Handle completion
            if (chunk.type === 'complete') {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                isTextReady: true,
                isComponentReady: true,
                error: null,
              }));
            }

            // Handle errors
            if (chunk.type === 'error') {
              const errorData = chunk.data as { error?: string };
              throw new Error(errorData.error || 'Streaming error');
            }
          }
        } catch (streamError) {
          // Streaming not available, fall back to traditional API
          console.log('Streaming not available, using traditional API response...');

          const response = await chatAPI.sendMessage(
            message,
            customSessionId || sessionId
          );

          // Debug logging for component integration
          console.log('[useDualStreamUI] API Response:', response);

          fullTextSummary = response.textSummary || '';
          fullComponentSpec = response.componentSpec || null;

          // Debug: Log component spec details
          if (fullComponentSpec) {
            console.log('[useDualStreamUI] ComponentSpec received:', {
              type: fullComponentSpec.type,
              id: fullComponentSpec.id,
              props: fullComponentSpec.props,
            });
          } else {
            console.log('[useDualStreamUI] No componentSpec in response');
          }

          // Update state with complete response
          setState((prev) => ({
            ...prev,
            textSummary: fullTextSummary,
            componentSpec: fullComponentSpec,
            isTextReady: true,
            isComponentReady: fullComponentSpec !== null,
            isLoading: false,
            error: null,
          }));
        }

        // Ensure final state is correct
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isTextReady: true,
          isComponentReady: fullComponentSpec !== null,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        setState((prev) => ({
          textSummary: '',
          componentSpec: null,
          isLoading: false,
          isTextReady: false,
          isComponentReady: false,
          error: errorMessage,
          retryCount: prev.retryCount,
          lastMessage: prev.lastMessage,
          deepThinkLogs: [],
          suggestions: [],
        }));

        console.error('API error:', err);
      }
    },
    [sessionId]
  );

  /**
   * Retry last failed message
   */
  const retry = useCallback(async () => {
    if (!state.lastMessage || state.retryCount >= MAX_RETRIES) {
      return;
    }

    setState((prev) => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null,
    }));

    await sendMessage(state.lastMessage, sessionId);
    // Note: retry doesn't persist options currently, but could be enhanced later if needed.
  }, [state.lastMessage, state.retryCount, sendMessage, sessionId]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      textSummary: '',
      componentSpec: null,
      isLoading: false,
      isTextReady: false,
      isComponentReady: false,
      error: null,
      retryCount: 0,
      lastMessage: null,
      deepThinkLogs: [],
      suggestions: [],
    });
  }, []);

  return { state, sendMessage, retry, reset };
}
