# Sprint 1 Kickoff
# All-in-One Chat - Chat UI + Backend Setup

**Start Date**: 2025-12-05 (Friday)
**End Date**: 2025-12-11 (Thursday)
**Duration**: 1 week (5 business days)
**Team**: Frontend Lead, Backend Lead, Full-stack Dev
**Total Points**: 18 pts

---

## 🎯 Sprint 1 Goal

**Foundation ready - chat interface works, backend scaffolding done**

By end of Sprint 1, you should be able to:
- Open http://localhost:3000/playground
- See chat interface
- Type a message
- Message appears in chat
- Can send multiple messages in sequence
- Backend responds (empty for now, will add logic Sprint 2)

---

## 📋 Sprint 1 Stories

### Overview

| Story | Points | Owner | Status |
|-------|--------|-------|--------|
| **E1.S1** - Chat Interface UI | 5 | Frontend Lead | 🔴 Not Started |
| **E1.S2** - Message Display & Progressive Disclosure | 5 | Frontend Lead | 🔴 Not Started |
| **E1.S3** - Session Creation & Management | 3 | Backend Lead | 🔴 Not Started |
| **E1.S4** - API Client & Integration | 3 | Full-stack Dev | 🔴 Not Started |
| **Backend Setup** | 2 | Backend Lead | 🔴 Not Started |
| **TOTAL** | **18 pts** | - | - |

---

## ✅ Pre-Sprint Checklist (Today)

### Environment Setup (All Team)

- [ ] **Node.js version check**
  ```bash
  node --version    # Should be >= 18.0.0
  npm --version     # Should be >= 8.0.0
  ```

- [ ] **PNPM installed**
  ```bash
  npm install -g pnpm@8.15.0
  pnpm --version    # Should be >= 8.0.0
  ```

- [ ] **Clone repo & install**
  ```bash
  git clone <repo>
  cd all-in-one-chat
  pnpm install      # Takes 2-3 min
  ```

- [ ] **Verify monorepo structure**
  ```bash
  ls apps/          # Should see: web
  ls packages/      # Should see: middleware
  ls docs/          # Should see: all our documentation
  ```

- [ ] **Create .env file**
  ```bash
  # In project root
  NODE_ENV=development
  PORT=3001
  HOST=0.0.0.0
  GEMINI_API_KEY=test_key_for_now    # Will add real key later
  ```

- [ ] **Start dev servers**
  ```bash
  pnpm dev          # Should start both apps in parallel
  # Frontend: http://localhost:3000
  # Backend: http://localhost:3001
  ```

- [ ] **Verify both servers running**
  - Frontend: http://localhost:3000 → Next.js default page
  - Backend: http://localhost:3001/health → JSON response

### Git Setup (All Team)

- [ ] **Configure git locally**
  ```bash
  git config user.name "Your Name"
  git config user.email "your.email@company.com"
  ```

- [ ] **Create feature branch for Sprint 1**
  ```bash
  git checkout -b sprint-1/foundation
  ```

- [ ] **Setup PR template** (see section below)

### Jira/Board Setup (Team Lead)

- [ ] **Create Sprint 1 board**
  - 5 stories visible
  - Columns: To Do, In Progress, Review, Done
  - Start date: Dec 5
  - End date: Dec 11

- [ ] **Assign stories**
  - E1.S1 → Frontend Lead
  - E1.S2 → Frontend Lead
  - E1.S3 → Backend Lead
  - E1.S4 → Full-stack Dev
  - Backend Setup → Backend Lead

---

## 📁 Folder Structure to Create

### Frontend (apps/web)

```
apps/web/
├── app/
│   ├── playground/
│   │   ├── page.tsx              ← NEW: Chat playground page
│   │   └── layout.tsx            ← NEW: Layout for playground
│   └── api/
│       └── chat/
│           └── route.ts          ← NEW: API proxy to backend
├── components/
│   ├── chat/                     ← NEW: Chat components folder
│   │   ├── ChatInterface.tsx     ← NEW: Main chat UI
│   │   ├── MessageWithComponent.tsx ← NEW: Message display
│   │   ├── InputField.tsx        ← NEW: Input field
│   │   └── TypingIndicator.tsx   ← NEW: Loading indicator
│   └── generative/               ← Keep existing (for Phase 2)
├── hooks/
│   └── useDualStreamUI.ts        ← NEW: Main hook for chat logic
├── lib/
│   ├── api-client.ts             ← NEW: HTTP client
│   └── types.ts                  ← NEW: Shared types
└── public/
    └── favicon.ico
```

### Backend (packages/middleware)

```
packages/middleware/
├── src/
│   ├── server.ts                 ← NEW: Fastify setup
│   ├── index.ts                  ← NEW: Entry point
│   ├── types/
│   │   ├── core.types.ts         ← NEW: All type definitions
│   │   ├── component-schemas.ts  ← NEW: Zod schemas
│   │   └── component-validators.ts ← NEW: Validators
│   ├── middleware/
│   │   └── index.ts              ← NEW: Middleware setup
│   ├── services/
│   │   ├── index.ts              ← NEW: Export all services
│   │   ├── session-management.service.ts ← NEW: Session service
│   │   └── llm-factory.ts        ← NEW: LLM factory
│   ├── storage/
│   │   ├── InMemorySessionStore.ts ← NEW: In-memory store
│   │   └── types.ts              ← NEW: Store types
│   └── __tests__/
│       └── setup.ts              ← NEW: Test setup
├── tsconfig.json
└── vitest.config.ts              ← NEW: Test config
```

---

## 🏗️ Code Skeleton - Create These Files

### **1. Backend: server.ts** (Backend Lead)
**File**: `packages/middleware/src/server.ts`

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './lib/logger';

export async function createServer() {
  const fastify = Fastify({
    logger: logger,
  });

  // Register CORS
  await fastify.register(cors, {
    origin: 'http://localhost:3000',
  });

  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Chat endpoint (stub for now)
  fastify.post<{ Body: { message: string; sessionId?: string } }>(
    '/api/chat',
    async (request, reply) => {
      const { message, sessionId } = request.body;

      // TODO: Implement in Sprint 2
      return {
        success: true,
        data: {
          textSummary: 'Response from backend (not implemented yet)',
          componentSpec: null,
          metadata: {
            textGenTime: 0,
            componentGenTime: 0,
            toolsUsed: [],
          },
        },
      };
    }
  );

  return fastify;
}

// Start server
if (require.main === module) {
  const server = await createServer();
  await server.listen({ port: 3001, host: '0.0.0.0' });
  console.log('Server running on http://localhost:3001');
}
```

### **2. Backend: index.ts**
**File**: `packages/middleware/src/index.ts`

```typescript
import { createServer } from './server';

async function main() {
  const server = await createServer();
  await server.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### **3. Backend: types**
**File**: `packages/middleware/src/types/core.types.ts`

```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  componentSpec?: ComponentSpec;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  createdAt: Date;
  lastAccessed: Date;
  messages: Message[];
}

export interface ComponentSpec {
  type: string;
  props: Record<string, any>;
}

export interface DualResponse {
  success: boolean;
  data?: {
    textSummary: string;
    componentSpec?: ComponentSpec | null;
    metadata: {
      textGenTime: number;
      componentGenTime: number;
      toolsUsed: string[];
    };
  };
  error?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  conversationHistory?: Message[];
}
```

### **4. Frontend: useDualStreamUI Hook**
**File**: `apps/web/hooks/useDualStreamUI.ts`

```typescript
import { useState, useCallback } from 'react';
import type { Message } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

interface UseDualStreamUIReturn {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error?: string;
  clearChat: () => void;
}

export function useDualStreamUI(): UseDualStreamUIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionId') || '';
    }
    return '';
  });

  const sendMessage = useCallback(
    async (message: string) => {
      try {
        setLoading(true);
        setError(undefined);

        // Add user message to chat
        const userMessage: Message = {
          role: 'user',
          content: message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send to backend
        const response = await apiClient.sendMessage(message, sessionId);

        // Handle response
        if (response.success && response.data) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: response.data.textSummary,
            componentSpec: response.data.componentSpec || undefined,
            metadata: response.data.metadata,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Store session ID
          if (response.data.metadata?.sessionId) {
            setSessionId(response.data.metadata.sessionId);
            localStorage.setItem('sessionId', response.data.metadata.sessionId);
          }
        } else {
          setError(response.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('sessionId');
    setSessionId('');
  }, []);

  return { messages, sendMessage, loading, error, clearChat };
}
```

### **5. Frontend: api-client**
**File**: `apps/web/lib/api-client.ts`

```typescript
import type { DualResponse, ChatRequest } from './types';

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  async sendMessage(message: string, sessionId?: string): Promise<DualResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
        } as ChatRequest),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async getHealth(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### **6. Frontend: ChatInterface Component**
**File**: `apps/web/components/chat/ChatInterface.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error?: string;
  onClear?: () => void;
}

export function ChatInterface({
  messages,
  onSendMessage,
  loading,
  error,
  onClear,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() && !loading) {
      await onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">All-in-One Chat</h1>
          {onClear && (
            <button
              onClick={onClear}
              className="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100"
            >
              New Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 pt-8">
            <p className="text-lg">Hãy bắt đầu hội thoại</p>
            <p className="text-sm">Hỏi tôi về dữ liệu, tạo biểu đồ, v.v.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.componentSpec && (
                <p className="text-xs mt-1 opacity-70">
                  📊 Component available
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hỏi gì đó..."
            disabled={loading}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-200"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### **7. Frontend: playground/page.tsx**
**File**: `apps/web/app/playground/page.tsx`

```typescript
'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { useDualStreamUI } from '@/hooks/useDualStreamUI';

export default function PlaygroundPage() {
  const { messages, sendMessage, loading, error, clearChat } = useDualStreamUI();

  return (
    <ChatInterface
      messages={messages}
      onSendMessage={sendMessage}
      loading={loading}
      error={error}
      onClear={clearChat}
    />
  );
}
```

### **8. Frontend: lib/types**
**File**: `apps/web/lib/types.ts`

```typescript
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  componentSpec?: ComponentSpec;
  metadata?: Record<string, any>;
}

export interface ComponentSpec {
  type: string;
  props: Record<string, any>;
}

export interface DualResponse {
  success: boolean;
  data?: {
    textSummary: string;
    componentSpec?: ComponentSpec | null;
    metadata: {
      textGenTime: number;
      componentGenTime: number;
      toolsUsed: string[];
      sessionId?: string;
    };
  };
  error?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  conversationHistory?: Message[];
}
```

---

## 📋 Story-by-Story Task Breakdown

### **E1.S1: Chat Interface UI (5 pts) - Frontend Lead**

**Definition of Done**:
- [ ] Chat page at `/playground` loads
- [ ] Input field visible with placeholder
- [ ] Send button enabled when text present
- [ ] Message sent on Enter or button click
- [ ] User message appears in chat
- [ ] Typing indicator shows
- [ ] Mobile responsive
- [ ] No console errors

**Task Checklist**:
- [ ] Create `apps/web/app/playground/page.tsx` (use skeleton above)
- [ ] Create `apps/web/components/chat/ChatInterface.tsx` (use skeleton)
- [ ] Create `apps/web/components/chat/TypingIndicator.tsx` (loading dots)
- [ ] Test chat loads at http://localhost:3000/playground
- [ ] Test input field works
- [ ] Test send button works (message appears locally)
- [ ] Test mobile view (resize browser)
- [ ] Write unit test for ChatInterface
- [ ] Create PR with "feat: E1.S1 Chat Interface UI"

**Acceptance Criteria**:
```javascript
✅ http://localhost:3000/playground loads
✅ Input field has placeholder "Hỏi gì đó..."
✅ Send button enabled when input.length > 0
✅ Message typed → click send → message appears in chat
✅ Message sent on Enter key
✅ Typing indicator appears while loading (skeleton)
✅ UI responsive on mobile (480px, 768px widths)
✅ 0 console errors
```

---

### **E1.S2: Message Display & Progressive Disclosure (5 pts) - Frontend Lead**

**Definition of Done**:
- [ ] User message right-aligned
- [ ] Assistant message left-aligned
- [ ] Message bubbles styled nicely
- [ ] Xem chi tiết button (if componentSpec available)
- [ ] Component expands/collapses
- [ ] No lag with multiple messages
- [ ] Animations smooth

**Task Checklist**:
- [ ] Create `apps/web/components/chat/MessageWithComponent.tsx`
- [ ] Style message bubbles with Tailwind
- [ ] Add "Xem chi tiết" button (collapsed by default)
- [ ] Implement expand/collapse with useState
- [ ] Add smooth fade-in animation
- [ ] Test with 20 messages in sequence (no lag)
- [ ] Test on mobile
- [ ] Write unit tests
- [ ] Create PR with "feat: E1.S2 Message Display"

**Acceptance Criteria**:
```javascript
✅ User messages right-aligned, blue background
✅ Assistant messages left-aligned, gray background
✅ "Xem chi tiết" button appears if componentSpec exists
✅ Click button → component expands below message
✅ Click again → component collapses
✅ 20 messages render smoothly (no jank)
✅ Animations feel natural (200-300ms)
✅ Mobile responsive bubbles
```

---

### **E1.S3: Session Creation & Management (3 pts) - Backend Lead**

**Definition of Done**:
- [ ] First message creates session
- [ ] Session ID generated (UUID)
- [ ] Session ID in localStorage
- [ ] Session ID passed to `/api/chat` calls
- [ ] "New Chat" button clears session
- [ ] Session persists on refresh
- [ ] "Clear History" button works
- [ ] Unit tests pass

**Task Checklist**:
- [ ] Create `packages/middleware/src/services/session-management.service.ts`
- [ ] Create `packages/middleware/src/storage/InMemorySessionStore.ts`
- [ ] Create Session types in `core.types.ts`
- [ ] Implement UUID generation
- [ ] Test session creation (manual)
- [ ] Test localStorage persistence (check dev tools)
- [ ] Test session passed to API
- [ ] Write unit tests for SessionManagementService
- [ ] Create PR with "feat: E1.S3 Session Management"

**Acceptance Criteria**:
```typescript
✅ First chat message → backend creates session with UUID
✅ Session ID stored in localStorage
✅ Subsequent calls pass sessionId to API
✅ "New Chat" button → clear localStorage → new sessionId
✅ Refresh page → session persists (from localStorage)
✅ "Clear History" button → delete session
✅ Unit tests: 100% coverage of SessionManagementService
```

---

### **E1.S4: API Client & Integration (3 pts) - Full-stack Dev**

**Definition of Done**:
- [ ] `api-client.ts` module created
- [ ] `sendMessage(message, sessionId)` function
- [ ] POST to `http://localhost:3001/api/chat`
- [ ] Request includes message, sessionId, conversationHistory
- [ ] Response parsed: { success, data: { textSummary, componentSpec, metadata } }
- [ ] Error handling with retry
- [ ] Loading state works
- [ ] Unit tests pass

**Task Checklist**:
- [ ] Create `apps/web/lib/api-client.ts` (use skeleton)
- [ ] Create `apps/web/lib/types.ts` with all types
- [ ] Implement `sendMessage(message, sessionId)` method
- [ ] Test with backend stub (POST /api/chat)
- [ ] Handle API errors (show user message)
- [ ] Implement retry logic (1x on timeout)
- [ ] Add loading state in UI
- [ ] Write unit tests
- [ ] Create PR with "feat: E1.S4 API Client"

**Acceptance Criteria**:
```typescript
✅ sendMessage('Hello') → POST to http://localhost:3001/api/chat
✅ Request body: { message, sessionId }
✅ Response parsed correctly
✅ API error → catch & show to user
✅ Timeout → auto-retry 1x
✅ Loading state shows during request (typing indicator)
✅ Response populates message in chat
✅ Unit tests: 100% coverage
```

---

### **Backend Setup (2 pts) - Backend Lead**

**Definition of Done**:
- [ ] Fastify server scaffolding
- [ ] TypeScript configured
- [ ] Environment variables loaded
- [ ] CORS configured
- [ ] Health check endpoint working
- [ ] Error handling middleware
- [ ] Logging setup
- [ ] Ready for services

**Task Checklist**:
- [ ] Create `packages/middleware/src/server.ts` (use skeleton)
- [ ] Create `packages/middleware/src/index.ts`
- [ ] Setup Fastify with TypeScript
- [ ] Add CORS middleware (allow http://localhost:3000)
- [ ] Create `/health` endpoint
- [ ] Test: `curl http://localhost:3001/health` → { status: 'ok' }
- [ ] Create `/api/chat` stub endpoint (returns empty response)
- [ ] Test: POST to /api/chat works
- [ ] Setup Pino logging
- [ ] Setup error handling middleware
- [ ] Write basic tests
- [ ] Create PR with "feat: Backend Setup"

**Acceptance Criteria**:
```bash
✅ pnpm dev -F middleware starts server on port 3001
✅ curl http://localhost:3001/health → 200 OK
✅ Response: { status: 'ok', timestamp: '...' }
✅ CORS headers present for http://localhost:3000
✅ POST /api/chat → returns { success: true, data: {...} }
✅ Error handling: 400/500 responses formatted consistently
✅ Logging: console shows requests
✅ 0 TypeScript errors
```

---

## 🔄 Git Workflow

### Branch Strategy
```bash
# Feature branch (one per story)
git checkout -b feat/e1-s1-chat-interface
git checkout -b feat/e1-s2-message-display
git checkout -b feat/e1-s3-session-management
git checkout -b feat/e1-s4-api-client
git checkout -b feat/backend-setup

# Each branch has ONE story's changes
# When done: create Pull Request
```

### Commit Message Format
```
feat: E1.S1 - Chat Interface UI

- Create ChatInterface component
- Add input field with send button
- Implement message display
- Add typing indicator
- Make responsive

Fixes #123
```

### PR Template
```markdown
## Description
Brief description of what this PR does

## Story
- E1.S1 Chat Interface UI
- Points: 5

## Changes
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Testing
- [ ] Manual tested on desktop
- [ ] Mobile tested (480px, 768px)
- [ ] Unit tests passing
- [ ] 0 console errors

## Screenshots/Demo
[If UI change, add screenshot]

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed own code
- [ ] Added comments for complex logic
- [ ] No console.log debugging
- [ ] Tests added/updated
```

---

## 📅 Daily Standup Template

### Each Day (10 min standup)

```
🌅 Day 1 (Fri Dec 5) - Project Setup
═══════════════════════════════════
Frontend Lead:
  ✅ Done: Environment setup, folder structure
  🔄 Today: Start E1.S1 ChatInterface component
  ⚠️  Blockers: None

Backend Lead:
  ✅ Done: Environment setup, Fastify scaffolding
  🔄 Today: Create server.ts, SessionManagementService
  ⚠️  Blockers: None

Full-stack Dev:
  ✅ Done: Environment setup
  🔄 Today: Create api-client.ts, types
  ⚠️  Blockers: Need API contract agreement

Team Sync Required:
  → API contract (request/response format)
  → Component spec format
  → Error response format
```

### Template to Use
```
🌅 Day X (Date) - Sprint 1
═══════════════════════════

Frontend Lead:
  ✅ Done: [what completed]
  🔄 Today: [what starting]
  ⚠️  Blockers: [if any]

Backend Lead:
  ✅ Done: [what completed]
  🔄 Today: [what starting]
  ⚠️  Blockers: [if any]

Full-stack Dev:
  ✅ Done: [what completed]
  🔄 Today: [what starting]
  ⚠️  Blockers: [if any]

Team Sync Required:
  → [if any decisions needed]
```

---

## 🧪 Testing Checklist (Per Story)

### Unit Tests
```bash
# Run tests
pnpm test

# Or specific test
pnpm test ChatInterface.test.tsx
pnpm test SessionManagementService.test.ts
```

### Manual Testing

**E1.S1 Chat Interface**:
- [ ] Visit http://localhost:3000/playground
- [ ] Page loads without errors
- [ ] Input field visible & focused
- [ ] Type "hello" → button enables
- [ ] Click send → message appears
- [ ] Type another → send again
- [ ] Scroll works smoothly
- [ ] Mobile view (F12 → toggle device mode)
  - [ ] 480px width → buttons stack or compress
  - [ ] 768px width → layout adjusts

**E1.S3 Session Management**:
- [ ] First message → check localStorage (F12 → Storage)
- [ ] See `sessionId` key
- [ ] Refresh page → session persists
- [ ] New Chat button → clear localStorage
- [ ] localStorage is empty

**E1.S4 API Client**:
- [ ] F12 → Network tab
- [ ] Type message & send
- [ ] See POST /api/chat request
- [ ] Request has correct headers
- [ ] Response: { success: true, data: {...} }

---

## 📊 Sprint 1 Success Metrics

### By End of Sprint 1:

| Metric | Target | How to Measure |
|--------|--------|---|
| All 5 stories DONE | 5/5 | Jira board all in "Done" |
| Chat UI responsive | ✅ | Test on 3 screen sizes |
| API working | ✅ | curl /api/chat returns 200 |
| No console errors | 0 | F12 console clear |
| Code coverage | > 40% | `pnpm test --coverage` |
| Tests passing | 100% | `pnpm test` all green |

---

## 🚨 Common Issues & Fixes

### "Module not found" errors
```bash
# Solution
pnpm install              # Reinstall everything
rm -rf node_modules       # Clean install
pnpm install
```

### Port 3000/3001 already in use
```bash
# Solution
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### TypeScript errors
```bash
# Solution
cd packages/middleware
pnpm build

# Check errors
cat tsconfig.json       # Verify config
```

### CORS errors
```
Cross-Origin Request Blocked: ...
```
Solution: Backend CORS middleware has wrong origin, should be `http://localhost:3000`

### localStorage not persisting
```
sessionId not found
```
Solution: Check browser is not in private mode, clear browser cache

---

## 📞 Daily Sync Schedule

**Sprint 1 Week (Dec 5-11)**

| Time | Event | Duration | Attendees |
|------|-------|----------|-----------|
| 10:00 AM | Daily Standup | 15 min | All 3 |
| 11:00 AM | Code Review | 30 min | As needed |
| 3:00 PM | Friday only: Sprint Review | 1 hour | All 3 |

---

## ✅ Sprint 1 Completion Checklist

**Friday Dec 11 EOD:**

- [ ] All 5 stories marked DONE
- [ ] All PRs merged to main
- [ ] Code coverage > 40%
- [ ] All tests passing: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] No critical bugs
- [ ] Demo: Chat UI works end-to-end
- [ ] Documentation updated
- [ ] Retrospective completed

---

## 🎯 What You'll Have After Sprint 1

✅ **Chat interface** - Users can type, send messages
✅ **Session management** - Messages persist in localStorage
✅ **Backend scaffolding** - Fastify server ready
✅ **API contract defined** - Frontend/backend aligned
✅ **Development foundation** - Team workflow established
✅ **Test coverage** - 40%+ of code tested

**Ready for Sprint 2**: Backend team adds LLM integration, text generation, component generation

---

**Document Version**: 1.0
**Created**: 2025-12-05
**Owner**: Engineering Lead
**Status**: 🟢 READY TO EXECUTE

---

## 🚀 Let's Go!

**Next Steps**:
1. ✅ Team reviewed this document
2. 🔄 Environment setup (30 min)
3. 🔄 Create feature branches
4. 🔄 Start implementing stories (Frontend Lead: E1.S1)
5. 🔄 Daily standups 10 AM
6. 🔄 PRs by Friday
7. ✅ Sprint review Friday 3 PM
8. ✅ Retrospective Friday 4 PM

**Questions?** Ask in standup! 🎉
