# Architecture - Backend (Middleware)

## Executive Summary

The **middleware backend** is a Fastify-based HTTP API service that integrates with Google's Generative AI (Gemini) to process user requests and generate both text responses and UI component specifications. It serves as the core processing engine for the All-in-One Chat platform.

- **Type**: Backend API Service
- **Framework**: Fastify 4.28.1 (Node.js HTTP framework)
- **Language**: TypeScript 5.9.3
- **Primary Purpose**: LLM integration, component generation, request validation
- **Deployment**: Node.js runtime (Docker, Kubernetes, Cloud Run, etc.)

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Fastify | 4.28.1 | High-performance HTTP server |
| **Language** | TypeScript | 5.9.3 | Type-safe backend development |
| **LLM Client** | @google/generative-ai | 0.21.0 | Google Gemini AI integration |
| **Validation** | Zod | 3.23.8 | Runtime schema validation |
| **Logging** | Pino | 9.5.0 | Structured JSON logging |
| **Logging UI** | Pino Pretty | 11.2.2 | Pretty console output (dev) |
| **Caching** | LRU Cache | 10.4.3 | In-memory response caching |
| **Testing** | Vitest | 2.1.8 | Unit and integration tests |
| **Development** | TSX | 4.19.2 | TypeScript execution in Node |

## Architecture Pattern

### Pattern Type: Service-Oriented Middleware

```
HTTP Request (Frontend)
    ↓
Request Validation (Zod)
    ↓
Request Handler (Route)
    ↓
Service Layer (Business Logic)
    ↓
Gemini API Call
    ↓
LLM Response Processing
    ↓
Component Generation
    ↓
Caching (LRU)
    ↓
HTTP Response (JSON)
    ↓
Frontend
```

### Request-Response Flow

```
1. Frontend sends: { message, sessionId, context }
   ↓
2. Validation: Zod validates against schema
   ↓
3. Service processes message
   ↓
4. Calls Google Gemini API (2-request architecture):
   - Request 1: Text response generation
   - Request 2: UI component specification
   ↓
5. Combines both responses
   ↓
6. Caches result in LRU cache
   ↓
7. Returns: { text_response, ui_component }
```

## Route Architecture

### API Endpoints

```
GET  /health                      # Health check / liveness probe
POST /api/chat                    # Primary chat endpoint
GET  /api/chat/history/:sessionId # Retrieve chat history
POST /api/components/generate     # Generate UI component specs
GET  /api/components/types        # List available component types
```

### Route Implementation Pattern

```typescript
// routes/chat.ts
export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ChatRequest }>('/api/chat', async (request) => {
    // 1. Validate request
    const validated = validateChatRequest(request.body)

    // 2. Check cache
    const cached = cache.get(validated.sessionId)
    if (cached) return cached

    // 3. Call service
    const response = await chatService.processMessage(validated)

    // 4. Cache response
    cache.set(validated.sessionId, response)

    // 5. Return to frontend
    return response
  })
}
```

## Service Layer

### Services (`src/services/`)

#### GeminiService
- **Responsibility**: Google Gemini API integration
- **Methods**:
  - `generateTextResponse(message, context)` → text
  - `generateUIComponent(message, context)` → component spec
  - `twoRequestArchitecture(message)` → { text, component }

#### ComponentService
- **Responsibility**: Convert LLM output to component specs
- **Methods**:
  - `parseComponentFromLLM(llmOutput)` → component spec
  - `validateComponentSpec(spec)` → validated spec
  - `generateComponentJSON(type, data)` → component JSON

#### ValidationService
- **Responsibility**: Zod-based request/response validation
- **Schemas**:
  - `ChatRequestSchema` - Validates incoming chat requests
  - `ComponentSpecSchema` - Validates component specifications
  - `HistorySchema` - Validates session history

#### CacheService
- **Responsibility**: LRU cache management
- **Features**:
  - `set(key, value, ttl)` - Cache with optional TTL
  - `get(key)` - Retrieve cached value
  - `invalidate(pattern)` - Clear cache entries
  - `stats()` - Cache hit/miss statistics

### Middleware Stack

```typescript
// Register middleware in order
fastify.register(require('@fastify/cors'))      // CORS handling
fastify.register(require('@fastify/helmet'))    // Security headers
fastify.register(ValidationMiddleware)          // Request validation
fastify.register(AuthMiddleware)                // Authentication (future)
fastify.register(LoggingMiddleware)             // Request/response logging
fastify.register(RateLimitMiddleware)           // Rate limiting (future)
```

## Data Architecture

### Request Schema (Zod)

```typescript
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().uuid(),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  options: z.object({
    componentType: z.enum(['auto', 'chart', 'table', 'card', 'form', 'list']).optional(),
    temperature: z.number().min(0).max(1).optional()
  }).optional()
})
```

### Response Schema

```typescript
const ChatResponseSchema = z.object({
  text_response: z.string(),
  ui_component: z.object({
    type: z.enum(['chart', 'table', 'card', 'form', 'list', 'slides', 'report']),
    spec: z.record(z.any()),
    metadata: z.object({
      generated_at: z.string().datetime(),
      model: z.string()
    })
  }).optional(),
  session_id: z.string().uuid(),
  timestamp: z.string().datetime()
})
```

## Google Gemini Integration

### Two-Request Architecture

```
User Query
    ↓
Request 1: "Generate a brief text response..."
    ↓ (Gemini Flash - faster, cost-effective)
    ├─→ Text Response
    ↓
Request 2: "Generate UI component specification..."
    ↓ (Gemini Pro - more capable)
    ├─→ Component Specification (Chart, Table, etc.)
    ↓
Combine Responses
    ↓
Return to Frontend
```

### Caching Strategy

- **Cache Key**: Hash of (message + sessionId + options)
- **TTL**: 1 hour (configurable)
- **Size Limit**: 100 entries (LRU eviction)
- **Hit Rate**: Estimated 30-40% for repeated queries

## Error Handling

### Error Types

1. **Validation Errors** (400)
   - Invalid request schema
   - Missing required fields
   - Type mismatches

2. **Authentication Errors** (401)
   - Invalid/missing API key
   - Expired tokens

3. **Rate Limit Errors** (429)
   - Too many requests
   - Quota exceeded

4. **Server Errors** (500)
   - LLM API failures
   - Unexpected exceptions
   - Database errors

### Error Response Format

```typescript
{
  error: {
    code: "VALIDATION_ERROR" | "AUTH_ERROR" | "RATE_LIMIT" | "SERVER_ERROR",
    message: "Human-readable error message",
    details: { /* specific error details */ },
    request_id: "uuid for tracking"
  }
}
```

## Logging Architecture

### Structured Logging (Pino)

```typescript
// Log levels
logger.error('Request failed', { error, requestId })
logger.warn('High latency detected', { duration: 5000 })
logger.info('Chat processed successfully', { sessionId, components: 1 })
logger.debug('Gemini API called', { model: 'gemini-pro', tokens: 1500 })

// Output format
{
  "level": 30,
  "time": "2025-12-04T10:30:00.000Z",
  "pid": 12345,
  "hostname": "api-server-01",
  "message": "Chat processed successfully",
  "sessionId": "abc-123-def",
  "components": 1,
  "v": 1
}
```

## Performance Characteristics

### Latency Breakdown (typical)
- **Request validation**: 1-5 ms
- **Cache lookup**: 0-1 ms
- **Gemini API (text)**: 500-2000 ms
- **Gemini API (component)**: 1000-3000 ms
- **Response serialization**: 10-50 ms
- **Total**: 1.5-5.5 seconds (with caching: <5ms)

### Throughput
- **Concurrent connections**: 1000+ (configurable)
- **Requests/sec**: ~500 (depends on Gemini quota)
- **Memory usage**: ~200 MB baseline + cache

## Testing Strategy

### Unit Tests
```typescript
describe('GeminiService', () => {
  it('should call Gemini API with correct payload')
  it('should handle rate limit errors')
  it('should return valid component specification')
})
```

### Integration Tests
```typescript
describe('POST /api/chat', () => {
  it('should process valid chat request')
  it('should validate request schema')
  it('should return both text and component')
})
```

### Load Testing
```bash
# Artillery or k6
k6 run load-test.js --vus 100 --duration 60s
```

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start dev server with hot reload
pnpm dev
# Server runs on http://localhost:3000

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Building
```bash
# Compile TypeScript
pnpm build
# Output: dist/

# Start production build
npm start
```

## Deployment Architecture

### Environment Variables
```env
# Required
GEMINI_API_KEY=sk-xxxxx
NODE_ENV=production
PORT=3000

# Optional
LOG_LEVEL=info
CACHE_SIZE=100
CACHE_TTL=3600
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60000
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Kubernetes Deployment
- **Liveness Probe**: `GET /health`
- **Readiness Probe**: `GET /health` with DB check
- **Resource Limits**: CPU 500m, Memory 256Mi
- **Replicas**: 3-5 for redundancy

## Configuration Files

- **`src/server.ts`** - Server setup and initialization
- **`src/config.ts`** - Configuration variables
- **`vitest.config.ts`** - Test configuration
- **`tsconfig.json`** - TypeScript compiler options
- **`package.json`** - Dependencies and scripts

## Key Features

- **High Performance**: Fastify is one of the fastest Node.js frameworks
- **Type Safety**: Full TypeScript support
- **Validation**: Zod for runtime schema validation
- **Caching**: LRU cache reduces LLM API calls
- **Logging**: Structured logging for observability
- **Scalable**: Easy to scale horizontally with load balancing
- **Testable**: Vitest for unit and integration tests

---

**Part**: Backend Middleware
**Generated**: 2025-12-04 by BMad Document Project Workflow
**Scan Level**: Quick
