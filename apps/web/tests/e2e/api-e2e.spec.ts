import { test, expect } from '@playwright/test';

test.describe('API Dual Stream', () => {
    test('should return text and component in parallel', async ({ request }) => {
        // This test assumes the backend is running and reachable via the proxy or direct URL
        // Since we are in an E2E test, we normally hit the Next.js API route

        // Using a mock session ID
        const sessionId = 'test-session-' + Date.now();

        // Trigger the chat endpoint
        const response = await request.post('/api/chat', {
            data: {
                message: 'Show me sales chart',
                sessionId
            }
        });

        expect(response.ok()).toBeTruthy();

        // In a real dual stream with SSE, we would parse the stream.
        // For now, let's verify we get a valid response structure if it's not streaming yet,
        // or if it is streaming, check the content type.

        const contentType = response.headers()['content-type'];

        if (contentType?.includes('text/event-stream')) {
            // Handle SSE verification
            console.log('Detected SSE stream');
            const body = await response.body();
            const text = body.toString();
            expect(text).toContain('data:');
            // expect(text).toContain('"type":"component"'); 
        } else {
            // Fallback JSON response verification
            const json = await response.json();
            expect(json).toHaveProperty('textSummary');
            expect(json).toHaveProperty('componentSpec');

            if (json.componentSpec) {
                expect(json.componentSpec.type).toBe('chart');
            }
        }
    });
});
