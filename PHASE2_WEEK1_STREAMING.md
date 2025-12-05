# Phase 2 - Week 1: Response Streaming Implementation

**Goal**: Implement Server-Sent Events (SSE) streaming for real-time response generation

---

## 📋 Overview

### Current Architecture (Phase 1)
```
Client Request (POST /api/chat)
    ↓
DualRequestHandler.handle()
    ↓
Promise.all() - Wait for both:
  - TextSummaryService.generateSummary()
  - ComponentGenerationService.generateComponent()
    ↓
Collect results
    ↓
Return full response (wait 2-5 sec)
```

### Target Architecture (Phase 2)
```
Client Request (GET /api/chat/stream)
    ↓
DualRequestHandler.handleStream()
    ↓
Start streaming immediately:
  ├─ Send: text chunks as they arrive (streaming)
  └─ Send: component spec when ready
    ↓
Client receives data incrementally (perceived speed ↑)
```

---

## 🎯 Tasks & Subtasks

### Task 1: Implement Streaming in DualRequestHandler
**Effort**: 3 story points | **Time**: 2-3 hours

**Current Code**: `packages/middleware/src/middleware/dual-request-handler.ts`

**Changes**:
```typescript
// NEW METHOD: handleStream()
async handleStream(
  context: RequestContext,
  onChunk: (chunk: StreamChunk) => void
): Promise<DualResponse>

// Stream chunk types
interface StreamChunk {
  type: 'text' | 'component' | 'tool' | 'complete' | 'error'
  data: string | object
  timestamp: number
}
```

**Implementation Plan**:
1. Add `handleStream()` method to DualRequestHandler
2. Modify text summary generation to yield chunks
3. Send component spec after text completes
4. Handle errors gracefully with streaming

**Files to Modify**:
- `packages/middleware/src/middleware/dual-request-handler.ts` - Add handleStream()
- `packages/middleware/src/types/core.types.ts` - Add StreamChunk interface

---

### Task 2: Update TextSummaryService for Streaming
**Effort**: 2 story points | **Time**: 1-2 hours

**Current Code**: `packages/middleware/src/services/text-summary.service.ts`

**Changes**:
```typescript
// Add streaming support
async generateSummaryStreaming(
  userMessage: string,
  toolResults: ToolCallResult[],
  conversationHistory: string[],
  onChunk: (chunk: string) => void
): Promise<string>
```

**Implementation Plan**:
1. Add streaming parameter to text generation
2. Use Gemini streaming API (instead of waiting for full response)
3. Call `onChunk()` callback for each text chunk
4. Return full text when complete

**Dependencies**:
- Check Gemini SDK for streaming support
- Fastify SSE support

---

### Task 3: Implement SSE Endpoint in Server
**Effort**: 2 story points | **Time**: 1-2 hours

**Current Code**: `packages/middleware/src/server.ts`

**Changes**:
```typescript
// Add new streaming endpoint
app.get<{ Querystring: { sessionId?: string } }>(
  '/api/chat/stream',
  async (request, reply) => {
    // Set SSE headers
    reply.header('Content-Type', 'text/event-stream')
    reply.header('Cache-Control', 'no-cache')
    reply.header('Connection', 'keep-alive')

    // Stream response
    const context = buildContextFromRequest(request)
    await dualRequestHandler.handleStream(context, (chunk) => {
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
    })
  }
)
```

**Implementation Plan**:
1. Add GET `/api/chat/stream` endpoint
2. Set proper SSE headers
3. Call handleStream() with write callback
4. Handle connection close/errors

**Testing**:
```bash
# Test streaming endpoint
curl -N http://localhost:3001/api/chat/stream?message=test
# Should receive: data: {...}\n\n incrementally
```

---

### Task 4: Create Frontend Stream Consumer
**Effort**: 3 story points | **Time**: 2-3 hours

**Current Code**: `apps/web/lib/api-client.ts`

**Changes**:
```typescript
// New streaming method
async function* streamChat(
  message: string,
  sessionId?: string
): AsyncGenerator<StreamChunk> {
  const response = await fetch(
    `/api/chat/stream?message=${encodeURIComponent(message)}${sessionId ? `&sessionId=${sessionId}` : ''}`
  )

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value)
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const chunk = JSON.parse(line.slice(6))
        yield chunk
      }
    }
  }
}
```

**Implementation Plan**:
1. Add streaming fetch consumer
2. Parse SSE format (data: {...}\n\n)
3. Handle buffer correctly for multi-line chunks
4. Return AsyncGenerator for clean code

**Usage in Component**:
```typescript
// In ChatInterface component
const handleStreamMessage = async (message: string) => {
  for await (const chunk of streamChat(message, sessionId)) {
    if (chunk.type === 'text') {
      setTextChunks(prev => [...prev, chunk.data])
    } else if (chunk.type === 'component') {
      setComponentSpec(chunk.data)
    }
  }
}
```

---

### Task 5: Update ChatInterface Component
**Effort**: 2 story points | **Time**: 1-2 hours

**Current Code**: `apps/web/components/chat/ChatInterface.tsx`

**Changes**:
```typescript
// Use streaming instead of await response
const handleSendMessage = async (message: string) => {
  // Show immediate visual feedback
  setMessages(prev => [...prev, { role: 'user', content: message }])

  // Start streaming
  let textSummary = ''
  let componentSpec: any = null

  for await (const chunk of streamChat(message, sessionId)) {
    if (chunk.type === 'text') {
      textSummary += chunk.data
      // Update UI incrementally
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove loading
        { role: 'assistant', content: textSummary, component: componentSpec }
      ])
    } else if (chunk.type === 'component') {
      componentSpec = chunk.data
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: textSummary, component: componentSpec }
      ])
    }
  }
}
```

**Implementation Plan**:
1. Replace `await apiClient.chat()` with `streamChat()`
2. Update message in real-time as text arrives
3. Update component when it's ready
4. Handle errors during streaming

---

## 🧪 Testing Strategy

### Unit Tests (Backend)
```typescript
// Test DualRequestHandler.handleStream()
describe('DualRequestHandler.handleStream', () => {
  it('should stream text chunks', async () => {
    const chunks: StreamChunk[] = []
    await handler.handleStream(context, (chunk) => chunks.push(chunk))

    expect(chunks.some(c => c.type === 'text')).toBe(true)
    expect(chunks.some(c => c.type === 'component')).toBe(true)
  })
})

// Test TextSummaryService streaming
describe('TextSummaryService.generateSummaryStreaming', () => {
  it('should call onChunk for each text chunk', async () => {
    const chunks: string[] = []
    await service.generateSummaryStreaming(
      'test',
      [],
      [],
      (chunk) => chunks.push(chunk)
    )

    expect(chunks.length).toBeGreaterThan(0)
  })
})
```

### E2E Tests (Frontend)
```typescript
// Test SSE endpoint
test('should stream chat response', async () => {
  const response = await fetch(`/api/chat/stream?message=test`)
  const reader = response.body?.getReader()

  expect(response.headers.get('content-type')).toBe('text/event-stream')

  const { value } = await reader!.read()
  const text = new TextDecoder().decode(value)
  expect(text).toContain('data:')
})

// Test ChatInterface streaming
test('should display text progressively', async () => {
  render(<ChatInterface sessionId="test" />)

  const input = screen.getByPlaceholderText('Hỏi gì đó...')
  fireEvent.change(input, { target: { value: 'test message' } })
  fireEvent.click(screen.getByRole('button', { name: /send/i }))

  // Text should appear incrementally
  await waitFor(() => {
    expect(screen.getByText(/response/i)).toBeInTheDocument()
  }, { timeout: 5000 })
})
```

---

## 📊 Success Criteria

✅ **Done** when:
1. ✅ SSE endpoint `/api/chat/stream` working
2. ✅ Text chunks streaming to client
3. ✅ Component spec sent after text complete
4. ✅ Frontend displays text progressively
5. ✅ All tests passing
6. ✅ Response time perceived faster (0.5-1s to first chunk)
7. ✅ No breaking changes to existing `/api/chat` endpoint

---

## 📈 Performance Impact

**Before Streaming**:
```
User request (0s)
  ↓
Wait 2-5 seconds
  ↓
Full response received
```

**After Streaming**:
```
User request (0s)
  ↓
0.3-0.5s: First text chunk arrives (TEXT_READY event)
  ↓
0.5-1.5s: More text chunks streaming
  ↓
1-3s: Component spec ready (COMPONENT_READY event)
  ↓
Perceived performance: 2-3x faster initial feedback
```

---

## 📝 Implementation Order

1. **Day 1 Morning** (2h)
   - [ ] Add `StreamChunk` interface to types
   - [ ] Add `handleStream()` method to DualRequestHandler
   - [ ] Add streaming support to TextSummaryService

2. **Day 1 Afternoon** (2h)
   - [ ] Implement `/api/chat/stream` endpoint in server.ts
   - [ ] Add Fastify SSE support (if needed)
   - [ ] Write backend tests

3. **Day 2 Morning** (2h)
   - [ ] Create `streamChat()` consumer in api-client.ts
   - [ ] Add type definitions for streaming

4. **Day 2 Afternoon** (3h)
   - [ ] Update ChatInterface to use streaming
   - [ ] Update MessageWithComponent for progressive rendering
   - [ ] Write E2E tests

5. **Day 3** (2h)
   - [ ] Full integration testing
   - [ ] Performance testing
   - [ ] Bug fixes & polish

---

## 🚀 Next Steps After Week 1

**Week 2**: Response caching with Redis
- Cache previous responses
- Detect similar queries
- Instant responses for repeated questions

**Week 3**: Prompt engineering
- Optimize for accuracy
- Reduce component generation failures
- A/B test improvements

**Week 4**: UX polish
- Add animations
- Loading skeletons
- Error recovery improvements
