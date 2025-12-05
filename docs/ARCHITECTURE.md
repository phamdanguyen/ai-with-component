# System Architecture Document
# All-in-One Chat - Generative UI Platform

**Phiên bản**: 1.0
**Ngày cập nhật**: 2025-12-05
**Mục đích**: Định nghĩa kiến trúc hệ thống, component, data flow

---

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Layers & Tiers](#layers--tiers)
3. [Core Concepts](#core-concepts)
4. [Data Flow](#data-flow)
5. [Component Architecture](#component-architecture)
6. [Backend Services](#backend-services)
7. [Frontend Architecture](#frontend-architecture)
8. [Database Schema](#database-schema)
9. [API Contracts](#api-contracts)
10. [Deployment Architecture](#deployment-architecture)
11. [Decision Records](#decision-records)
12. [Future Considerations](#future-considerations)

---

## 🏗️ Tổng Quan Kiến Trúc

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js App (apps/web)                                  │  │
│  │  ├─ ChatInterface Component                              │  │
│  │  ├─ Progressive Disclosure UI                            │  │
│  │  └─ Dynamic Component Renderer                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    ↕ (REST API)                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (packages/middleware)                   │
│                  Fastify Server (Port 3001)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HTTP Handlers                                           │  │
│  │  ├─ POST /api/chat                                       │  │
│  │  ├─ GET /api/sessions/:id                               │  │
│  │  └─ GET /api/tools                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↕                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DualRequestHandler (Orchestrator)                       │  │
│  │  ├─ Step 1-4: Parse + Load context + Select tools       │  │
│  │  ├─ Step 5a: Text generation (Gemini Flash) - PARALLEL  │  │
│  │  ├─ Step 5b: Component generation (Gemini Pro) - PARALLEL  │  │
│  │  └─ Step 6-10: Validate + Return + Log                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↕ (Parallel)                            │
│  ┌──────────────────────┬───────────────────────────────────┐  │
│  │                      │                                   │  │
│  │  TextSummaryService  │  ComponentGenerationService       │  │
│  │  ├─ Gemini Flash API │  ├─ Gemini Pro API              │  │
│  │  ├─ Fast (<2s)       │  ├─ Accurate                     │  │
│  │  └─ Tool integration │  └─ Zod validation               │  │
│  └──────────────────────┴───────────────────────────────────┘  │
│                         ↕                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ToolExecutionService                                    │  │
│  │  ├─ Tool registry pattern                                │  │
│  │  ├─ LRU cache (5 min TTL)                                │  │
│  │  ├─ Error handling per tool                              │  │
│  │  └─ 7 Built-in tools                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↕                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SessionManagementService                                │  │
│  │  └─ Store: In-memory (Phase 1)                           │  │
│  │     DB (Phase 3)                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ├─ Google Gemini API (Text + Component Generation)             │
│  ├─ Weather API (if tool calls weather)                         │
│  └─ Others (Phase 2+)                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Layers & Tiers

### 3-Tier Architecture

#### **Tier 1: Presentation Layer (Frontend)**
**File**: `apps/web`

```
Presentation Layer
├─ Page Components (layout.tsx, page.tsx)
├─ Chat Components
│  ├─ ChatInterface (Main chat UI)
│  ├─ MessageWithComponent (Message + expandable component)
│  └─ InputField (User input)
├─ Component Renderer (DynamicRenderer)
├─ Hooks (useDualStreamUI)
├─ UI Library (Tailwind + Radix)
└─ State (Zustand - future)
```

**Responsibilities**:
- Display messages (text + components)
- Handle user input
- Render 7 component types
- Session management (localStorage)
- Progressive disclosure UI

---

#### **Tier 2: Business Logic Layer (Backend)**
**File**: `packages/middleware`

```
Business Logic Layer
├─ DualRequestHandler (Orchestrator)
├─ TextSummaryService (Text generation)
├─ ComponentGenerationService (Component generation)
├─ ToolExecutionService (Tool calling)
├─ SessionManagementService (Session state)
├─ LLMFactory (LLM provider abstraction)
└─ ErrorRecoveryService (Retry logic)
```

**Responsibilities**:
- Parse requests
- Orchestrate dual-stream
- Call LLM APIs
- Execute tools
- Manage sessions
- Handle errors & retry
- Validation & logging

---

#### **Tier 3: Data Layer**
**File**: In-memory stores (Phase 1)

```
Data Layer (Phase 1)
├─ InMemorySessionStore
├─ InMemoryConversationStore
└─ Cache (LRU for tool results)

Data Layer (Phase 3+)
├─ PostgreSQL / MongoDB
├─ Redis cache
└─ File storage (reports, exports)
```

**Responsibilities**:
- Store sessions
- Store conversation history
- Cache tool results
- Manage state persistence

---

### Separation of Concerns (SOLID)

```
DualRequestHandler (Orchestrator)
│
├─ TextSummaryService (ITextGenerator)
│  ├─ LLMFactory → GeminiLLMService
│  └─ Tool integration
│
├─ ComponentGenerationService (IStructuredGenerator)
│  ├─ LLMFactory → GeminiLLMService
│  ├─ Zod validation
│  └─ Error recovery
│
├─ ToolExecutionService (IToolCaller)
│  ├─ Tool registry
│  ├─ LRU cache
│  └─ Error handlers
│
└─ SessionManagementService (ISessionStore)
   ├─ Session storage
   └─ Conversation history
```

Each service has one responsibility, making it testable & maintainable.

---

## 💡 Core Concepts

### 1. **2-Request Architecture**
**Problem**: Sequential requests (text then component) = slow

**Solution**: Parallel requests
```
Request arrives
  ├─ Gemini Flash: "Summarize" → text (2s)
  └─ Gemini Pro: "Generate component spec" → JSON (3s)

Result: Both ready in 3 seconds (not 5)
```

**Benefits**:
- Faster response (parallel over sequential)
- Better accuracy (separate models)
- Graceful fallback (text if component fails)
- Flexible rendering (user chooses text or component)

---

### 2. **Progressive Disclosure UI**
**Pattern**: Hide optional details, show on demand

```
User sees:
┌────────────────────────────┐
│ Text summary (always)      │ ← Brief, scannable
│ [Xem chi tiết] button      │
└────────────────────────────┘

User clicks "Xem chi tiết":
┌────────────────────────────┐
│ Text summary               │
│ ┌────────────────────────┐ │
│ │ Component (expanded)   │ │ ← Rich, interactive
│ │ • Chart                │ │
│ │ • Table                │ │
│ │ • etc                  │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

**Benefits**:
- Less cognitive load
- Chat stays scannable
- Component visible when needed
- Responsive (less space on mobile)

---

### 3. **Tool System (Registry Pattern)**
**Concept**: Tools are registered, discoverable, cacheable

```typescript
// Tool Registry
{
  'get_current_date': { fn, inputSchema, outputSchema },
  'calculate': { fn, inputSchema, outputSchema },
  'get_weather': { fn, inputSchema, outputSchema },
  // ... 7 total
}

// AI can call: tool_call('get_weather', { city: 'NYC' })
// Result cached 5 min
// Next call for NYC → instant
```

**Benefits**:
- AI doesn't need prompt injection
- Clear API for tool calling
- Caching improves performance
- Easy to extend (add tool = register)

---

### 4. **Component System (Registry + Dynamic Rendering)**
**Concept**: 7 component types, dynamically rendered

```typescript
// Component Registry
{
  'Chart': ChartComponent,
  'Table': TableComponent,
  'Card': CardComponent,
  'Form': FormComponent,
  'List': ListComponent,
  'Slides': SlidesComponent,
  'Report': ReportComponent,
}

// API returns: { type: 'Chart', props: {...} }
// Frontend: DynamicRenderer(componentSpec)
// → Looks up Chart in registry, renders with props
```

**Benefits**:
- Type-safe components
- Extensible (add component = register)
- Frontend agnostic (works any framework)
- Centralized validation

---

### 5. **Session & Conversation Context**
**Concept**: Maintain multi-turn conversation with sliding window

```
Messages (sliding window = last 5):
[
  { role: 'user', content: 'Show me Q4 sales' },
  { role: 'assistant', content: '...' },
  { role: 'user', content: 'Add Q3 comparison' },
  { role: 'assistant', content: '...' },
  { role: 'user', content: 'Export as PDF' }  ← current
]

Session context = above 5 messages
AI understands: "Export PDF" refers to previous chart
```

**Benefits**:
- Multi-turn conversations work
- AI has context
- Token usage bounded (5 messages max)
- Fast inference (small context window)

---

## 🔄 Data Flow

### Main Flow: Chat Message → Response

```
1. USER INPUT
   ├─ Message: "Show me sales by region"
   ├─ SessionId: "sess_abc123" (from localStorage)
   └─ Send to: POST /api/chat

2. BACKEND PARSING
   ├─ Parse request
   ├─ Load session (or create)
   ├─ Load conversation history (last 5 messages)
   └─ Format context

3. TOOL SELECTION
   ├─ AI determines: "Need read_file for sales data"
   ├─ Check cache: No previous call
   └─ Execute tool immediately

4. PARALLEL GENERATION (Promise.all)
   ├─ TEXT STREAM:
   │  ├─ Prompt: "Summarize: [context + tool result]"
   │  ├─ Model: Gemini Flash
   │  ├─ Time: ~2 seconds
   │  └─ Output: "Sales led by North region (45%)"
   │
   └─ COMPONENT STREAM:
      ├─ Prompt: "Generate component spec: [context + tool result]"
      ├─ Model: Gemini Pro
      ├─ Time: ~3 seconds
      ├─ Output: { type: 'Chart', props: { chartType: 'pie', data: [...] } }
      └─ Validate with Zod

5. VALIDATION
   ├─ Text: length < 500, no harmful content
   ├─ Component: matches Zod schema
   ├─ If fails: retry (up to 2x) or fallback to text-only
   └─ If success: proceed

6. RETURN RESPONSE
   ├─ Response body:
   │  {
   │    success: true,
   │    data: {
   │      textSummary: "Sales led by North region (45%)",
   │      componentSpec: { type: 'Chart', props: {...} },
   │      metadata: {
   │        textGenTime: 2100,
   │        componentGenTime: 2800,
   │        toolsUsed: ['read_file']
   │      }
   │    }
   │  }
   └─ HTTP 200

7. FRONTEND RENDERING
   ├─ Parse response
   ├─ Display text summary
   ├─ Store component spec
   ├─ Render Message component:
   │  ├─ Text summary
   │  ├─ "Xem chi tiết" button
   │  └─ Hidden component (ready to expand)
   └─ Add to chat history

8. USER INTERACTION
   ├─ User clicks "Xem chi tiết"
   ├─ Frontend expands component
   ├─ DynamicRenderer renders:
   │  ├─ Look up 'Chart' in component registry
   │  ├─ Wrap with error boundary
   │  ├─ Render: <ChartComponent {...props} />
   │  └─ Component interactive (hover, click, etc)
   └─ User can interact with chart

9. LOGGING & METRICS
   ├─ Log: request, response times, errors
   ├─ Cache result (if needed Phase 2)
   └─ Update session timestamp
```

### Tool Execution Flow

```
AI determines: "I need get_weather('NYC')"
  ↓
1. Check cache: get_weather:NYC → hit or miss?
  ├─ HIT: Return cached result (instant)
  └─ MISS: Execute tool
  ↓
2. Validate input: { city: 'NYC' } against schema
  ├─ Valid: Proceed
  └─ Invalid: Return error
  ↓
3. Execute: result = tool_fn({ city: 'NYC' })
  ├─ Success: { temp: 45°F, condition: 'Sunny', humidity: 60% }
  └─ Error: { error: 'API timeout' } → try fallback
  ↓
4. Cache result for 5 minutes
  ├─ Key: 'get_weather:NYC'
  └─ Value: { temp: 45°F, ... }
  ↓
5. Return to LLM: Use in prompt
```

---

## 🧩 Component Architecture

### Component Types & Props

#### **1. Chart Component**
```typescript
type ChartComponentProps = {
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'combo',
  data: Array<Record<string, any>>,
  xAxis?: { key: string, label?: string, type?: 'number' | 'category' },
  yAxis?: { key: string, label?: string, type?: 'number' | 'category' },
  colors?: string[],
  showLegend?: boolean,
  showTooltip?: boolean,
  height?: number,
  responsive?: boolean,
  title?: string,
  subtitle?: string,
}

// Example JSON from AI
{
  "type": "Chart",
  "props": {
    "chartType": "bar",
    "data": [
      { "region": "North", "sales": 4500 },
      { "region": "South", "sales": 3200 },
      { "region": "East", "sales": 2800 }
    ],
    "xAxis": { "key": "region", "label": "Region" },
    "yAxis": { "key": "sales", "label": "Sales ($)" },
    "colors": ["#3b82f6"],
    "height": 400,
    "responsive": true
  }
}
```

#### **2. Table Component**
```typescript
type TableComponentProps = {
  columns: Array<{
    key: string,
    label: string,
    width?: string,
    sortable?: boolean,
    type?: 'string' | 'number' | 'date' | 'boolean',
  }>,
  data: Array<Record<string, any>>,
  striped?: boolean,
  hover?: boolean,
  pagination?: { enabled: boolean, pageSize?: number },
  title?: string,
}

// Example
{
  "type": "Table",
  "props": {
    "columns": [
      { "key": "name", "label": "Product", "sortable": true },
      { "key": "quantity", "label": "Qty", "type": "number" },
      { "key": "price", "label": "Price", "type": "number" },
      { "key": "status", "label": "Status" }
    ],
    "data": [
      { "name": "Widget A", "quantity": 100, "price": 29.99, "status": "In Stock" },
      { "name": "Widget B", "quantity": 50, "price": 49.99, "status": "Low Stock" }
    ],
    "pagination": { "enabled": true, "pageSize": 20 }
  }
}
```

#### **3. Card Component**
```typescript
type CardComponentProps = {
  title?: string,
  content: string,
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info',
  icon?: string,
  image?: string,
  actions?: Array<{ label: string, onClick?: string, action?: 'url' | 'trigger' }>,
}

// Example
{
  "type": "Card",
  "props": {
    "title": "Q4 Revenue",
    "content": "Total revenue reached $2.5M, up 15% YoY",
    "variant": "success",
    "icon": "📈",
    "actions": [
      { "label": "View Details", "action": "url", "onClick": "/reports/q4" }
    ]
  }
}
```

#### **4. Form Component**
```typescript
type FormComponentProps = {
  fields: Array<{
    name: string,
    label: string,
    type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio',
    placeholder?: string,
    required?: boolean,
    options?: Array<{ label: string, value: string }>,
    validation?: { pattern?: string, min?: number, max?: number },
  }>,
  layout?: 'vertical' | 'horizontal',
  onSubmit?: { action: 'submit', endpoint?: string },
  submitButtonLabel?: string,
}

// Example
{
  "type": "Form",
  "props": {
    "fields": [
      { "name": "email", "label": "Email", "type": "email", "required": true },
      { "name": "region", "label": "Region", "type": "select", "options": [
        { "label": "North", "value": "north" },
        { "label": "South", "value": "south" }
      ]},
      { "name": "subscribe", "label": "Subscribe", "type": "checkbox" }
    ],
    "submitButtonLabel": "Submit"
  }
}
```

#### **5. List Component**
```typescript
type ListComponentProps = {
  items: Array<{
    id: string,
    title: string,
    description?: string,
    icon?: string,
    badge?: { label: string, variant?: 'default' | 'success' | 'warning' },
    avatar?: string,
    selected?: boolean,
    metadata?: Record<string, any>,
  }>,
  variant?: 'simple' | 'card' | 'interactive',
  selectable?: boolean,
  searchable?: boolean,
  multiSelect?: boolean,
}

// Example
{
  "type": "List",
  "props": {
    "items": [
      {
        "id": "1",
        "title": "Complete Q4 Report",
        "description": "Finish financial report",
        "badge": { "label": "Urgent", "variant": "warning" },
        "icon": "📋"
      },
      {
        "id": "2",
        "title": "Review Budget",
        "description": "Review 2026 budget",
        "badge": { "label": "Scheduled", "variant": "default" }
      }
    ],
    "selectable": true,
    "searchable": true
  }
}
```

#### **6. Slides Component**
```typescript
type SlidesComponentProps = {
  slides: Array<{
    id: string,
    title?: string,
    content: string,
    image?: string,
    backgroundColor?: string,
    textColor?: string,
  }>,
  autoPlay?: boolean,
  autoPlayInterval?: number,
  showNavigationDots?: boolean,
  showControls?: boolean,
}

// Example
{
  "type": "Slides",
  "props": {
    "slides": [
      { "id": "1", "title": "Slide 1", "content": "Welcome!", "backgroundColor": "#1e40af" },
      { "id": "2", "title": "Slide 2", "content": "Key metrics...", "backgroundColor": "#059669" }
    ],
    "autoPlay": true,
    "autoPlayInterval": 5000
  }
}
```

#### **7. Report Component**
```typescript
type ReportComponentProps = {
  title: string,
  sections: Array<{
    heading: string,
    content: string,
    metrics?: Array<{ label: string, value: string | number }>,
  }>,
  summary?: string,
  footer?: string,
  generatedDate?: string,
  author?: string,
  printable?: boolean,
}

// Example
{
  "type": "Report",
  "props": {
    "title": "Q4 2025 Financial Report",
    "summary": "Q4 revenue reached all-time high",
    "sections": [
      {
        "heading": "Executive Summary",
        "content": "Strong performance...",
        "metrics": [
          { "label": "Revenue", "value": "$2.5M" },
          { "label": "Growth", "value": "+15%" }
        ]
      }
    ],
    "author": "Finance Team",
    "printable": true
  }
}
```

---

## 🔧 Backend Services

### DualRequestHandler (Orchestrator)
**File**: `packages/middleware/src/middleware/dual-request-handler.ts`

```typescript
class DualRequestHandler {
  async handle(request: ChatRequest): Promise<DualResponse> {
    // Step 1: Parse request
    // Step 2: Load session
    // Step 3: Load conversation context
    // Step 4: Select tools
    // Step 5: Execute tools
    // Step 5a + 5b: PARALLEL text + component generation
    // Step 6: Validate outputs
    // Step 7: Execute output actions (Phase 4)
    // Step 8: Update conversation memory (Phase 3)
    // Step 9: Return response
    // Step 10: Log metrics
  }
}
```

**Responsibilities**:
- Orchestrate entire flow
- Coordinate services
- Error handling
- Logging

---

### TextSummaryService
**File**: `packages/middleware/src/services/text-summary.service.ts`

```typescript
interface ITextGenerator {
  generate(context: ConversationContext): Promise<string>;
}

class TextSummaryService implements ITextGenerator {
  // Input: conversation context + tool results
  // Model: Gemini Flash (fast, cheaper)
  // Prompt: "Summarize in 2-3 sentences"
  // Output: text summary
  // Time: ~2 seconds
}
```

---

### ComponentGenerationService
**File**: `packages/middleware/src/services/component-generation.service.ts`

```typescript
interface IStructuredGenerator {
  generate(context: ConversationContext): Promise<ComponentSpec>;
}

class ComponentGenerationService implements IStructuredGenerator {
  // Input: conversation context + tool results
  // Model: Gemini Pro (accurate, costlier)
  // Prompt: "Generate component spec as JSON"
  // Validation: Zod schema
  // Output: { type: 'Chart', props: {...} }
  // Time: ~3 seconds
  // Error recovery: Retry with component-specific prompts
}
```

---

### ToolExecutionService
**File**: `packages/middleware/src/services/tool-execution.service.ts`

```typescript
interface IToolCaller {
  call(toolName: string, params: Record<string, any>): Promise<any>;
}

class ToolExecutionService implements IToolCaller {
  // Tool registry: Map<string, ToolDefinition>
  // Caching: LRU cache (100 entries, 5 min TTL)
  // Built-in tools: get_current_date, calculate, get_weather, etc.
  // Error handling: Try-catch per tool
  // Validation: Zod schema for input
}
```

---

### SessionManagementService
**File**: `packages/middleware/src/services/session-management.service.ts`

```typescript
interface ISessionStore {
  create(): Promise<Session>;
  get(sessionId: string): Promise<Session>;
  update(sessionId: string, data: Partial<Session>): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

class SessionManagementService implements ISessionStore {
  // Phase 1: InMemorySessionStore
  // Phase 3: DatabaseSessionStore
  // Conversation history (sliding window = 5 messages)
  // Session metadata (created, lastAccessed, etc)
}
```

---

### LLMFactory
**File**: `packages/middleware/src/services/llm-factory.ts`

```typescript
class LLMFactory {
  // Factory pattern: Create LLM service based on config
  // Gemini Flash: Fast text generation
  // Gemini Pro: Accurate structured generation
  // Mock service: For testing without API
  // Future: OpenAI, Claude support
}
```

---

## 🎨 Frontend Architecture

### Folder Structure
```
apps/web/
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── playground/
│   │   └── page.tsx           # Chat playground
│   └── api/
│       └── chat/
│           └── route.ts       # Next.js API route (proxy)
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx      # Main chat UI
│   │   ├── MessageWithComponent.tsx
│   │   └── InputField.tsx
│   └── generative/
│       ├── Chart/
│       ├── Table/
│       ├── Card/
│       ├── Form/
│       ├── List/
│       ├── Slides/
│       ├── Report/
│       ├── DynamicRenderer.tsx    # Component registry
│       ├── ErrorBoundary.tsx      # Error handling
│       └── LoadingSkeletons.tsx
├── hooks/
│   └── useDualStreamUI.ts         # Core hook
├── lib/
│   ├── api-client.ts              # HTTP client
│   ├── dynamic-renderer.tsx       # Component registry logic
│   └── types.ts
└── public/

```

### useDualStreamUI Hook
**File**: `apps/web/hooks/useDualStreamUI.ts`

```typescript
function useDualStreamUI() {
  // State: messages[], loading, error

  async function sendMessage(message: string) {
    // 1. Add user message to chat
    // 2. POST /api/chat
    // 3. Receive DualResponse
    // 4. Add assistant message (text + component)
    // 5. Auto-expand component? Or collapse by default?
  }

  return { messages, sendMessage, loading, error };
}
```

---

### DynamicRenderer Component
**File**: `apps/web/lib/dynamic-renderer.tsx`

```typescript
function DynamicRenderer({ componentSpec }: { componentSpec: ComponentSpec }) {
  // 1. Look up component in registry
  // 2. Wrap with error boundary
  // 3. Type-safe props validation
  // 4. Render component
  // 5. Handle errors gracefully
}
```

**Component Registry**:
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
```

---

## 💾 Database Schema (Phase 3+)

### Phase 1: In-Memory
```
sessions = Map<sessionId, Session>
conversations = Map<sessionId, Message[]>
toolCache = LRU<string, any>
```

### Phase 3: PostgreSQL Schema
```sql
-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  created_at TIMESTAMP,
  last_accessed TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  role 'user' | 'assistant',
  content TEXT,
  component_spec JSONB,
  created_at TIMESTAMP,
  tool_calls JSONB
);

-- Tool Cache
CREATE TABLE tool_cache (
  key TEXT PRIMARY KEY,
  value JSONB,
  expires_at TIMESTAMP
);
```

---

## 📡 API Contracts

### POST /api/chat
**Request**:
```typescript
{
  message: string,           // User message
  sessionId?: string,        // Existing session
  conversationHistory?: Message[]  // Optional override
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    textSummary: string,
    componentSpec: {
      type: 'Chart' | 'Table' | ... | 'Report',
      props: Record<string, any>
    } | null,
    metadata: {
      textGenTime: number,
      componentGenTime: number,
      toolsUsed: string[]
    }
  }
}
```

### GET /api/sessions/:sessionId
**Response**:
```typescript
{
  id: string,
  created_at: string,
  last_accessed: string,
  message_count: number
}
```

### GET /api/sessions/:sessionId/history?limit=20
**Response**:
```typescript
{
  messages: Message[],
  total: number
}
```

### GET /api/tools
**Response**:
```typescript
{
  tools: [
    {
      name: 'get_current_date',
      description: 'Get current date',
      inputSchema: { type: 'object', properties: {} },
      outputSchema: { type: 'string' }
    },
    // ... 7 total
  ]
}
```

---

## 🚀 Deployment Architecture

### Phase 1: Local Development
```
Developer Machine
├─ pnpm dev
│  ├─ Next.js dev server (port 3000)
│  └─ Fastify dev server (port 3001)
└─ .env with GEMINI_API_KEY
```

### Phase 3+: Cloud Deployment
```
CDN (CloudFlare)
  ↓
Load Balancer
  ├─ Frontend (Vercel / AWS S3 + CloudFront)
  │  └─ Cached static files
  └─ Backend (AWS EC2 / Google Cloud Run / Heroku)
     ├─ Fastify app (multiple instances)
     ├─ PostgreSQL (RDS)
     ├─ Redis (ElastiCache)
     └─ Monitoring (DataDog / New Relic)
```

---

## 🎯 Decision Records

### Decision 1: Monorepo vs Separate Repos
**Decision**: Monorepo (PNPM + Turborepo)

**Rationale**:
- Shared types (single source of truth)
- Easy refactoring (move code between packages)
- Coordinated releases
- Easier onboarding

---

### Decision 2: 2-Request vs 1-Request
**Decision**: 2-Request (parallel text + component)

**Rationale**:
- Faster (parallel > sequential)
- Better quality (specialized models)
- Graceful fallback (text if component fails)
- User choice (text or component or both)

---

### Decision 3: In-Memory vs Database (Phase 1)
**Decision**: In-memory

**Rationale**:
- Faster MVP
- No DevOps complexity
- Good enough for single-user testing
- Easy migration to DB later (add abstraction layer)

---

### Decision 4: Zod vs Other Validation
**Decision**: Zod

**Rationale**:
- TypeScript-first
- Composable schemas
- Good error messages
- Runtime validation

---

## 🔮 Future Considerations

### Performance Optimizations
- [ ] Server-sent events (SSE) for streaming responses
- [ ] Component lazy loading
- [ ] Prompt caching (Anthropic feature)
- [ ] Response caching (similar queries)

### Scalability
- [ ] Redis for session store
- [ ] Async job queue (Bull)
- [ ] Load balancing (multiple Fastify instances)
- [ ] CDN for frontend

### Features
- [ ] Multi-language AI responses
- [ ] Custom components (user-defined)
- [ ] Tool chaining (one tool calls another)
- [ ] Real-time collaboration
- [ ] Audit trail

### Security
- [ ] Rate limiting
- [ ] CORS security
- [ ] API key rotation
- [ ] Encryption at rest
- [ ] TLS/HTTPS enforcement

---

**Document Version**: 1.0
**Last Updated**: 2025-12-05
**Owner**: Architecture Team
**Status**: ACTIVE

---
