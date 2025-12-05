import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../server';
import { LLMFactory } from '../services/llm-factory';
import { MockLLMService } from '../services/llm/MockLLMService';

// Mock LLM Factory to use MockLLMService regardless of API key
vi.mock('../services/llm-factory', async () => {
    const actual = await vi.importActual('../services/llm-factory') as any;
    return {
        ...actual,
        LLMFactory: {
            ...actual.LLMFactory,
            createTextGenerator: vi.fn(),
            createComponentGenerator: vi.fn(),
        }
    };
});

describe('Full Integration Flow', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        // Setup Mock behavior
        (LLMFactory.createTextGenerator as any).mockReturnValue(
            new MockLLMService('mock-key', 'gemini-2.0-flash')
        );
        (LLMFactory.createComponentGenerator as any).mockReturnValue(
            new MockLLMService('mock-key', 'gemini-2.0-flash')
        );

        app = await createApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should handle full chat flow with component generation', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/chat',
            payload: {
                message: 'Show me a bar chart of monthly revenue',
                sessionId: 'test-session-123',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);

        // Check structure
        expect(body.data).toHaveProperty('textSummary');
        expect(body.data).toHaveProperty('componentSpec');

        // Check component spec
        const component = body.data.componentSpec;
        expect(component).toHaveProperty('type', 'chart');
        expect(component.props).toHaveProperty('chartType', 'bar');
        expect(component.props.data).toBeInstanceOf(Array);
    });

    it('should handle tool execution implicit in component generation', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/chat',
            payload: {
                message: 'Calculate 50 + 100',
                sessionId: 'test-session-tool',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);

        // Should return text explanation and likely no complex component, or a simple one
        // In mock mode, it might return a standard response. 
        // This test mainly verifies the pipeline doesn't crash.
        expect(body.data).toHaveProperty('textSummary');
    });

    it('should recover from errors gracefully', async () => {
        // Force a mock error scenario if possible, or just send invalid payload
        const response = await app.inject({
            method: 'POST',
            url: '/api/chat',
            payload: {
                // Missing message
                sessionId: 'test-session-error',
            },
        });

        expect(response.statusCode).toBe(400); // Bad Request
    });
});
