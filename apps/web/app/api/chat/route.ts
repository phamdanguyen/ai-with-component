/**
 * Chat API Route
 *
 * Next.js API route that forwards chat requests to the Fastify backend
 * The backend handles dual-stream generation (text summary + component spec)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, conversationHistory } = body;

    // Validate input
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        conversationHistory,
      }),
    });

    // Check if backend response is OK
    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      console.error('Backend error:', error);

      return NextResponse.json(
        {
          error: error.error || 'Backend request failed',
          details: error.details,
        },
        { status: backendResponse.status }
      );
    }

    // Parse backend response
    const backendData = await backendResponse.json();

    // Return data from backend
    return NextResponse.json(backendData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API error:', error);

    // Check if it's a network/connection error
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Backend server is not running',
          message: `Cannot connect to backend at ${BACKEND_API_URL}. Make sure the Fastify server is running on port 3001.`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
