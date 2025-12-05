import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

export const dynamic = 'force-dynamic'; // Prevent static optimization

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const message = searchParams.get('message');
        const sessionId = searchParams.get('sessionId');

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Construct backend URL with query params
        const backendUrl = new URL(`${BACKEND_API_URL}/chat/stream`);
        backendUrl.searchParams.append('message', message);
        if (sessionId) {
            backendUrl.searchParams.append('sessionId', sessionId);
        }

        // Forward request to backend
        const response = await fetch(backendUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend streaming failed: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        if (!response.body) {
            return NextResponse.json(
                { error: 'No response body from backend' },
                { status: 500 }
            );
        }

        // Return streaming response
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Streaming proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
