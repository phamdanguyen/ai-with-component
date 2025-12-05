# Integration Architecture - Multi-Part Communication

## Overview

This document describes how the **Frontend (Next.js)** and **Backend (Fastify)** communicate within the All-in-One Chat monorepo. It includes API contracts, data flows, and integration patterns.

## Architecture Diagram

```
┌─────────────────────────┐
│   Browser / Client      │
│  (React / Next.js)      │
└────────────┬────────────┘
             │ HTTP/JSON
             │ (Port 3000)
             ↓
┌─────────────────────────┐          ┌──────────────────┐
│  Frontend App (Next.js) │         │  Shared Packages │
│  - Chat UI              │ ────→   │  - Types         │
│  - Components           │ ←────   │  - React SDK     │
│  - API Client           │         │  - UI Components │
└────────────┬────────────┘          └──────────────────┘
             │
             │ HTTP POST/GET
             │ REST API
             ↓
┌─────────────────────────┐
│  Backend (Fastify)      │
│  - API Routes           │
│  - Services             │
│  - Validation (Zod)     │
│  - Caching (LRU)        │
└────────────┬────────────┘
             │
             │ API Call
             │ (HTTPS)
             ↓
┌─────────────────────────┐
│  Google Gemini API      │
│  - Text Generation      │
│  - Component Generation │
└─────────────────────────┘
```

## Communication Protocol

### Base Configuration

**Frontend**:
- Base URL: `http://localhost:3000` (development)
- Base URL: Production domain (production)
- Protocol: HTTP/HTTPS
- Content-Type: `application/json`

**Backend**:
- Listen Address: `http://localhost:3000`
- API Prefix: `/api/`
- Response Format: JSON with `{ data, error }` structure

### CORS Configuration

**Allowed Origins**:
- Development: `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:*`
- Production: `https://yourdomain.com`, `https://*.yourdomain.com`

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers**: Content-Type, Authorization

## API Endpoints

### 1. Chat Endpoint

**Endpoint**: `POST /api/chat`

**Purpose**: Process user chat message and generate text + component response

**Request Schema**:
```typescript
{
  message: string,           // User's chat message (required)
  sessionId: string,         // UUID for session tracking (required)
  context?: Array<{          // Previous messages (optional)
    role: "user" | "assistant",
    content: string
  }>,
  options?: {                // Additional options (optional)
    componentType?: "auto" | "chart" | "table" | "card" | "form" | "list",
    temperature?: number     // 0-1, controls randomness
  }
}
```

**Response Schema**:
```typescript
{
  text_response: string,     // Text reply from LLM
  ui_component?: {           // Optional UI component spec
    type: "chart" | "table" | "card" | "form" | "list" | "slides" | "report",
    spec: {
      // Component-specific configuration
      title?: string,
      data?: any,
      config?: any
    },
    metadata: {
      generated_at: string,  // ISO timestamp
      model: string          // e.g., "gemini-pro"
    }
  },
  session_id: string,        // Echo back session ID
  timestamp: string          // Response timestamp (ISO)
}
```

**Example Request**:
```json
{
  "message": "Create a bar chart showing monthly sales",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "context": [
    {
      "role": "user",
      "content": "What are our sales trends?"
    },
    {
      "role": "assistant",
      "content": "Sales have been growing 5% month-over-month..."
    }
  ],
  "options": {
    "componentType": "chart",
    "temperature": 0.7
  }
}
```

**Example Response**:
```json
{
  "text_response": "Here's a bar chart showing your monthly sales growth...",
  "ui_component": {
    "type": "chart",
    "spec": {
      "title": "Monthly Sales",
      "data": [
        { "month": "Jan", "sales": 10000 },
        { "month": "Feb", "sales": 10500 },
        { "month": "Mar", "sales": 11025 }
      ],
      "config": {
        "chart_type": "bar",
        "x_axis": "month",
        "y_axis": "sales"
      }
    },
    "metadata": {
      "generated_at": "2025-12-04T10:30:00Z",
      "model": "gemini-pro"
    }
  },
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-04T10:30:01Z"
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid auth)
- `429` - Rate limited
- `500` - Server error

### 2. Chat History Endpoint

**Endpoint**: `GET /api/chat/history/:sessionId`

**Purpose**: Retrieve previous chat messages for a session

**Query Parameters**:
- `limit` (optional, default: 50) - Number of messages to return
- `offset` (optional, default: 0) - Pagination offset

**Response Schema**:
```typescript
{
  session_id: string,
  messages: Array<{
    id: string,
    role: "user" | "assistant",
    content: string,
    timestamp: string,
    component?: {
      type: string,
      spec: any
    }
  }>,
  pagination: {
    limit: number,
    offset: number,
    total: number
  }
}
```

**Example Response**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "Show me sales data",
      "timestamp": "2025-12-04T10:00:00Z"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "Here's your sales data",
      "timestamp": "2025-12-04T10:00:01Z",
      "component": {
        "type": "chart",
        "spec": { /* ... */ }
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 2
  }
}
```

### 3. Component Types Endpoint

**Endpoint**: `GET /api/components/types`

**Purpose**: List available component types for generation

**Response Schema**:
```typescript
{
  component_types: Array<{
    id: string,
    name: string,
    description: string,
    example_spec: any
  }>
}
```

**Example Response**:
```json
{
  "component_types": [
    {
      "id": "chart",
      "name": "Chart",
      "description": "Various chart types (bar, line, pie, etc.)",
      "example_spec": {
        "type": "bar",
        "title": "Sample Chart",
        "data": [/* ... */]
      }
    },
    {
      "id": "table",
      "name": "Table",
      "description": "Sortable and filterable data tables",
      "example_spec": {
        "columns": [/* ... */],
        "rows": [/* ... */]
      }
    }
  ]
}
```

### 4. Health Check Endpoint

**Endpoint**: `GET /health`

**Purpose**: Liveness probe for deployment

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T10:30:00Z"
}
```

## Data Flow Examples

### Example 1: Simple Chat Message

```
1. User types "Hello" in chat input
2. Frontend sends:
   POST /api/chat
   { message: "Hello", sessionId: "...", context: [] }

3. Backend:
   - Validates schema with Zod
   - Checks cache (miss)
   - Calls Gemini API with "Hello"
   - Receives text response
   - Processes for component suitability
   - Calls Gemini again for component spec
   - Caches result

4. Backend returns:
   {
     text_response: "Hi there! How can I help you today?",
     ui_component: null,  // No component for greeting
     session_id: "...",
     timestamp: "..."
   }

5. Frontend:
   - Receives response
   - Displays text in chat bubble
   - No component to render
   - Stores in message history
   - Waits for next user input
```

### Example 2: Chart Generation

```
1. User types "Show sales by region"
2. Frontend sends:
   POST /api/chat
   {
     message: "Show sales by region",
     sessionId: "...",
     context: [...],
     options: { componentType: "chart" }
   }

3. Backend:
   - Validates request
   - Checks cache (miss)
   - Request 1: Generate text with Gemini Flash
   - Request 2: Generate chart spec with Gemini Pro
   - Combines responses
   - Caches for 1 hour

4. Backend returns:
   {
     text_response: "Here's your sales breakdown by region...",
     ui_component: {
       type: "chart",
       spec: {
         title: "Sales by Region",
         data: [
           { region: "North", sales: 50000 },
           { region: "South", sales: 45000 },
           ...
         ],
         config: { chart_type: "bar" }
       }
     }
   }

5. Frontend:
   - Receives response
   - Displays text
   - Renders chart component using Recharts
   - Component is collapsible
   - Shows in conversation history
```

## Shared Packages Integration

### Type Safety Across Services

**packages/types/** defines all shared interfaces:

```typescript
// types/src/api.ts
export interface ChatRequest {
  message: string
  sessionId: string
  context?: Message[]
}

export interface ChatResponse {
  text_response: string
  ui_component?: UIComponent
  session_id: string
}

export interface UIComponent {
  type: ComponentType
  spec: Record<string, any>
  metadata: ComponentMetadata
}
```

**Usage**:
- Backend: `import { ChatRequest } from '@all-in-one-chat/types'`
- Frontend: `import { ChatResponse } from '@all-in-one-chat/types'`

### Component SDK Integration

**packages/react-sdk/** provides rendering components:

```typescript
// frontend usage
import { ComponentRenderer } from '@all-in-one-chat/react-sdk'

export const ChatMessage = ({ message }) => {
  return (
    <div>
      <p>{message.text_response}</p>
      {message.ui_component && (
        <ComponentRenderer spec={message.ui_component} />
      )}
    </div>
  )
}
```

## Error Handling

### Request Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request schema",
    "details": {
      "field": "message",
      "reason": "String must be at least 1 character long"
    },
    "request_id": "req-123-abc"
  }
}
```

### Rate Limit Error

```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests",
    "details": {
      "retry_after": 60
    },
    "request_id": "req-124-def"
  }
}
```

### Server Error

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error",
    "details": {
      "error_id": "err-500-xyz"
    },
    "request_id": "req-125-ghi"
  }
}
```

## Caching Strategy

### Cache Key Generation
```
key = hash(message + sessionId + options)
```

### Cache Behavior
- **Hit**: Return cached response (<5ms)
- **Miss**: Call Gemini API (~2-5s), then cache
- **TTL**: 1 hour (configurable)
- **Max Entries**: 100 (LRU eviction)

### Cache Invalidation
- Manual: Call admin endpoint to clear
- Automatic: TTL expiration
- Eviction: LRU when cache is full

## Performance Characteristics

### Latency
- First request: 2-5 seconds (API call)
- Cached request: <5 milliseconds
- Average: ~1.5 seconds (with cache hits)

### Throughput
- Concurrent connections: 1000+
- Requests/second: ~500 (depends on Gemini quota)
- Memory: ~200MB baseline

## Security Considerations

### Input Validation
- All requests validated with Zod schemas
- SQL injection protection (no SQL used)
- XSS prevention: Responses HTML-escaped
- CSRF protection: Coming soon

### Authentication
- API key validation: TBD
- Session isolation: sessionId prevents cross-session access
- Rate limiting: Per IP / per session: TBD

### Data Privacy
- No persistent storage (state machine based)
- Responses cached for performance only
- Cache cleared on session end

## Deployment Topology

### Development
```
localhost:3000 (Single port)
├── Frontend: Next.js (port 3000)
└── Backend: Fastify (same port, different routes)
```

### Production
```
https://api.yourdomain.com (Backend)
https://yourdomain.com (Frontend, CDN-cached)
├── Frontend: Next.js (Vercel / AWS / etc)
└── Backend: Fastify (AWS ECS / GCP Cloud Run / etc)
```

## Monitoring & Observability

### Logging
- Backend logs: Structured JSON via Pino
- Key metrics: Response time, cache hit rate, errors
- Trace ID: Included in every request for debugging

### Health Checks
- `GET /health` - Liveness probe
- Response time: <100ms
- Used by: Load balancers, Kubernetes

## Next Steps

1. Review **architecture-web.md** for frontend details
2. Review **architecture-middleware.md** for backend details
3. Check **development-guide.md** for setup instructions
4. Explore **source-tree-analysis.md** for file locations

---

**Generated**: 2025-12-04 by BMad Document Project Workflow
**Status**: Two-part monorepo with REST API integration
