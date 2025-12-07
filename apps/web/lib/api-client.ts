/**
 * API Client
 *
 * Client for communicating with the chat API
 * Handles request/response with backend
 * Phase 2: Supports both traditional and streaming responses
 */

import type { DualResponse } from './types';

/**
 * Stream chunk types (Phase 2 enhancement)
 * Matches backend StreamChunk interface
 */
export interface StreamChunk {
  type: 'text' | 'component' | 'tool' | 'complete' | 'error' | 'suggestions' | 'rag';
  data: string | Record<string, unknown> | unknown;
  timestamp: number;
  id?: string;
  metadata?: {
    chunkIndex?: number;
    totalChunks?: number;
    model?: string;
  };
}

export class ChatAPIClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    // Force usage of proxy to avoid environment variable issues
    this.baseURL = baseURL || '/api/backend';
  }

  /**
   * Send message and get dual response (traditional approach)
   */
  async sendMessage(
    message: string,
    sessionId?: string
  ): Promise<DualResponse> {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || this.generateSessionId(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const body = await response.json();
    // Handle API response format: {success: true, data: {...}}
    if (body.success && body.data) {
      return body.data;
    }
    return body;
  }

  /**
   * Stream message chunks in real-time (Phase 2 enhancement)
   * Returns an async generator yielding stream chunks
   *
   * Usage:
   * for await (const chunk of client.streamMessage(message)) {
   *   if (chunk.type === 'text') handleTextChunk(chunk.data)
   *   if (chunk.type === 'component') handleComponentChunk(chunk.data)
   * }
   */
  async *streamMessage(
    message: string,
    sessionId?: string,
    options?: { deepThink?: boolean }
  ): AsyncGenerator<StreamChunk, void, unknown> {
    // Use local Next.js API route for streaming
    // The baseURL is likely '/api/backend' or empty for relative calls to Next.js API
    // If baseURL is '/api/backend', it routes to Next.js rewrites. 
    // But we created a specific route at /api/chat/stream.

    // We should use the specific Next.js API route we just created
    const url = new URL('/api/chat/stream', window.location.origin);
    url.searchParams.set('message', message);
    if (sessionId) {
      url.searchParams.set('sessionId', sessionId);
    }
    if (options?.deepThink) {
      url.searchParams.set('deep_think', 'true');
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (format: "data: {...}\n\n")
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(line.slice(6)) as StreamChunk;
              yield chunk;
            } catch (error) {
              console.error('Failed to parse stream chunk:', error);
            }
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const chunk = JSON.parse(buffer.slice(6)) as StreamChunk;
          yield chunk;
        } catch (error) {
          console.error('Failed to parse final stream chunk:', error);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Default client instance
 */
export const chatAPI = new ChatAPIClient();
