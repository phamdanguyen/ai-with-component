# Technical Specification
# All-in-One Chat - Generative UI Platform

**Phiên bản**: 1.0
**Ngày cập nhật**: 2025-12-05
**Đối Tượng**: Engineers, DevOps, Architects
**Giai Đoạn**: Phase 1 (MVP)

---

## 📋 Mục Lục
1. [System Requirements](#system-requirements)
2. [Development Environment](#development-environment)
3. [Backend Services Specification](#backend-services-specification)
4. [Frontend Components Specification](#frontend-components-specification)
5. [Database Schema (Phase 3)](#database-schema-phase-3)
6. [API Reference](#api-reference)
7. [Caching Strategy](#caching-strategy)
8. [Security Implementation](#security-implementation)
9. [Performance Targets](#performance-targets)
10. [Deployment & DevOps](#deployment--devops)
11. [Testing Strategy](#testing-strategy)
12. [Monitoring & Observability](#monitoring--observability)

---

## 🖥️ System Requirements

### Minimum Requirements (Development)
- **CPU**: Dual-core 2.0 GHz
- **RAM**: 4 GB
- **Disk**: 10 GB SSD
- **Network**: Broadband internet (for Gemini API)

### Recommended Requirements (Development)
- **CPU**: Quad-core 2.5 GHz
- **RAM**: 8 GB+
- **Disk**: 20 GB SSD
- **GPU**: Optional (not required)

### Production Requirements (Phase 3+)
- **Compute**: 2 x 2-core + 4GB RAM instances (load balanced)
- **Storage**: 100 GB SSD (PostgreSQL)
- **Cache**: Redis instance (2 GB)
- **CDN**: CloudFlare or AWS CloudFront

---

## 🛠️ Development Environment

### Prerequisites
- Node.js: >= 18.0.0 (LTS)
- Package Manager: PNPM >= 8.0.0
- Git: Latest version
- Docker: Latest (for local database, optional)

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repo-url>
cd all-in-one-chat
```

#### 2. Install Dependencies
```bash
# Install PNPM globally (if not installed)
npm install -g pnpm@8.15.0

# Install project dependencies
pnpm install
```

#### 3. Environment Setup
Create `.env` file in project root:
```env
# Backend
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Gemini API
GEMINI_API_KEY=your_api_key_here

# Optional (Phase 4+)
ODOO_URL=http://localhost:8069
ODOO_DATABASE=odoo_db
ODOO_USERNAME=admin
ODOO_PASSWORD=password

# Optional (Phase 3+)
DATABASE_URL=postgresql://user:password@localhost:5432/chat_db
REDIS_URL=redis://localhost:6379
```

#### 4. Get Gemini API Key
- Go to https://aistudio.google.com/app/apikey
- Click "Create API Key in new project"
- Copy key to `.env`
- (Free tier includes generous quotas)

#### 5. Start Development Servers
```bash
# All servers in parallel (turbo)
pnpm dev

# Or individually:
pnpm dev -F web        # Next.js (port 3000)
pnpm dev -F middleware # Fastify (port 3001)
```

#### 6. Verify Setup
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health (should return 200)
- Chat UI: http://localhost:3000/playground

---

## 🔧 Backend Services Specification

### Service Architecture

```typescript
Backend (packages/middleware/)
├── Server (Fastify)
├── Handlers (HTTP routes)
├── Middleware (dual-request-handler)
├── Services (business logic)
│   ├── DualRequestHandler (orchestrator)
│   ├── TextSummaryService
│   ├── ComponentGenerationService
│   ├── ToolExecutionService
│   ├── SessionManagementService
│   └── ErrorRecoveryService
├── LLMFactory (provider abstraction)
├── Storage (in-memory stores)
└── Types (shared definitions)
```

### DualRequestHandler Workflow

**File**: `packages/middleware/src/middleware/dual-request-handler.ts`

```typescript
async handle(request: ChatRequest): Promise<DualResponse> {
  // 1. Parse & validate request
  const { message, sessionId, conversationHistory } = request;

  // 2. Load or create session
  const session = await this.sessionService.get(sessionId);

  // 3. Load conversation context (last 5 messages)
  const context = await this.sessionService.getHistory(sessionId, 5);

  // 4. Select tools to use
  const toolsToUse = await this.selectTools(context, message);

  // 5. Execute selected tools (once, cached)
  const toolResults = await this.toolService.executeTools(toolsToUse);

  // 6a & 6b: PARALLEL generation
  const [textSummary, componentSpec] = await Promise.all([
    this.textService.generate({
      context,
      message,
      toolResults,
      model: 'gemini-1.5-flash'
    }),
    this.componentService.generate({
      context,
      message,
      toolResults,
      model: 'gemini-1.5-pro'
    })
  ]);

  // 7. Validate outputs
  const isTextValid = this.validateText(textSummary);
  const isComponentValid = this.validateComponent(componentSpec);

  // 8. If component invalid, retry (error recovery)
  if (!isComponentValid) {
    componentSpec = await this.errorRecovery.retryComponentGeneration(...);
  }

  // 9. Return response
  return {
    success: true,
    data: {
      textSummary,
      componentSpec: isComponentValid ? componentSpec : null,
      metadata: {
        textGenTime: ...,
        componentGenTime: ...,
        toolsUsed: toolsToUse
      }
    }
  };
}
```

### TextSummaryService

**File**: `packages/middleware/src/services/text-summary.service.ts`

```typescript
interface ITextGenerator {
  generate(context: GenerationContext): Promise<string>;
}

class TextSummaryService implements ITextGenerator {
  async generate(context: GenerationContext): Promise<string> {
    const { conversationContext, message, toolResults, model } = context;

    // Build prompt
    const systemPrompt = `You are a helpful assistant. Summarize the response in 2-3 sentences.`;

    const userPrompt = `
      Conversation: ${this.formatConversation(conversationContext)}
      User message: ${message}
      Tool results: ${JSON.stringify(toolResults)}

      Provide a brief summary (max 3 sentences).
    `;

    // Call Gemini Flash
    const response = await this.llmFactory.call(model, {
      systemPrompt,
      userPrompt,
      maxTokens: 200,
      temperature: 0.7
    });

    return response.text;
  }

  private formatConversation(messages: Message[]): string {
    return messages.map(m => `${m.role}: ${m.content}`).join('\n');
  }
}
```

### ComponentGenerationService

**File**: `packages/middleware/src/services/component-generation.service.ts`

```typescript
interface IStructuredGenerator {
  generate(context: GenerationContext): Promise<ComponentSpec | null>;
}

class ComponentGenerationService implements IStructuredGenerator {
  async generate(context: GenerationContext): Promise<ComponentSpec | null> {
    try {
      return await this.generateWithRetry(context, 0);
    } catch (error) {
      logger.error('Component generation failed', error);
      return null; // Fallback to text-only
    }
  }

  private async generateWithRetry(
    context: GenerationContext,
    retryCount: number
  ): Promise<ComponentSpec | null> {
    if (retryCount > 2) {
      return null; // Give up after 3 attempts
    }

    const systemPrompt = `You are an expert UI engineer.
      Generate a component specification as JSON.
      The JSON must be valid and match the schema.
      Only output valid JSON, no markdown.`;

    const userPrompt = `
      Based on: ${context.message}
      Tool results: ${JSON.stringify(context.toolResults)}

      Generate ONE component from: Chart, Table, Card, Form, List, Slides, Report
      Return JSON: { "type": "...", "props": {...} }
    `;

    // Call Gemini Pro
    const response = await this.llmFactory.call('gemini-1.5-pro', {
      systemPrompt,
      userPrompt,
      maxTokens: 1000,
      temperature: 0.5,
      responseFormat: 'json'
    });

    // Validate JSON
    const componentSpec = JSON.parse(response.text);
    const validated = this.validators.validate(componentSpec);

    if (!validated.success) {
      logger.warn(`Validation failed, retrying (attempt ${retryCount + 1})`, validated.error);

      // Retry with component-specific prompt
      const refinedPrompt = this.getComponentSpecificPrompt(validated.error, context);
      return this.generateWithRetry({
        ...context,
        message: refinedPrompt
      }, retryCount + 1);
    }

    return validated.data;
  }

  private validators = {
    validate(spec: any) {
      const schema = zodComponentSpecSchema;
      const result = schema.safeParse(spec);
      return result;
    }
  };
}
```

### ToolExecutionService

**File**: `packages/middleware/src/services/tool-execution.service.ts`

```typescript
interface IToolCaller {
  call(toolName: string, params: Record<string, any>): Promise<any>;
  executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]>;
}

class ToolExecutionService implements IToolCaller {
  private cache = new LRUCache({ max: 100, ttl: 5 * 60 * 1000 }); // 5 min
  private registry: Map<string, Tool> = new Map();

  constructor() {
    this.registerBuiltInTools();
  }

  async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    return Promise.all(
      toolCalls.map(call => this.call(call.name, call.params))
    );
  }

  async call(toolName: string, params: Record<string, any>): Promise<any> {
    // Check cache
    const cacheKey = `${toolName}:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cached;
    }

    // Get tool definition
    const tool = this.registry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // Validate input
    const validation = tool.inputSchema.safeParse(params);
    if (!validation.success) {
      throw new Error(`Invalid input: ${validation.error.message}`);
    }

    // Execute tool
    const result = await tool.fn(validation.data);

    // Cache result
    this.cache.set(cacheKey, result);
    logger.debug(`Tool executed: ${toolName}`);

    return result;
  }

  private registerBuiltInTools() {
    // Tool 1: get_current_date
    this.registry.set('get_current_date', {
      name: 'get_current_date',
      description: 'Get current date and time',
      inputSchema: z.object({}),
      outputSchema: z.string(),
      fn: async () => new Date().toISOString()
    });

    // Tool 2: calculate
    this.registry.set('calculate', {
      name: 'calculate',
      description: 'Calculate mathematical expression',
      inputSchema: z.object({ expression: z.string() }),
      outputSchema: z.number(),
      fn: async (params) => {
        // Safe expression evaluation
        return Function('"use strict"; return (' + params.expression + ')')();
      }
    });

    // Tool 3: get_weather
    this.registry.set('get_weather', {
      name: 'get_weather',
      description: 'Get weather for a city',
      inputSchema: z.object({ city: z.string() }),
      outputSchema: z.object({
        temp: z.number(),
        condition: z.string(),
        humidity: z.number()
      }),
      fn: async (params) => {
        // Mock implementation (Phase 2: integrate real API)
        return {
          temp: 72,
          condition: 'Sunny',
          humidity: 60
        };
      }
    });

    // ... 4 more tools (see PRD for full list)
  }

  getAvailableTools() {
    return Array.from(this.registry.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema.describe(),
      outputSchema: tool.outputSchema.describe()
    }));
  }
}
```

### SessionManagementService

**File**: `packages/middleware/src/services/session-management.service.ts`

```typescript
interface ISessionStore {
  create(): Promise<Session>;
  get(sessionId: string): Promise<Session>;
  update(sessionId: string, data: Partial<Session>): Promise<void>;
  delete(sessionId: string): Promise<void>;
  getHistory(sessionId: string, limit: number): Promise<Message[]>;
  addMessage(sessionId: string, message: Message): Promise<void>;
}

class SessionManagementService implements ISessionStore {
  private store: InMemorySessionStore; // Phase 1
  // Phase 3: Replace with DatabaseSessionStore

  async create(): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastAccessed: new Date(),
      messages: []
    };

    await this.store.set(session.id, session);
    logger.info(`Session created: ${session.id}`);

    return session;
  }

  async get(sessionId: string): Promise<Session> {
    const session = await this.store.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update last accessed
    session.lastAccessed = new Date();
    await this.store.set(sessionId, session);

    return session;
  }

  async getHistory(sessionId: string, limit: number = 5): Promise<Message[]> {
    const session = await this.get(sessionId);
    return session.messages.slice(-limit);
  }

  async addMessage(sessionId: string, message: Message): Promise<void> {
    const session = await this.get(sessionId);
    session.messages.push({
      ...message,
      timestamp: new Date()
    });
    await this.store.set(sessionId, session);
  }
}
```

---

## 🎨 Frontend Components Specification

### Chat Interface Component

**File**: `apps/web/components/chat/ChatInterface.tsx`

```typescript
interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  loading: boolean;
  error?: string;
}

export function ChatInterface({
  onSendMessage,
  messages,
  loading,
  error
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h1 className="text-xl font-bold">All-in-One Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <MessageWithComponent
            key={idx}
            message={msg}
          />
        ))}

        {loading && <TypingIndicator />}
        {error && <ErrorBoundary error={error} />}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi gì đó..."
            disabled={loading}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### MessageWithComponent

**File**: `apps/web/components/chat/MessageWithComponent.tsx`

```typescript
interface MessageWithComponentProps {
  message: Message;
}

export function MessageWithComponent({ message }: MessageWithComponentProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl p-4 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Text content */}
        <p className="mb-3">{message.content}</p>

        {/* Component toggle */}
        {message.componentSpec && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm underline mt-2"
            >
              {expanded ? '▼ Hide details' : '▶ View details'}
            </button>

            {/* Component (collapsed by default) */}
            {expanded && (
              <div className="mt-4 border-t pt-4">
                <DynamicRenderer componentSpec={message.componentSpec} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### DynamicRenderer

**File**: `apps/web/lib/dynamic-renderer.tsx`

```typescript
const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  'Chart': ChartComponent,
  'Table': TableComponent,
  'Card': CardComponent,
  'Form': FormComponent,
  'List': ListComponent,
  'Slides': SlidesComponent,
  'Report': ReportComponent,
};

interface DynamicRendererProps {
  componentSpec: ComponentSpec;
}

export function DynamicRenderer({ componentSpec }: DynamicRendererProps) {
  const Component = COMPONENT_REGISTRY[componentSpec.type];

  if (!Component) {
    return <div className="text-red-600">Unknown component: {componentSpec.type}</div>;
  }

  return (
    <ErrorBoundary>
      <Component {...componentSpec.props} />
    </ErrorBoundary>
  );
}
```

### useDualStreamUI Hook

**File**: `apps/web/hooks/useDualStreamUI.ts`

```typescript
interface UseDualStreamUIReturn {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

export function useDualStreamUI(): UseDualStreamUIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  // Initialize session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      setError(undefined);

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Create session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const response = await apiClient.createSession();
        currentSessionId = response.sessionId;
        setSessionId(currentSessionId);
        localStorage.setItem('sessionId', currentSessionId);
      }

      // Send to backend
      const response = await apiClient.sendMessage(message, currentSessionId);

      // Add assistant message with text + component
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.textSummary,
        componentSpec: response.data.componentSpec || undefined,
        metadata: response.data.metadata,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error };
}
```

---

## 💾 Database Schema (Phase 3)

### PostgreSQL DDL

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_email UNIQUE (email)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  CONSTRAINT unique_session_per_user UNIQUE (user_id)
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  component_spec JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_created_at (created_at)
);

-- Tool cache table
CREATE TABLE tool_cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB,
  expires_at TIMESTAMP,
  INDEX idx_expires (expires_at)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
```

---

## 📡 API Reference

### POST /api/chat

**Request**:
```json
{
  "message": "Show me sales by region",
  "sessionId": "sess-abc123",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What's our Q4 performance?"
    },
    {
      "role": "assistant",
      "content": "Q4 was strong with $2.5M revenue"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "textSummary": "Sales were led by North region (45%), South (30%), East (25%)",
    "componentSpec": {
      "type": "Chart",
      "props": {
        "chartType": "pie",
        "data": [
          { "name": "North", "value": 45 },
          { "name": "South", "value": 30 },
          { "name": "East", "value": 25 }
        ],
        "colors": ["#3b82f6", "#10b981", "#f59e0b"]
      }
    },
    "metadata": {
      "textGenTime": 1200,
      "componentGenTime": 2800,
      "toolsUsed": ["read_file"]
    }
  }
}
```

### GET /api/health

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T10:30:00Z"
}
```

### GET /api/tools

**Response** (200 OK):
```json
{
  "tools": [
    {
      "name": "get_current_date",
      "description": "Get current date and time",
      "inputSchema": {},
      "outputSchema": { "type": "string" }
    },
    {
      "name": "calculate",
      "description": "Calculate mathematical expression",
      "inputSchema": { "expression": "string" },
      "outputSchema": { "type": "number" }
    }
    // ... more tools
  ]
}
```

### POST /api/sessions

**Request**:
```json
{}
```

**Response** (200 OK):
```json
{
  "sessionId": "sess-xyz789",
  "createdAt": "2025-12-05T10:30:00Z"
}
```

### GET /api/sessions/:sessionId

**Response** (200 OK):
```json
{
  "id": "sess-xyz789",
  "createdAt": "2025-12-05T10:30:00Z",
  "lastAccessed": "2025-12-05T10:35:00Z",
  "messageCount": 5
}
```

### GET /api/sessions/:sessionId/history?limit=20

**Response** (200 OK):
```json
{
  "messages": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ],
  "total": 10
}
```

---

## 💾 Caching Strategy

### Layer 1: Browser Cache (Frontend)
- localStorage: SessionId
- sessionStorage: Current chat session
- Memory cache: Messages in React state

### Layer 2: Application Cache (Backend)
- LRU Cache: Tool results (5 min TTL)
- Key: `tool:params:hash`
- Size: 100 entries max

### Layer 3: Response Cache (Phase 2+)
- Redis: Similar query responses (1 hour TTL)
- Key: `response:query:hash`

### Cache Invalidation
- **Tool results**: Automatic 5 min TTL
- **Response cache**: Manual or TTL-based
- **Tool output**: On error, retry without cache

---

## 🔒 Security Implementation

### Input Validation
- **All inputs**: Validate with Zod schemas
- **LLM prompts**: Escape user input to prevent injection
- **Component props**: Validate against component schema

### Output Validation
- **AI responses**: Must match expected schema
- **Components**: Render in isolated error boundary
- **Tool execution**: Validate tool outputs

### API Security
- **CORS**: Configure allowed origins
- **Rate limiting**: TBD (Phase 2)
- **Authentication**: TBD (Phase 3)

### Environment Security
- **.env**: Never commit to git
- **Secrets**: Use environment variables
- **API keys**: Rotate regularly

### XSS Prevention
- **React default**: JSX escapes by default
- **HTML content**: Use dangerouslySetInnerHTML only if sanitized
- **User input**: Displayed as text, not HTML

### SQL Injection Prevention (Phase 3+)
- Use ORM (e.g., Prisma) with parameterized queries
- Never concatenate SQL strings

---

## 🚀 Performance Targets

| Metric | Target | Phase |
|--------|--------|-------|
| **Response time** | < 5 sec | 1 |
|   | < 3 sec | 2+ |
| **Component render** | < 500ms | 1 |
| **Page load** | < 3 sec | 1 |
| **Tool execution** | < 1 sec | 1 |
| **Cache hit time** | < 100ms | 1 |
| **P95 latency** | < 6 sec | 1 |
| **P99 latency** | < 10 sec | 1 |

### Performance Optimization Checklist
- [ ] Minify & bundle frontend code
- [ ] Lazy load components
- [ ] Cache HTTP responses (1 hour)
- [ ] Gzip compression on API responses
- [ ] Database query optimization (Phase 3)
- [ ] Connection pooling (Phase 3)

---

## 🚀 Deployment & DevOps

### Phase 1: Local Development
```bash
# Dev servers
pnpm dev

# Or run individually
pnpm dev -F web        # Frontend
pnpm dev -F middleware # Backend
```

### Phase 3+: Docker Deployment

**Dockerfile (Fastify backend)**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build -F middleware

EXPOSE 3001
CMD ["pnpm", "start", "-F", "middleware"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DATABASE_URL=postgresql://user:pass@postgres:5432/chat
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=chat
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Build & Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm build
```

---

## 🧪 Testing Strategy

### Unit Tests (Backend)
- Services: TextSummaryService, ComponentGenerationService, ToolExecutionService
- Coverage: 80%+
- Framework: Vitest
- Command: `pnpm test -F middleware`

### E2E Tests
- Full flow: Message → Response → Component render
- Framework: Playwright
- Command: `pnpm test:e2e`

### Integration Tests
- API endpoint testing
- Tool execution testing
- Session management testing

### Manual Testing Checklist
- [ ] Chat: Send 10+ messages, verify all render
- [ ] Components: All 7 types render correctly
- [ ] Progressive disclosure: Toggle components
- [ ] Error handling: Test invalid inputs, API timeouts
- [ ] Performance: Measure response time
- [ ] Mobile: Test on iPhone, Android
- [ ] Browsers: Chrome, Firefox, Safari, Edge

---

## 📊 Monitoring & Observability

### Logging
- **Level**: info, warn, error
- **Format**: JSON (structured logging)
- **Tool**: Pino + Pino-pretty
- **Centralization**: TBD (Phase 3: DataDog/New Relic)

### Metrics to Track (Phase 2+)
- Response time (P50, P95, P99)
- Component generation accuracy
- Tool execution success rate
- Cache hit ratio
- Error rate by endpoint

### Health Checks
- Backend health: `GET /health`
- Database connectivity (Phase 3)
- Redis connectivity (Phase 3)
- LLM API connectivity

### Error Tracking (Phase 3+)
- Tool: Sentry (error tracking)
- Auto-notify on critical errors
- Stack traces & context

---

**Document Version**: 1.0
**Last Updated**: 2025-12-05
**Owner**: Engineering Lead
**Status**: ACTIVE

---
