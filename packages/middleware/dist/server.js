"use strict";
/**
 * Fastify Server
 *
 * Main entry point for the GenUI Platform backend
 * Sets up routes, middleware, and services
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
// Load environment variables from root .env file FIRST
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const process_1 = __importDefault(require("process"));
// Try to load from multiple locations
dotenv.config({ path: path.resolve(process_1.default.cwd(), '../../.env') }); // From packages/middleware
dotenv.config({ path: path.resolve(process_1.default.cwd(), '.env') }); // Local .env
const fastify_1 = __importDefault(require("fastify"));
const zod_1 = require("zod");
const dual_request_handler_1 = require("./middleware/dual-request-handler");
const llm_factory_1 = require("./services/llm-factory");
const tool_execution_service_1 = require("./services/tool-execution.service");
const FileSessionStore_1 = require("./services/storage/FileSessionStore");
const FileConversationStore_1 = require("./services/storage/FileConversationStore");
const session_management_service_1 = require("./services/session-management.service");
const ResponseCacheService_1 = require("./services/ResponseCacheService");
// ============================================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================================
const ChatRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty'),
    sessionId: zod_1.z.string().optional(),
    conversationHistory: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant', 'system']),
        content: zod_1.z.string(),
        timestamp: zod_1.z.string().optional(),
    }))
        .optional(),
});
// ============================================================================
// INITIALIZE SERVICES
// ============================================================================
function initializeServices() {
    const apiKey = process_1.default.env.GEMINI_API_KEY || 'mock';
    // Log warning if using mock mode
    if (!process_1.default.env.GEMINI_API_KEY || process_1.default.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('⚠️  GEMINI_API_KEY not set or invalid. Using MOCK mode for testing.\n' +
            '   To use real API: Set GEMINI_API_KEY environment variable with your Gemini API key\n' +
            '   Get API key from: https://aistudio.google.com/app/apikey');
    }
    // Create LLM services using factory
    const textGenerator = llm_factory_1.LLMFactory.createTextGenerator(apiKey);
    const componentGenerator = llm_factory_1.LLMFactory.createComponentGenerator(apiKey);
    // Create tool execution service with built-in tools
    const toolExecutor = new tool_execution_service_1.ToolExecutionService({
        maxCacheSize: 100,
        cacheTTL: 300000, // 5 minutes
    });
    // Register built-in tools
    registerBuiltInTools(toolExecutor);
    // Create storage services for session management (File-based for persistence)
    const sessionStore = new FileSessionStore_1.FileSessionStore(); // stored in .data/sessions.json
    const conversationStore = new FileConversationStore_1.FileConversationStore(); // stored in .data/conversations.json
    const sessionManagement = new session_management_service_1.SessionManagementService(sessionStore, conversationStore, { contextWindowSize: 5 } // Context window size
    );
    // Create Response Cache Service
    const responseCacheService = new ResponseCacheService_1.ResponseCacheService();
    // Create main handler with session management
    const dualRequestHandler = new dual_request_handler_1.DualRequestHandler(textGenerator, componentGenerator, toolExecutor, sessionManagement, responseCacheService);
    return { dualRequestHandler, toolExecutor, sessionManagement, sessionStore, conversationStore, responseCacheService };
}
// Register built-in tools
function registerBuiltInTools(toolExecutor) {
    // Register all tools from the centralized BUILTIN_TOOLS list
    // This includes Core tools (date, math, weather) and Odoo tools
    Promise.resolve().then(() => __importStar(require('./services/tool-execution.service'))).then(({ BUILTIN_TOOLS }) => {
        BUILTIN_TOOLS.forEach(tool => {
            try {
                toolExecutor.registerTool(tool);
                console.log(`[ToolRegistry] Registered tool: ${tool.name}`);
            }
            catch (error) {
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
async function createApp() {
    const app = (0, fastify_1.default)({
        logger: {
            level: process_1.default.env.LOG_LEVEL || 'info',
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
        console.log('NODE_ENV:', process_1.default.env.NODE_ENV);
        const origin = request.headers.origin;
        // Allow any localhost or the configured origin
        const allowedOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))
            ? origin
            : (process_1.default.env.CORS_ORIGIN || '*');
        reply.header('Access-Control-Allow-Origin', allowedOrigin);
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        reply.header('Access-Control-Allow-Credentials', 'true');
        if (request.method === 'OPTIONS') {
            reply.send();
        }
    });
    // Initialize services
    const { dualRequestHandler, toolExecutor, sessionManagement } = initializeServices();
    // Global Error Handler
    app.setErrorHandler((error, request, reply) => {
        app.log.error(error);
        // Zod Validation Errors
        if (error instanceof zod_1.z.ZodError) {
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
    app.post('/api/chat', async (request, reply) => {
        try {
            // Validate request
            const validatedData = ChatRequestSchema.parse(request.body);
            // Create request context
            const context = {
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
        }
        catch (error) {
            // Log error to file for debugging
            const fs = require('fs');
            const logMsg = `${new Date().toISOString()} - Error: ${error.message}\nStack: ${error.stack}\n\n`;
            fs.appendFileSync('error.log', logMsg);
            console.error('Chat processing error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            app.log.error('Chat request error: %s', String(error));
            // Check if it's a validation error
            if (error instanceof zod_1.z.ZodError) {
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
    // Phase 2 Enhancement: Real-time streaming responses
    app.get('/api/chat/stream', async (request, reply) => {
        try {
            // Get message from query params
            const message = request.query.message || '';
            if (!message) {
                return reply.code(400).send({
                    success: false,
                    error: 'Message parameter required',
                });
            }
            // Create request context
            const context = {
                message: message,
                sessionId: request.query.sessionId || `session-${Date.now()}`,
                conversationHistory: [],
            };
            // Set SSE headers
            reply.header('Content-Type', 'text/event-stream');
            reply.header('Cache-Control', 'no-cache');
            reply.header('Connection', 'keep-alive');
            reply.header('Access-Control-Allow-Origin', '*');
            // Stream response
            await dualRequestHandler.handleStream(context, (chunk) => {
                // Send chunk in SSE format
                reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
            });
            // End stream
            reply.raw.end();
        }
        catch (error) {
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
    });
    // ========================================================================
    // SESSION MANAGEMENT ENDPOINTS
    // ========================================================================
    // POST /api/sessions - Create new session
    app.post('/api/sessions', async (request, reply) => {
        try {
            const session = await sessionManagement.initializeSession();
            return reply.code(201).send({ session });
        }
        catch (error) {
            app.log.error('Failed to create session: %s', String(error));
            return reply.code(500).send({ error: 'Failed to create session' });
        }
    });
    // GET /api/sessions/:sessionId - Get session info
    app.get('/api/sessions/:sessionId', async (request, reply) => {
        try {
            const context = await sessionManagement.getSessionWithContext(request.params.sessionId);
            if (!context) {
                return reply.code(404).send({ error: 'Session not found' });
            }
            return reply.code(200).send(context);
        }
        catch (error) {
            app.log.error('Failed to retrieve session: %s', String(error));
            return reply.code(500).send({ error: 'Failed to retrieve session' });
        }
    });
    // GET /api/sessions/:sessionId/history - Get conversation history
    app.get('/api/sessions/:sessionId/history', async (request, reply) => {
        try {
            const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
            const messages = await sessionManagement.getConversationHistory(request.params.sessionId, limit);
            return reply.code(200).send({ messages });
        }
        catch (error) {
            app.log.error('Failed to retrieve history: %s', String(error));
            return reply.code(500).send({ error: 'Failed to retrieve history' });
        }
    });
    // DELETE /api/sessions/:sessionId - Delete session
    app.delete('/api/sessions/:sessionId', async (request, reply) => {
        try {
            await sessionManagement.deleteConversation(request.params.sessionId);
            return reply.code(200).send({ success: true, message: 'Session deleted' });
        }
        catch (error) {
            app.log.error('Failed to delete session: %s', String(error));
            return reply.code(500).send({ error: 'Failed to delete session' });
        }
    });
    // GET /api/stats - Get system statistics
    app.get('/api/stats', async (request, reply) => {
        try {
            const stats = await sessionManagement.getSessionStats();
            return reply.code(200).send({ stats });
        }
        catch (error) {
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
        const port = parseInt(process_1.default.env.PORT || '3001', 10);
        const host = process_1.default.env.HOST || '0.0.0.0';
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
      │     NODE_ENV: ${process_1.default.env.NODE_ENV}   │
      │     LOG_LEVEL: ${process_1.default.env.LOG_LEVEL} │
      │                                          │
      ╰──────────────────────────────────────────╯
    `);
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process_1.default.exit(1);
    }
}
// Only start if run directly
if (require.main === module) {
    start().catch(console.error);
}
//# sourceMappingURL=server.js.map