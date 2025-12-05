# GenUI Platform - Architecture & Technical Design

**Version**: 1.0
**Status**: Sprint 1 Complete
**Last Updated**: December 5, 2025

---

## 📐 Architecture Overview

GenUI Platform follows a **modern monorepo architecture** with clear separation between frontend, backend, and shared components. The system implements a **dual-stream response pattern** where text summaries and component specifications are generated in parallel for optimal user experience.

```
┌─────────────────────────────────────────────────────────────┐
│                    GenUI Platform                           │
├──────────────────────────────┬──────────────────────────────┤
│        Frontend (Next.js)     │      Backend (Fastify)      │
│  ┌──────────────────────┐    │  ┌────────────────────────┐  │
│  │ Chat Interface UI    │    │  │ Component Generation   │  │
│  │ Message Display      │────┼──│ LLM Service            │  │
│  │ API Client           │    │  │ Session Manager        │  │
│  │ State Management     │    │  │ Request Handler        │  │
│  └──────────────────────┘    │  └────────────────────────┘  │
│                              │                              │
│   Port: 3002 (dev/Docker)   │      Port: 3001             │
│            or 3000           │                              │
└──────────────────────────────┴──────────────────────────────┘
         ↓                            ↓
┌────────────────────────────────────────────────┐
│      Docker Container Orchestration            │
│  (docker-compose with genui-network bridge)    │
└────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │  Frontend (React Components)
│  (UI, User Interaction, State Mgmt)    │
└─────────────────────────────────────────┘
                ↓ HTTP/REST ↓
┌─────────────────────────────────────────┐
│        API Layer                        │  Backend (Fastify Routes)
│  (Request/Response, Validation)         │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│        Business Logic Layer             │  Services
│  (Component Generation, Session Mgmt)   │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│        Data & Integration Layer         │  External APIs (Gemini)
│  (LLM Integration, Memory Store)        │
└─────────────────────────────────────────┘
```

### Request Flow - Chat Message Processing

```
User Input (Frontend)
         ↓
   ChatInterface Component
         ↓
   useDualStreamUI Hook
         ↓
   API Client (apps/web/lib/api-client.ts)
         ↓
[HTTP POST /api/chat]
         ↓
Fastify Server (packages/middleware/src/server.ts)
         ↓
DualRequestHandler
         ├─→ Text Generation Branch
         │   ↓
         │   MockLLMGenerator (or Gemini Flash)
         │   ↓
         │   Text Summary Output
         │
         └─→ Component Generation Branch
             ↓
             ComponentGenerationService
             ↓
             MockLLMGenerator (or Gemini Pro)
             ↓
             Component Spec (validated)
             ↓
         Merge Results
         ↓
   SessionService (Store)
         ↓
[HTTP 200 Response]
         ↓
Frontend API Client
         ↓
useDualStreamUI Hook
         ↓
ChatInterface Updates State
         ↓
MessageBubble & ComponentRenderer
         ↓
UI Update (Visual Output)
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
Playground Page (apps/web/app/playground/page.tsx)
         ↓
   ChatLayout (main container)
         ↓
   ┌─────────────────────┐
   │  ChatInterface      │
   ├─────────────────────┤
   │ - Message Input     │
   │ - Send Button       │
   │ - New Chat Button   │
   │ - Message List      │
   └─────────────────────┘
         ↓
   ┌─────────────────────┐
   │  MessageBubble      │
   ├─────────────────────┤
   │ - User Message      │
   │ - Assistant Message │
   │ - Timestamp         │
   │ - Component Area    │
   └─────────────────────┘
         ↓
   ┌─────────────────────┐
   │ ComponentRenderer   │
   ├─────────────────────┤
   │ - Collapsible Ctrl  │
   │ - Component Display │
   │ - Error Handling    │
   └─────────────────────┘
```

### State Management (useDualStreamUI Hook)

```typescript
interface DualStreamUIState {
  messages: ChatMessage[]          // Conversation history
  isLoading: boolean               // Request in progress
  error: string | null             // Error message
  sessionId: string               // Current session

  // Methods:
  sendMessage(message, sessionId) // Send chat message
  reset()                         // Clear conversation
  addMessage(message)             // Add message to history
}
```

### API Client Pattern

```typescript
class APIClient {
  // Configuration
  baseURL: string                 // Backend API endpoint

  // Methods
  sendMessage(message, sessionId) // POST /api/chat
  createSession()                 // POST /api/sessions
  getSession(id)                  // GET /api/sessions/:id
  getHistory(id)                  // GET /api/sessions/:id/history
  deleteSession(id)               // DELETE /api/sessions/:id

  // Response Parsing
  private parseResponse(body)     // Unwrap {success, data} envelope
}
```

### UI Design Pattern: Progressive Disclosure

**Principle**: Text always visible, components optional and collapsible

```
┌─────────────────────────────────────────────┐
│ Assistant                                    │
├─────────────────────────────────────────────┤
│ "Here's a summary of your sales..."        │
│ (Always visible, no scrolling needed)       │
│                                             │
│ [> Show Components] ← Collapsed             │
└─────────────────────────────────────────────┘

Expanded View:
┌─────────────────────────────────────────────┐
│ Assistant                                    │
├─────────────────────────────────────────────┤
│ "Here's a summary of your sales..."        │
│                                             │
│ [∨ Hide Components]                         │
│ ┌─────────────────────────────────────────┐ │
│ │ [Chart Component Rendered Here]         │ │
│ │                                         │ │
│ │ Sales by Quarter                        │ │
│ │ [Bar chart visualization]               │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## ⚙️ Backend Architecture

### Service-Oriented Design

Each service has **single responsibility** and clear interfaces:

#### 1. Session Service
```typescript
SessionService {
  createSession()           // Generate unique session
  getSession(id)           // Retrieve session details
  getHistory(id)           // Get conversation messages
  updateSession(id, data)  // Store new messages
  deleteSession(id)        // Clean up session

  // Validation
  validateSessionId(id)    // Verify session exists
}

// Storage: In-memory (Phase 3: Database)
// Persistence: Message history with context window (default: 10)
```

#### 2. Component Generation Service
```typescript
ComponentGenerationService {
  generateComponent(
    spec: ComponentSpec,
    data: any
  ): React.ComponentType

  validateComponent(spec): boolean

  // Component types:
  // - Chart (line, bar, pie, area, scatter, radar, combo)
  // - Table (sortable, paginated)
  // - Card (summary)
  // - Form (multi-field)
  // - List (searchable)
  // - Slides (carousel)
  // - Report (formatted)
}
```

#### 3. LLM Service (Mock & Gemini)
```typescript
MockLLMGenerator {
  generateText(prompt): string
  generateComponentSpec(prompt): ComponentSpec
  validateOutput(output, schema): boolean
}

// Mock mode: Returns realistic sample responses
// Real mode (Phase 2): Integrates Gemini API
// - Gemini Flash: Text generation
// - Gemini Pro: Component specification
```

#### 4. Dual Request Handler
```typescript
DualRequestHandler {
  process(message, sessionId): Promise<DualResponse>

  // Parallel execution:
  // 1. Text generation (Mock LLM or Gemini Flash)
  // 2. Component spec generation (Mock LLM or Gemini Pro)
  // 3. Merge results into single response
  // 4. Store in session
}
```

### Route Handlers

```typescript
// Main Routes
POST   /api/chat                    // Process message
GET    /api/sessions/:id            // Get session
GET    /api/sessions/:id/history    // Get conversation
DELETE /api/sessions/:id            // Delete session
POST   /api/sessions                // Create session

// Health
GET    /health                      // Service health check
```

### Type Safety

```typescript
// Request/Response Types
interface ChatRequest {
  message: string
  sessionId?: string
}

interface DualResponse {
  textSummary: string
  componentSpec: ComponentSpec | null
}

interface ComponentSpec {
  type: ComponentType              // chart, table, card, etc.
  props: Record<string, any>      // Component-specific props
  data?: any                      // Component data
}
```

---

## 🔄 Data Flow - Dual-Stream Processing

### Phase 1: Request Reception & Validation
```
User Message → Fastify Handler
                    ↓
            Validate Request
            - Check message exists
            - Check sessionId (optional)
            - Validate input length
                    ↓
            Request Valid
```

### Phase 2: Parallel Processing

```
Request
   ├─────────────────────────┬──────────────────────────┐
   ↓                         ↓                          ↓
Text Generation        Component Generation      Session Store
   ↓                         ↓                          ↓
Prompt Formatting     Prompt Formatting        Retrieve History
   ↓                         ↓                          ↓
LLM Call (Flash)      LLM Call (Pro)          Context Assembly
   ↓                         ↓                          ↓
Text Output           Spec Generation           History Update
   ↓                         ↓                          ↓
   └─────────────────────┬──────────────────────────┘
                         ↓
                   Merge Results
                         ↓
                   Response Object
```

### Phase 3: Response Construction

```
Merge Results
   ├─ textSummary: string          // From Text LLM
   ├─ componentSpec: ComponentSpec // From Component LLM
   └─ (optional) error: string     // If either fails
            ↓
    Wrap in Response Envelope
    {
      success: true,
      data: {
        textSummary: "...",
        componentSpec: {...}
      }
    }
            ↓
     Send to Client
```

---

## 🗄️ Data Models

### Session Model
```typescript
interface Session {
  id: string                    // Unique identifier
  createdAt: Date              // Creation timestamp
  updatedAt: Date              // Last update timestamp
  messages: ChatMessage[]      // Conversation history
  metadata: {
    messageCount: number       // Total messages
    contextWindow: number      // Messages to keep (default: 10)
  }
}
```

### Chat Message Model
```typescript
interface ChatMessage {
  id: string                   // Unique message ID
  content: string             // Text content
  role: 'user' | 'assistant'  // Message sender
  timestamp: Date             // When sent
  componentSpec?: ComponentSpec // Optional UI component
}
```

### Component Specification Model
```typescript
interface ComponentSpec {
  type: 'chart' | 'table' | 'card' | 'form' | 'list' | 'slides' | 'report'
  props: Record<string, any>  // Type-specific properties
  data?: any                  // Data for rendering

  // Chart-specific
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'combo'
  title?: string
  description?: string

  // Validation
  isValid?: boolean           // Schema validation result
}
```

---

## 🔌 Integration Points

### External APIs (Phase 2+)

```
Frontend (Next.js)
      ↓
 API Client
      ↓
Fastify Backend
      ↓
    ┌─────────────────────────────────────┐
    │     Google Generative AI API        │
    │  - Gemini Flash (text generation)   │
    │  - Gemini Pro (component specs)     │
    └─────────────────────────────────────┘
```

### Authentication (Phase 3+)

```
Frontend
    ↓
API Client (+ Bearer Token)
    ↓
Fastify Middleware (JWT Verify)
    ↓
Route Handler
    ↓
Service Layer
```

---

## 🔐 Security Architecture

### Current Implementation (MVP)
- ✅ CORS properly configured
- ✅ Request validation with Zod
- ✅ Type-safe data handling
- ✅ Error boundary middleware

### Planned (Phase 3+)
- 🔄 JWT Authentication
- 🔄 Rate limiting
- 🔄 Input sanitization
- 🔄 Encryption for sensitive data
- 🔄 HTTPS only in production

---

## 📦 Deployment Architecture

### Development Deployment

```
Developer Machine
    ├─ Node.js 22
    ├─ pnpm workspaces
    ├─ TypeScript compilation
    └─ Hot module replacement (HMR)

    Port 3002: Frontend (Next.js dev)
    Port 3001: Backend (Fastify dev)
    Port 3000: Next.js preview
```

### Docker Deployment

```
Docker Host
    ├─ genui-network (bridge)
    │   ├─ genui-frontend container
    │   │   ├─ Image: node:22-alpine
    │   │   ├─ Port: 3000 → 8080
    │   │   └─ Process: next start
    │   │
    │   └─ genui-middleware container
    │       ├─ Image: node:22-alpine
    │       ├─ Port: 3001 → 3001
    │       └─ Process: node dist/server.js
    │
    └─ Environment Volumes
        └─ Configuration (.env)
```

### Multi-Stage Build Strategy

```
Build Stage (Builder)
    ├─ Install dependencies
    ├─ Compile TypeScript
    ├─ Build Next.js
    └─ Generate artifacts

Runtime Stage
    ├─ Copy only production artifacts
    ├─ Minimal image size (optimization)
    ├─ Run production server
    └─ No build tools in image
```

---

## 📊 Technology Stack Decision Matrix

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 | SSR support, built-in optimization |
| Frontend | React 19 | Latest features, server components |
| Styling | Tailwind CSS | Utility-first, rapid development |
| Backend | Fastify | High performance, TypeScript native |
| Runtime | Node.js 22 | Latest features, active LTS |
| Package Mgr | pnpm | Monorepo support, disk efficiency |
| Containerization | Docker | Multi-stage builds, production ready |
| Orchestration | Docker Compose | Local development, simple deployment |
| Validation | Zod | Runtime schema validation |
| Testing | Jest | Comprehensive test framework |

---

## 🔄 Extension Points for Future Phases

### Phase 2: Real LLM Integration
```typescript
// Replace MockLLMGenerator with:
class GeminiLLMGenerator {
  constructor(apiKey: string) {}

  async generateText(prompt): Promise<string>
  async generateComponentSpec(prompt): Promise<ComponentSpec>

  // Streaming support
  async *generateTextStream(prompt): AsyncGenerator<string>
}
```

### Phase 3: Database Integration
```typescript
// Replace in-memory SessionService with:
class DatabaseSessionService {
  constructor(dbConnection: Connection) {}

  async createSession()
  async getSession(id)
  async updateSession(id, data)
  async deleteSession(id)

  // Transactions for consistency
  async withTransaction<T>(fn: () => Promise<T>)
}
```

### Phase 4: Authentication
```typescript
// Add auth middleware:
class AuthMiddleware {
  verify(token: string): Promise<User>
  issue(user: User): string
  refresh(token: string): Promise<string>
}
```

---

## ⚡ Performance Considerations

### Frontend Optimization
- ✅ Next.js automatic code splitting
- ✅ Image optimization
- ✅ Font optimization
- 🔄 Lazy component loading (Phase 3)
- 🔄 Caching strategies (Phase 3)

### Backend Optimization
- ✅ Fastify streaming support
- ✅ Multi-core utilization
- ✅ In-memory caching (sessions)
- 🔄 Database indexing (Phase 3)
- 🔄 CDN for static assets (Phase 4)

### Network Optimization
- ✅ Parallel dual-stream requests
- ✅ Minified production builds
- ✅ Gzip compression (Fastify)
- 🔄 HTTP/2 push (Phase 4)
- 🔄 WebSocket for real-time (Phase 3)

---

## 🧪 Testing Architecture

### Unit Testing
```
Frontend Components
    └─ jest + React Testing Library

Backend Services
    └─ jest + mock dependencies
```

### Integration Testing
```
API Client ↔ Fastify Routes
    └─ jest + API mocking
```

### E2E Testing (Planned - Phase 3)
```
Full user workflow
    └─ Playwright + test fixtures
```

---

## 📈 Scalability Strategy

### Horizontal Scaling (Phase 4)
```
Load Balancer
    ├─ Frontend Container 1
    ├─ Frontend Container 2
    ├─ Frontend Container N
    └─ Backend Container Pool
        ├─ Backend Instance 1
        ├─ Backend Instance 2
        └─ Backend Instance N
```

### Caching Layer (Phase 3)
```
Application Layer
    ↓
Redis Cache (sessions, components)
    ↓
Database Layer
```

---

## 🎯 Architectural Principles

1. **Single Responsibility Principle (SRP)**
   - Each service has one reason to change
   - Clear separation of concerns

2. **Dependency Injection**
   - Services compose through injection
   - Testable and flexible

3. **Type Safety**
   - TypeScript strict mode throughout
   - Compile-time error catching

4. **Progressive Enhancement**
   - UI works without components
   - Components enhance experience

5. **Fail Gracefully**
   - Error boundaries in components
   - Mock data fallbacks
   - User-friendly error messages

---

## 📚 Key Architectural Files

| File | Purpose |
|------|---------|
| `packages/middleware/src/server.ts` | Backend entry point |
| `packages/middleware/src/services/` | Business logic |
| `packages/middleware/src/types/` | Shared type definitions |
| `apps/web/components/chat/` | UI components |
| `apps/web/hooks/useDualStreamUI.ts` | State management |
| `apps/web/lib/api-client.ts` | Backend integration |
| `docker-compose.yml` | Deployment configuration |

---

## 🔗 References

- [Next.js Architecture](https://nextjs.org/docs)
- [Fastify Design](https://www.fastify.io/docs/latest/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [React Component Patterns](https://react.dev/reference)

---

**Architecture Last Reviewed**: December 5, 2025
**Next Review**: Phase 2 Planning (Real LLM Integration)
