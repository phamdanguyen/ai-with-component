/**
 * Fastify Server
 *
 * Main entry point for the GenUI Platform backend
 * Sets up routes, middleware, and services
 */

// Load environment variables from root .env file FIRST
import * as dotenv from 'dotenv';
import * as path from 'path';
import process from 'process';

// Try to load from multiple locations
const rootEnv = path.resolve(process.cwd(), '../../.env');
const localEnv = path.resolve(process.cwd(), '.env');

const rootResult = dotenv.config({ path: rootEnv, override: true }); // From packages/middleware
const localResult = dotenv.config({ path: localEnv, override: true }); // Local .env

import Fastify, { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DualRequestHandler } from './middleware/dual-request-handler';
import { LLMFactory } from './services/llm-factory';
import { ToolExecutionService } from './services/tool-execution.service';
import { InMemorySessionStore } from './services/storage/InMemorySessionStore';
import { InMemoryConversationStore } from './services/storage/InMemoryConversationStore';
import { FileSessionStore } from './services/storage/FileSessionStore';
import { FileConversationStore } from './services/storage/FileConversationStore';
import { SessionManagementService } from './services/session-management.service';
import { ResponseCacheService } from './services/ResponseCacheService';
import { OdooAdapterService } from './services/odoo-adapter.service';
import type { RequestContext } from './types/core.types';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './services/auth.service';
import authPlugin from './plugins/auth';
import authRoutes from './routes/auth.routes';

// ============================================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================================

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .optional(),
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

function initializeServices() {
  const apiKey = process.env.GEMINI_API_KEY || 'mock';

  // Log warning if using mock mode
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn(
      '⚠️  GEMINI_API_KEY not set or invalid. Using MOCK mode for testing.\n' +
      '   To use real API: Set GEMINI_API_KEY environment variable with your Gemini API key\n' +
      '   Get API key from: https://aistudio.google.com/app/apikey'
    );
  }

  // Create LLM services using factory
  const textGenerator = LLMFactory.createTextGenerator(apiKey);
  const componentGenerator = LLMFactory.createComponentGenerator(apiKey);

  // Create tool execution service with built-in tools
  const toolExecutor = new ToolExecutionService({
    maxCacheSize: 100,
    cacheTTL: 300000, // 5 minutes
  });

  // Register built-in tools
  registerBuiltInTools(toolExecutor);

  // Create storage services for session management (File-based for persistence)
  const sessionStore = new FileSessionStore(); // stored in .data/sessions.json
  const conversationStore = new FileConversationStore(); // stored in .data/conversations.json
  const sessionManagement = new SessionManagementService(
    sessionStore,
    conversationStore,
    { contextWindowSize: 5 } // Context window size
  );

  // Create Response Cache Service
  const responseCacheService = new ResponseCacheService();

  // Create main handler with session management
  const dualRequestHandler = new DualRequestHandler(
    textGenerator,
    componentGenerator,
    toolExecutor,
    sessionManagement,
    responseCacheService
  );

  const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
  const odooAdapter = new OdooAdapterService(odooUrl);
  console.log(`[OdooIntegration] Initialized OdooAdapterService with URL: ${odooUrl}`);

  // Create Prisma Client and Auth Service
  const prisma = new PrismaClient();
  const authService = new AuthService(prisma);

  return { dualRequestHandler, toolExecutor, sessionManagement, sessionStore, conversationStore, responseCacheService, odooAdapter, authService, prisma };
}

// Register built-in tools
function registerBuiltInTools(toolExecutor: ToolExecutionService) {
  // Register all tools from the centralized BUILTIN_TOOLS list
  // This includes Core tools (date, math, weather) and Odoo tools
  import('./services/tool-execution.service').then(({ BUILTIN_TOOLS }) => {
    BUILTIN_TOOLS.forEach(tool => {
      try {
        toolExecutor.registerTool(tool);
        console.log(`[ToolRegistry] Registered tool: ${tool.name}`);
      } catch (error) {
        console.warn(`[ToolRegistry] Failed to register tool ${tool.name}:`, error);
      }
    });
  }).catch(err => {
    console.error('Failed to load BUILTIN_TOOLS:', err);
  });
}

// ============================================================================
// CREATE FASTIFY APP
// ============================================================================

async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  });

  // Register CORS manually
  app.addHook('onRequest', async (request, reply) => {
    // Debug logging
    console.log('Request Origin:', request.headers.origin);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    const origin = request.headers.origin;
    // Allow any localhost or the configured origin
    const allowedOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
      ? origin
      : (process.env.CORS_ORIGIN || '*');

    reply.header('Access-Control-Allow-Origin', allowedOrigin);
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Allow-Credentials', 'true');

    if (request.method === 'OPTIONS') {
      reply.send();
    }
  });

  // Initialize services
  const { dualRequestHandler, toolExecutor, sessionManagement, odooAdapter, authService } = initializeServices();

  // Register Auth Plugin
  app.register(authPlugin, { authService });

  // Register Auth Routes
  app.register(authRoutes);

  // Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    // Zod Validation Errors
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    // Tool Execution Errors
    if (error.message.includes('Tool execution failed')) {
      return reply.code(502).send({
        success: false,
        error: 'Tool execution failed',
        details: error.message
      });
    }

    // Default Error
    const statusCode = error.statusCode || 500;
    return reply.code(statusCode).send({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  });

  // ========================================================================
  // ROUTES
  // ========================================================================

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  // Get available tools
  app.get('/api/tools', async () => {
    const tools = toolExecutor.getTools();
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
    };
  });

  // Main chat endpoint (dual-stream)
  app.post<{ Body: ChatRequest }>('/api/chat', async (request, reply) => {
    try {
      // Validate request
      const validatedData = ChatRequestSchema.parse(request.body);

      // Create request context
      const context: RequestContext = {
        message: validatedData.message,
        sessionId: validatedData.sessionId || `session-${Date.now()}`,
        conversationHistory: validatedData.conversationHistory || [],
      };

      // Process with dual-stream handler
      console.log('[DEBUG] Chat Request Context:', JSON.stringify(context, null, 2));
      const response = await dualRequestHandler.handle(context);
      console.log('[DEBUG] Chat Response:', JSON.stringify(response, null, 2));

      return reply.code(200).send({
        success: true,
        data: response,
      });
    } catch (error) {
      // Log error to file for debugging
      const fs = require('fs');
      const logMsg = `${new Date().toISOString()} - Error: ${(error as Error).message}\nStack: ${(error as Error).stack}\n\n`;
      fs.appendFileSync('error.log', logMsg);
      console.error('Chat processing error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      app.log.error('Chat request error: %s', String(error));

      // Check if it's a validation error
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      }

      return reply.code(500).send({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Streaming chat endpoint (Server-Sent Events)
  // Integrated with Odoo Adapter
  app.get<{ Querystring: { message?: string; sessionId?: string } }>(
    '/api/chat/stream',
    async (request, reply) => {
      try {
        // Get message from query params
        const message = request.query.message || '';
        if (!message) {
          return reply.code(400).send({
            success: false,
            error: 'Message parameter required',
          });
        }

        const sessionId = (request.query.sessionId as string) || `session-${Date.now()}`;

        // Set SSE headers
        reply.header('Content-Type', 'text/event-stream');
        reply.header('Cache-Control', 'no-cache');
        reply.header('Connection', 'keep-alive');
        reply.header('Access-Control-Allow-Origin', '*');

        // Use Odoo Adapter to stream from Odoo
        console.log(`[Stream] Proxying to Odoo for session: ${sessionId}, message: "${message}"`);

        await odooAdapter.streamChat(message as string, sessionId, (chunk) => {
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        });

        // End stream
        reply.raw.end();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        app.log.error('Streaming request error: %s', String(error));

        // Send error as SSE event
        const errorChunk = {
          type: 'error',
          data: { error: errorMessage },
          timestamp: Date.now(),
        };
        reply.raw.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
        reply.raw.end();
      }
    }
  );

  // ========================================================================
  // SESSION MANAGEMENT ENDPOINTS
  // ========================================================================

  // POST /api/sessions - Create new session
  app.post<{ Body: { metadata?: Record<string, any> } }>(
    '/api/sessions',
    async (request, reply) => {
      try {
        const session = await sessionManagement.initializeSession();
        return reply.code(201).send({ session });
      } catch (error) {
        app.log.error('Failed to create session: %s', String(error));
        return reply.code(500).send({ error: 'Failed to create session' });
      }
    }
  );

  // GET /api/sessions/:sessionId - Get session info
  app.get<{ Params: { sessionId: string } }>(
    '/api/sessions/:sessionId',
    async (request, reply) => {
      try {
        const context = await sessionManagement.getSessionWithContext(
          request.params.sessionId
        );
        if (!context) {
          return reply.code(404).send({ error: 'Session not found' });
        }
        return reply.code(200).send(context);
      } catch (error) {
        app.log.error('Failed to retrieve session: %s', String(error));
        return reply.code(500).send({ error: 'Failed to retrieve session' });
      }
    }
  );

  // GET /api/sessions/:sessionId/history - Get conversation history
  app.get<{ Params: { sessionId: string }; Querystring: { limit?: string } }>(
    '/api/sessions/:sessionId/history',
    async (request, reply) => {
      try {
        const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
        const messages = await sessionManagement.getConversationHistory(
          request.params.sessionId,
          limit
        );
        return reply.code(200).send({ messages });
      } catch (error) {
        app.log.error('Failed to retrieve history: %s', String(error));
        return reply.code(500).send({ error: 'Failed to retrieve history' });
      }
    }
  );

  // DELETE /api/sessions/:sessionId - Delete session
  app.delete<{ Params: { sessionId: string } }>(
    '/api/sessions/:sessionId',
    async (request, reply) => {
      try {
        await sessionManagement.deleteConversation(request.params.sessionId);
        return reply.code(200).send({ success: true, message: 'Session deleted' });
      } catch (error) {
        app.log.error('Failed to delete session: %s', String(error));
        return reply.code(500).send({ error: 'Failed to delete session' });
      }
    }
  );

  // GET /api/stats - Get system statistics
  app.get('/api/stats', async (request, reply) => {
    try {
      const stats = await sessionManagement.getSessionStats();
      return reply.code(200).send({ stats });
    } catch (error) {
      app.log.error('Failed to retrieve stats: %s', String(error));
      return reply.code(500).send({ error: 'Failed to retrieve stats' });
    }
  });

  // Fallback 404 handler
  app.get('*', async () => {
    return {
      error: 'Not found',
      message: 'This endpoint does not exist. Try /health, /api/chat, or /api/sessions',
    };
  });

  return app;
}

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    const app = await createApp();

    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`
      ╭──────────────────────────────────────────╮
      │  GenUI Platform - Middleware Server      │
      │                                          │
      │  🚀 Server running at:                   │
      │     http://${host}:${port}              │
      │                                          │
      │  📚 API Documentation:                   │
      │     GET  /health          - Health check │
      │     GET  /api/tools       - List tools   │
      │     POST /api/chat        - Chat API     │
      │                                          │
      │  🔑 Environment:                         │
      │     NODE_ENV: ${process.env.NODE_ENV}   │
      │     LOG_LEVEL: ${process.env.LOG_LEVEL} │
      │                                          │
      ╰──────────────────────────────────────────╯
    `);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Only start if run directly
if (require.main === module) {
  start().catch(console.error);
}

export { createApp };
