/**
 * SSEChatClient - Unified Server-Sent Events client for AI Chat
 *
 * Version: 9.3.0
 * Created: 2025-11-26
 *
 * This service handles SSE streaming for both Bubble Chat and Super Chat.
 * Single implementation ensures consistent behavior across all chat UIs.
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Event type parsing (thinking, answer, tool_call, component, etc.)
 * - Session management integration
 * - Error handling with fallbacks
 *
 * Usage:
 *   const client = new SSEChatClient('/ai-chat/stream');
 *   client.send('Hello', {
 *     onThinking: (text) => {},
 *     onAnswer: (text) => {},
 *     onComponent: (data) => {},
 *     onDone: (result) => {},
 *     onError: (error) => {}
 *   });
 */

class SSEChatClient {
    constructor(endpoint = '/ai-chat/stream', options = {}) {
        this.endpoint = endpoint;
        this.options = {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 120000, // 2 minutes
            source: 'bubble', // 'bubble' or 'super'
            ...options
        };

        this.eventSource = null;
        this.retryCount = 0;
        this.isConnected = false;
    }

    /**
     * Send message and stream response
     *
     * @param {string} message - User message
     * @param {Object} callbacks - Event callbacks
     * @param {string} sessionId - Session ID for continuity
     * @returns {Promise} Resolves when stream completes
     */
    send(message, callbacks = {}, sessionId = null) {
        return new Promise((resolve, reject) => {
            // Build URL with parameters
            const params = new URLSearchParams({
                message: message,
                source: this.options.source
            });

            if (sessionId) {
                params.append('session_id', sessionId);
            }

            const url = `${this.endpoint}?${params.toString()}`;

            // Close existing connection
            this.close();

            // Create new EventSource
            this.eventSource = new EventSource(url);
            this.isConnected = true;

            // Timeout handler
            const timeoutId = setTimeout(() => {
                this.close();
                const error = new Error('Request timeout');
                if (callbacks.onError) callbacks.onError(error);
                reject(error);
            }, this.options.timeout);

            // Message handler
            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this._handleEvent(data, callbacks);

                    // Resolve on done
                    if (data.type === 'done') {
                        clearTimeout(timeoutId);
                        this.close();
                        resolve(data);
                    }

                    // Reject on error
                    if (data.type === 'error') {
                        clearTimeout(timeoutId);
                        this.close();
                        reject(new Error(data.error || 'Unknown error'));
                    }
                } catch (parseError) {
                    console.error('[SSEChatClient] Parse error:', parseError);
                }
            };

            // Error handler
            this.eventSource.onerror = (error) => {
                clearTimeout(timeoutId);
                this.close();

                // Retry logic
                if (this.retryCount < this.options.maxRetries) {
                    this.retryCount++;
                    const delay = this.options.retryDelay * Math.pow(2, this.retryCount - 1);
                    console.log(`[SSEChatClient] Retry ${this.retryCount}/${this.options.maxRetries} in ${delay}ms`);

                    setTimeout(() => {
                        this.send(message, callbacks, sessionId)
                            .then(resolve)
                            .catch(reject);
                    }, delay);
                } else {
                    const err = new Error('Connection failed after retries');
                    if (callbacks.onError) callbacks.onError(err);
                    reject(err);
                }
            };
        });
    }

    /**
     * Handle SSE event by type
     *
     * @param {Object} data - Parsed event data
     * @param {Object} callbacks - Event callbacks
     */
    _handleEvent(data, callbacks) {
        const { type } = data;

        switch (type) {
            case 'thinking':
                if (callbacks.onThinking) {
                    callbacks.onThinking(data.text || '');
                }
                break;

            case 'answer':
                if (callbacks.onAnswer) {
                    callbacks.onAnswer(data.text || '');
                }
                break;

            case 'rag':
                if (callbacks.onRAG) {
                    callbacks.onRAG({
                        status: data.status,
                        query: data.query,
                        results: data.results || [],
                        totalCount: data.total_count || 0
                    });
                }
                break;

            case 'tool_call':
                if (callbacks.onToolCall) {
                    callbacks.onToolCall({
                        tool: data.tool,
                        args: data.args,
                        status: data.status
                    });
                }
                break;

            case 'tool_result':
                if (callbacks.onToolResult) {
                    callbacks.onToolResult({
                        tool: data.tool,
                        status: data.status,
                        data: data.data,
                        error: data.error
                    });
                }
                break;

            case 'component':
                if (callbacks.onComponent) {
                    callbacks.onComponent({
                        componentType: data.component_type,
                        props: data.props || {},
                        confidence: data.confidence || 0,
                        contextualIntro: data.contextual_intro,
                        componentSize: data.component_size
                    });
                }
                break;

            case 'suggestions':
                if (callbacks.onSuggestions) {
                    callbacks.onSuggestions(data.data || {});
                }
                break;

            case 'handoff':
                if (callbacks.onHandoff) {
                    callbacks.onHandoff({
                        reason: data.reason,
                        agent: data.agent,
                        status: data.status
                    });
                }
                break;

            case 'form':
                if (callbacks.onForm) {
                    callbacks.onForm(data.data || {});
                }
                break;

            case 'open_url':
                if (callbacks.onOpenURL) {
                    callbacks.onOpenURL({
                        url: data.url,
                        target: data.target || '_blank'
                    });
                }
                break;

            case 'done':
                if (callbacks.onDone) {
                    callbacks.onDone({
                        sessionId: data.session_id,
                        toolsExecuted: data.tools_executed || [],
                        source: data.source
                    });
                }
                break;

            case 'error':
                if (callbacks.onError) {
                    callbacks.onError(new Error(data.error || 'Unknown error'));
                }
                break;

            default:
                console.log('[SSEChatClient] Unknown event type:', type, data);
        }
    }

    /**
     * Close SSE connection
     */
    close() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnected = false;
        this.retryCount = 0;
    }

    /**
     * Check if client is connected
     * @returns {boolean}
     */
    isActive() {
        return this.isConnected && this.eventSource !== null;
    }
}

export default SSEChatClient;
