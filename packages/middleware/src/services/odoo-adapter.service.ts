import { EventEmitter } from 'events';
import { StreamChunk } from '../types/core.types';

/**
 * Service to adapt Odoo's SSE stream to GenUI Middleware format
 */
export class OdooAdapterService {
    private odooBaseUrl: string;

    constructor(odooUrl: string = 'http://localhost:8069') {
        this.odooBaseUrl = odooUrl;
    }

    /**
     * Stream chat from Odoo and transform events
     */
    async streamChat(
        message: string,
        sessionId: string,
        onChunk: (chunk: StreamChunk) => void
    ): Promise<void> {
        const url = new URL(`${this.odooBaseUrl}/superchat/api/chat/stream`);
        url.searchParams.append('message', message);
        if (sessionId) {
            url.searchParams.append('session_id', sessionId);
        }

        console.log(`[OdooAdapter] Connecting to ${url.toString()}`);

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                },
            });

            if (!response.ok) {
                throw new Error(`Odoo responded with ${response.status}: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body from Odoo');
            }

            // Read the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line

                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        if (!jsonStr) continue;

                        try {
                            const odooEvent = JSON.parse(jsonStr);
                            this.processOdooEvent(odooEvent, onChunk);
                        } catch (e) {
                            console.warn('[OdooAdapter] Failed to parse Odoo event:', e);
                        }
                    }
                }
            }

            // Final cleanup
            onChunk({
                type: 'complete',
                data: {},
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('[OdooAdapter] Stream error:', error);
            onChunk({
                type: 'error',
                data: { error: error instanceof Error ? error.message : 'Unknown Odoo error' },
                timestamp: Date.now()
            });
        }
    }

    /**
     * Transform Odoo specific event types to Middleware standard types
     */
    private processOdooEvent(odooEvent: any, onChunk: (chunk: StreamChunk) => void) {
        const timestamp = Date.now();

        switch (odooEvent.type) {
            case 'text':
                // Odoo: { type: 'text', content: 'Hello' }
                onChunk({
                    type: 'text',
                    data: odooEvent.content || '',
                    timestamp
                });
                break;

            case 'component':
            case 'chart': // Odoo might send 'chart' type directly sometimes?
                // Odoo: { type: 'component', ...spec }
                // The Middleware expects the data to BE the component spec
                onChunk({
                    type: 'component',
                    data: odooEvent,
                    timestamp
                });
                break;

            case 'suggestions':
                // Odoo: { type: 'suggestions', data: { buttons: [...] } }
                // Middleware doesn't have a standard 'suggestions' type in StreamChunk yet,
                // but let's pass it through or maybe wrap it?
                // For now, let's treat it as a specialized tool output or ignore if frontend doesn't support
                // Frontend `api-client` types: text, component, tool, complete, error.
                // Let's pass it as 'tool' for now to debug
                onChunk({
                    type: 'tool',
                    data: {
                        tool: 'suggestions',
                        result: odooEvent.data
                    },
                    timestamp
                });
                break;

            case 'tools':
                // Odoo: { type: 'tools', status: 'completed', name: '...', content: '...' }
                onChunk({
                    type: 'tool',
                    data: {
                        tool: odooEvent.name,
                        status: odooEvent.status,
                        result: odooEvent.content
                    },
                    timestamp
                });
                break;

            case 'rag':
                // Odoo: { type: 'rag', status: 'completed', content: '...' }
                // Treat as debug info or tool
                console.log('[OdooAdapter] RAG:', odooEvent);
                break;

            case 'thinking':
                // Odoo: { type: 'thinking', content: '...' }
                // Optional: show thinking as text or ignore
                // console.log('[OdooAdapter] Thinking:', odooEvent.content);
                break;

            case 'done':
                // Handled by the stream end, but if we get explicit done, we can respect it
                break;

            case 'error':
                onChunk({
                    type: 'error',
                    data: { error: odooEvent.error },
                    timestamp
                });
                break;

            default:
                // Check if it looks like a component (direct spec)
                if (odooEvent.type && ['table', 'form', 'list'].includes(odooEvent.type)) {
                    onChunk({
                        type: 'component',
                        data: odooEvent,
                        timestamp
                    });
                }
        }
    }
}
