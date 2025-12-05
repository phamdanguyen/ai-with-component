# User Stories & Epics
# All-in-One Chat - Phase 1 (MVP)

**Phiên bản**: 1.0
**Ngày cập nhật**: 2025-12-05
**Giai đoạn**: Phase 1 - MVP
**Trạng thái**: ACTIVE

---

## 📋 Mục Lục
1. [Epics Overview](#epics-overview)
2. [Epic 1: Core Chat Experience](#epic-1-core-chat-experience)
3. [Epic 2: Component Generation](#epic-2-component-generation)
4. [Epic 3: Component Library](#epic-3-component-library)
5. [Epic 4: Tool System](#epic-4-tool-system)
6. [Epic 5: Session & Context](#epic-5-session--context)
7. [Epic 6: Error Handling & Recovery](#epic-6-error-handling--recovery)
8. [Priority & Dependencies](#priority--dependencies)
9. [Acceptance Criteria](#acceptance-criteria)

---

## 🎯 Epics Overview

| Epic | Title | Stories | Priority |
|------|-------|---------|----------|
| **E1** | Core Chat Experience | 4 | P0 (Critical) |
| **E2** | Component Generation | 3 | P0 (Critical) |
| **E3** | Component Library | 7 | P0 (Critical) |
| **E4** | Tool System | 3 | P1 (High) |
| **E5** | Session & Context | 2 | P1 (High) |
| **E6** | Error Handling & Recovery | 3 | P1 (High) |

**Total Stories**: 22
**Estimated Effort**: 4-6 weeks (Full team)

---

## 🚀 Epic 1: Core Chat Experience

**Goal**: User can open chat, send message, get response with text + optional component

### Story E1.S1: Chat Interface UI
**As a** user
**I want to** see a clean chat interface where I can type messages
**So that** I can interact with the AI

**Acceptance Criteria**:
- [ ] Chat page loads at `/playground`
- [ ] Input field visible with placeholder "Hỏi gì đó..."
- [ ] Send button enabled when text present
- [ ] Message sent on Enter key or button click
- [ ] Sent message appears in chat as "user" message
- [ ] Chat scrolls to latest message automatically
- [ ] Mobile responsive (< 768px width)
- [ ] Typing indicator shows while AI responds

**Technical Details**:
- Component: `ChatInterface.tsx`
- Route: `apps/web/app/playground/page.tsx`
- Library: Tailwind CSS, Lucide icons
- State: React hooks (or Zustand)

**Dependencies**: None
**Estimated Points**: 5
**Owner**: Frontend Lead

---

### Story E1.S2: Message Display & Progressive Disclosure
**As a** user
**I want to** see message text immediately, with optional component in expandable section
**So that** I can read quickly or dive into details

**Acceptance Criteria**:
- [ ] User message displays in right-aligned bubble
- [ ] Assistant message displays in left-aligned bubble
- [ ] Text summary visible by default
- [ ] "Xem chi tiết" button appears if component available
- [ ] Clicking button expands component below text
- [ ] Component can collapse back (hide)
- [ ] Multiple messages with components don't lag
- [ ] Hover message → show "copy" and "delete" options (future)

**Technical Details**:
- Component: `MessageWithComponent.tsx`
- Props: `{ role: 'user' | 'assistant', content: string, componentSpec?: ComponentSpec }`
- Styling: Tailwind + animations (fade-in for component)

**Dependencies**: E1.S1, E3 (components available)
**Estimated Points**: 5
**Owner**: Frontend Lead

---

### Story E1.S3: Session Creation & Management
**As a** system
**I want to** auto-create a session for each user
**So that** we can track conversation history

**Acceptance Criteria**:
- [ ] First chat message triggers session creation
- [ ] Session ID generated (UUID)
- [ ] Session ID stored in localStorage
- [ ] Session ID passed to all subsequent `/api/chat` calls
- [ ] Manual "New Chat" button clears session and starts fresh
- [ ] Session persists across page refresh (in localStorage)
- [ ] "Clear History" button deletes session from backend

**Technical Details**:
- Backend: `SessionManagementService` in `dual-request-handler.ts`
- Frontend: `useDualStreamUI` hook manages sessionId
- Storage: localStorage (phase 1), DB (phase 3)

**Dependencies**: None
**Estimated Points**: 3
**Owner**: Backend Lead

---

### Story E1.S4: API Client & Integration
**As a** frontend
**I want to** send messages to backend `/api/chat` endpoint
**So that** I get responses

**Acceptance Criteria**:
- [ ] `api-client.ts` module created
- [ ] `sendMessage(message, sessionId)` function
- [ ] POST to `http://localhost:3001/api/chat`
- [ ] Request includes: message, sessionId, conversationHistory
- [ ] Response parsed: `{ success, data: { textSummary, componentSpec, metadata } }`
- [ ] Error handling: timeout retry, network error shown to user
- [ ] Loading state: disable input, show typing indicator

**Technical Details**:
- File: `apps/web/lib/api-client.ts`
- Library: `fetch` API (or axios)
- CORS: Backend configured for `http://localhost:3000`

**Dependencies**: Backend API ready (E2.S3)
**Estimated Points**: 3
**Owner**: Full-stack Dev

---

---

## 🎨 Epic 2: Component Generation

**Goal**: AI generates component specs alongside text, frontend renders them

### Story E2.S1: Dual-Stream Request Handler
**As a** backend
**I want to** handle `/api/chat` requests with 2-stream parallel generation
**So that** text and component generate simultaneously

**Acceptance Criteria**:
- [ ] `DualRequestHandler` class created
- [ ] 10-step workflow implemented:
  1. Parse request
  2. Load session
  3. Load conversation context (last 5 messages)
  4. Select tools
  5. Execute tools (if needed)
  6. Parallel: Text generation (Gemini Flash)
  7. Parallel: Component generation (Gemini Pro)
  8. Validate outputs
  9. Return response
  10. Log metrics
- [ ] Text and component generated concurrently (Promise.all)
- [ ] Response includes metadata: `textGenTime`, `componentGenTime`, `toolsUsed`
- [ ] Total time < 5 seconds (target < 3s)
- [ ] If component fails: fallback to text-only (component = null)

**Technical Details**:
- File: `packages/middleware/src/middleware/dual-request-handler.ts`
- Services used: TextSummaryService, ComponentGenerationService, ToolExecutionService, SessionManagementService

**Dependencies**: E4 (Tool system), E5 (Session management)
**Estimated Points**: 8
**Owner**: Backend Architect

---

### Story E2.S2: Text Generation Service
**As a** backend
**I want to** generate fast text summaries using Gemini Flash
**So that** users get quick responses

**Acceptance Criteria**:
- [ ] `TextSummaryService` class created (implements `ITextGenerator`)
- [ ] Prompt: Summarize conversation + tool results in 2-3 sentences
- [ ] Model: Gemini Flash (fast + cheap)
- [ ] Max tokens: 200 (enforce brevity)
- [ ] Integration: Tool results included in prompt
- [ ] Time: ~2 seconds target
- [ ] Error handling: Retry 1x on timeout
- [ ] Response: Plain text string

**Technical Details**:
- File: `packages/middleware/src/services/text-summary.service.ts`
- LLM: `@google/generative-ai` package
- Prompt template: See `component-prompts.ts`

**Dependencies**: E4 (Tool system), LLMFactory
**Estimated Points**: 4
**Owner**: Backend Dev

---

### Story E2.S3: Component Spec Generation Service
**As a** backend
**I want to** generate component specs using Gemini Pro
**So that** frontend can render interactive components

**Acceptance Criteria**:
- [ ] `ComponentGenerationService` class created (implements `IStructuredGenerator`)
- [ ] Prompt: "Generate component spec as valid JSON"
- [ ] Model: Gemini Pro (accurate)
- [ ] Output: `{ type: 'Chart'|'Table'|..., props: {...} }`
- [ ] Validation: Zod schema validation
- [ ] Error recovery: Retry 2x with component-specific prompts on schema fail
- [ ] Time: ~3 seconds target
- [ ] Fallback: If all retries fail, return null (fallback to text)
- [ ] Response: ComponentSpec object or null

**Technical Details**:
- File: `packages/middleware/src/services/component-generation.service.ts`
- Validation: Zod schemas in `component-schemas.ts`
- Error recovery: `error-recovery.ts`

**Dependencies**: Component schemas defined (E3)
**Estimated Points**: 6
**Owner**: Backend Dev + AI/Prompt Engineer

---

---

## 🧩 Epic 3: Component Library

**Goal**: 7 GenUI components fully implemented and tested

### Story E3.S1: Chart Component
**As a** user
**I want to** see interactive charts (line, bar, pie, etc.)
**So that** I can visualize data trends

**Acceptance Criteria**:
- [ ] Component renders: `<ChartComponent chartType="line" data={[...]} />`
- [ ] Supported chart types: line, bar, area, pie, scatter, radar, combo
- [ ] Data prop: array of objects
- [ ] xAxis/yAxis: configurable key + label
- [ ] Colors customizable
- [ ] Legend toggleable
- [ ] Tooltip on hover (show exact values)
- [ ] Responsive (mobile-friendly)
- [ ] Height adjustable (default 400px)
- [ ] Error boundary: render fallback if Recharts error
- [ ] Storybook story created with examples

**Technical Details**:
- Component: `apps/web/components/generative/Chart/ChartComponent.tsx`
- Library: Recharts
- Props: See `ARCHITECTURE.md` Section "Chart Component"
- Tests: Unit test for prop validation, E2E test for rendering

**Dependencies**: DynamicRenderer support
**Estimated Points**: 5
**Owner**: Frontend Dev

---

### Story E3.S2: Table Component
**As a** user
**I want to** see structured data in interactive tables
**So that** I can browse and sort results

**Acceptance Criteria**:
- [ ] Component renders: `<TableComponent columns={[...]} data={[...]} />`
- [ ] Columns: configurable key, label, width, sortable flag, type
- [ ] Data: array of objects
- [ ] Sortable: Click header to sort (if sortable=true)
- [ ] Pagination: Show X rows per page (if enabled)
- [ ] Striped rows: Alternate row colors
- [ ] Hover: Highlight row on hover
- [ ] Mobile: Horizontal scroll on small screens
- [ ] Empty state: Show message if no data
- [ ] Responsive layout
- [ ] Storybook story with examples

**Technical Details**:
- Component: `apps/web/components/generative/Table/TableComponent.tsx`
- Library: Native HTML <table> or TanStack Table
- Props: See ARCHITECTURE.md

**Dependencies**: DynamicRenderer support
**Estimated Points**: 5
**Owner**: Frontend Dev

---

### Story E3.S3: Card Component
**As a** user
**I want to** see highlighted KPI cards with actions
**So that** I can focus on important metrics

**Acceptance Criteria**:
- [ ] Component renders: `<CardComponent title="..." content="..." />`
- [ ] Title, content, icon, image, variant (colors)
- [ ] Variant colors: default, success (green), warning (yellow), error (red), info (blue)
- [ ] Optional icon (emoji or symbol)
- [ ] Optional image (background or corner)
- [ ] Actions: array of buttons with labels
- [ ] Click action → trigger event (future: API call)
- [ ] Responsive width
- [ ] Shadow/border styling
- [ ] Storybook story

**Technical Details**:
- Component: `apps/web/components/generative/Card/CardComponent.tsx`
- Styling: Tailwind CSS variants

**Dependencies**: DynamicRenderer
**Estimated Points**: 3
**Owner**: Frontend Dev

---

### Story E3.S4: Form Component
**As a** user
**I want to** fill out forms to filter data or input parameters
**So that** I can control the data I see

**Acceptance Criteria**:
- [ ] Component renders: `<FormComponent fields={[...]} />`
- [ ] Field types: text, email, number, date, select, checkbox, radio
- [ ] Validation: required, pattern, min/max
- [ ] Layout: vertical or horizontal
- [ ] Submit button: trigger form submission
- [ ] Success feedback: Show message or callback
- [ ] Error display: Show validation errors below field
- [ ] Reset button (optional)
- [ ] Responsive
- [ ] Storybook story

**Technical Details**:
- Component: `apps/web/components/generative/Form/FormComponent.tsx`
- Validation: Zod (client-side validation)
- State management: React hooks (formData state)

**Dependencies**: DynamicRenderer
**Estimated Points**: 5
**Owner**: Frontend Dev

---

### Story E3.S5: List Component
**As a** user
**I want to** browse lists of items (tasks, results, etc.)
**So that** I can scan and select relevant items

**Acceptance Criteria**:
- [ ] Component renders: `<ListComponent items={[...]} />`
- [ ] Item props: id, title, description, icon, badge, avatar
- [ ] Variants: simple (text list), card (card per item), interactive
- [ ] Selectable: Checkboxes to select items
- [ ] Searchable: Filter by title/description
- [ ] Badge: Show status (urgent, scheduled, completed, etc.)
- [ ] Avatar: Optional user/icon image
- [ ] Click item → trigger event
- [ ] Responsive
- [ ] Storybook story

**Technical Details**:
- Component: `apps/web/components/generative/List/ListComponent.tsx`
- Search: Client-side filter (useEffect)

**Dependencies**: DynamicRenderer
**Estimated Points**: 4
**Owner**: Frontend Dev

---

### Story E3.S6: Slides Component
**As a** user
**I want to** view presentations or image carousels
**So that** I can see sequential information

**Acceptance Criteria**:
- [ ] Component renders: `<SlidesComponent slides={[...]} />`
- [ ] Slide props: id, title, content, image, backgroundColor, textColor
- [ ] Navigation: Previous/Next buttons
- [ ] Dots: Navigation indicators (click to jump)
- [ ] AutoPlay: Optional auto-advance with interval
- [ ] Touch swipe: Mobile swipe left/right
- [ ] Keyboard: Arrow keys to navigate
- [ ] Responsive
- [ ] Storybook story

**Technical Details**:
- Component: `apps/web/components/generative/Slides/SlidesComponent.tsx`
- State: Current slide index
- Touch handling: React event listeners

**Dependencies**: DynamicRenderer
**Estimated Points**: 4
**Owner**: Frontend Dev

---

### Story E3.S7: Report Component
**As a** user
**I want to** view and export detailed reports
**So that** I can share findings or create documents

**Acceptance Criteria**:
- [ ] Component renders: `<ReportComponent title="..." sections={[...]} />`
- [ ] Sections: Each section has heading + content + optional metrics
- [ ] Metrics: Key-value pairs (KPI display)
- [ ] Summary: Executive summary at top
- [ ] Footer: Custom footer text
- [ ] Author & date stamp
- [ ] Print button: Trigger browser print dialog
- [ ] Export PDF: Convert to PDF (via print)
- [ ] Responsive: Page breaks on print
- [ ] Storybook story

**Technical Details**:
- Component: `apps/web/components/generative/Report/ReportComponent.tsx`
- Print styling: Separate CSS media queries
- PDF export: Use browser print-to-PDF

**Dependencies**: DynamicRenderer
**Estimated Points**: 4
**Owner**: Frontend Dev

---

---

## 🔧 Epic 4: Tool System

**Goal**: AI can call tools to fetch real-time data

### Story E4.S1: Tool Registry & Execution
**As a** backend
**I want to** manage a registry of available tools
**So that** AI can call them programmatically

**Acceptance Criteria**:
- [ ] `ToolExecutionService` class created
- [ ] Tool registry: Map<string, ToolDefinition>
- [ ] Tool schema: { name, description, inputSchema, outputSchema, fn }
- [ ] Tool execution: Call tool function with params
- [ ] Input validation: Zod schema validation
- [ ] Error handling: Try-catch per tool, return error if fail
- [ ] 7 built-in tools implemented:
  1. get_current_date()
  2. calculate(expression: string)
  3. get_weather(city: string)
  4. list_files(directory: string)
  5. read_file(path: string)
  6. web_search(query: string)
  7. translate(text, from, to)
- [ ] Extensible: Easy to add new tools
- [ ] API endpoint: `GET /api/tools` lists available tools

**Technical Details**:
- File: `packages/middleware/src/services/tool-execution.service.ts`
- Tools: Separate file `tools/index.ts`
- Schema: Zod validation

**Dependencies**: None
**Estimated Points**: 6
**Owner**: Backend Dev

---

### Story E4.S2: Tool Result Caching
**As a** backend
**I want to** cache tool results for 5 minutes
**So that** repeated calls are instant

**Acceptance Criteria**:
- [ ] LRU cache configured: 100 entries, 5 min TTL
- [ ] Cache key: `tool_name:params_hash`
- [ ] Before tool call: Check cache, return if hit
- [ ] After tool call: Store result in cache
- [ ] Cache invalidation: Manual clear (future: automatic on time)
- [ ] Monitoring: Log cache hits/misses
- [ ] Thread-safe (if async)

**Technical Details**:
- Library: `lru-cache` npm package
- Integration: In `ToolExecutionService`

**Dependencies**: E4.S1
**Estimated Points**: 3
**Owner**: Backend Dev

---

### Story E4.S3: Tool Integration in DualRequestHandler
**As a** backend
**I want to** automatically select and execute tools during dual-stream
**So that** AI can use real-time data in responses

**Acceptance Criteria**:
- [ ] During step 4 of dual-request: AI determines tools needed
- [ ] Tool selection: LLM decides which tools to call
- [ ] Tool execution: Execute all selected tools (parallel if possible)
- [ ] Tool results: Include in text summary prompt
- [ ] Tool results: Include in component generation prompt
- [ ] Error handling: If tool fails, continue with null result
- [ ] Metadata: Track which tools were used

**Technical Details**:
- Logic: In `DualRequestHandler.handle()`
- Tool selection: Via LLM system prompt
- Tool result injection: In prompts for text/component generation

**Dependencies**: E4.S1, E2.S1
**Estimated Points**: 4
**Owner**: Backend Dev

---

---

## 💾 Epic 5: Session & Context

**Goal**: Track conversation state across multiple messages

### Story E5.S1: Conversation History Storage
**As a** backend
**I want to** store conversation messages (last 5) per session
**So that** AI has context for multi-turn conversations

**Acceptance Criteria**:
- [ ] Session model: { id, createdAt, lastAccessed, messages[] }
- [ ] Message model: { role, content, timestamp, toolCalls, componentSpec }
- [ ] Storage: In-memory Map<sessionId, Session>
- [ ] Sliding window: Keep last 5 messages, discard older
- [ ] Persistence: localStorage (browser) for sessionId, in-memory for messages (Phase 1)
- [ ] API: GET `/api/sessions/:id/history?limit=N` to fetch history
- [ ] Context passing: Include conversation history in dual-request

**Technical Details**:
- File: `packages/middleware/src/services/session-management.service.ts`
- Store: `packages/middleware/src/storage/InMemorySessionStore.ts`
- Model: `packages/middleware/src/types/core.types.ts`

**Dependencies**: None
**Estimated Points**: 4
**Owner**: Backend Dev

---

### Story E5.S2: Session Lifecycle Management
**As a** user
**I want to** create new sessions, clear history, and manage sessions
**So that** I can organize conversations

**Acceptance Criteria**:
- [ ] Manual session creation: "New Chat" button in UI
- [ ] Session auto-creation: First message creates if needed
- [ ] Clear history: "Clear" button deletes session messages
- [ ] Session persistence: SessionId in localStorage survives refresh
- [ ] Session timeout: (Phase 3+) 24 hour expiry
- [ ] Multiple sessions: Support multiple active sessions (future)
- [ ] API endpoints:
  - POST /api/sessions (create new)
  - GET /api/sessions/:id (get info)
  - DELETE /api/sessions/:id (delete)

**Technical Details**:
- Frontend: Button in ChatInterface, manage in useDualStreamUI
- Backend: SessionManagementService endpoints

**Dependencies**: E5.S1
**Estimated Points**: 3
**Owner**: Full-stack Dev

---

---

## 🛡️ Epic 6: Error Handling & Recovery

**Goal**: Graceful failures, helpful error messages, automatic recovery

### Story E6.S1: Component Generation Error Recovery
**As a** backend
**I want to** retry component generation if it fails validation
**So that** we get components even if first attempt has issues

**Acceptance Criteria**:
- [ ] Zod validation: Validate component spec against schema
- [ ] On validation fail: Retry 1x with component-specific prompt
- [ ] On retry fail: Retry again (2x total) with simplified prompt
- [ ] After 2 failures: Return componentSpec = null (fallback to text)
- [ ] Logging: Log all retry attempts
- [ ] Performance: Total time still < 5 seconds

**Technical Details**:
- File: `packages/middleware/src/services/error-recovery.ts`
- Integration: In `ComponentGenerationService`
- Prompts: Component-specific recovery prompts

**Dependencies**: E2.S3
**Estimated Points**: 4
**Owner**: Backend Dev

---

### Story E6.S2: API Error Handling & Timeouts
**As a** backend
**I want to** handle API errors gracefully
**So that** users get helpful error messages

**Acceptance Criteria**:
- [ ] Gemini API timeout: Retry 1x automatically
- [ ] Gemini API error: Return error response with helpful message
- [ ] Network error: Return 500 with message
- [ ] Invalid request: Return 400 with validation error
- [ ] Tool execution error: Log, continue with null result
- [ ] Response format: Always `{ success, data/error, code }`
- [ ] Logging: All errors logged with context

**Technical Details**:
- File: Fastify route handlers
- Error handling: Try-catch + specific error handlers
- Response format: Standardized error schema

**Dependencies**: None
**Estimated Points**: 3
**Owner**: Backend Dev

---

### Story E6.S3: Frontend Error Boundaries & User Feedback
**As a** frontend
**I want to** show helpful errors when component rendering fails
**So that** users understand what went wrong

**Acceptance Criteria**:
- [ ] Error boundary: Wrap each component in error boundary
- [ ] Fallback UI: Show error message + suggestion
- [ ] Component render fail: Show "Unable to render [component]" message
- [ ] API error: Show "Network error. Retry?" with retry button
- [ ] User-friendly: Avoid technical jargon
- [ ] Console logging: Technical details logged for debugging
- [ ] Storybook: Component for testing error states

**Technical Details**:
- File: `apps/web/components/generative/ErrorBoundary.tsx`
- Pattern: React Error Boundary class component
- Fallback: Simple error message + retry button

**Dependencies**: E3 (components)
**Estimated Points**: 3
**Owner**: Frontend Dev

---

---

## 📊 Priority & Dependencies

### Critical Path (Must complete first)
```
1. E1.S1 (Chat UI) → E1.S2 (Message display)
2. E2.S1 (DualRequestHandler) ← needs E4.S1, E5.S1
3. E2.S2 (Text generation) & E2.S3 (Component generation)
4. E3.S1-S7 (All components)
5. E6 (Error handling)
```

### Parallel Tracks
- **Track A**: Frontend (E1, E3, E6.S3)
- **Track B**: Backend Core (E2, E4, E5, E6.S1/S2)

### Dependency Graph
```
E1.S1
├── E1.S2 (depends on E1.S1)
│   └── E3.S1-S7 (components render here)
│
E1.S3 (Session) ← independent
├── E1.S4 (API client) ← depends on E1.S3
│   └── E2.S1 (DualRequestHandler) ← core backend
│       ├── E2.S2 (Text generation)
│       ├── E2.S3 (Component generation)
│       ├── E4 (Tool system) ← independent
│       ├── E5.S1 (Conversation history) ← independent
│       └── E6.S1/S2 (Error handling) ← independent
│
E6.S3 (Frontend error boundary) ← depends on E3
```

---

## ✅ Acceptance Criteria

### Phase 1 Completion Criteria
- [ ] All 22 stories marked DONE
- [ ] Code coverage: > 60%
- [ ] No critical bugs
- [ ] All 7 components render without error
- [ ] Response time: < 5 seconds (target < 3s)
- [ ] Documentation complete (this file + code comments)
- [ ] Team review: Approved by tech lead

### Definition of Done (Per Story)
- [ ] Code written & locally tested
- [ ] Unit tests pass (if applicable)
- [ ] Code review approved
- [ ] Storybook story created (if UI component)
- [ ] Documentation updated
- [ ] E2E test passes (if integration)
- [ ] Merged to main branch

### Testing Checklist (Phase 1)
- [ ] 10+ chat messages in sequence work
- [ ] All 7 component types render correctly
- [ ] Progressive disclosure UI works
- [ ] Error messages appear and are helpful
- [ ] Multiple sessions work independently
- [ ] Tool execution works end-to-end
- [ ] Performance target met

---

## 📝 Notes

### Estimation Notes
- Points use Fibonacci scale (1, 3, 5, 8, 13)
- Total: ~90 points (assuming 8-13 hr per point = 350-550 hours)
- With team of 2-3 devs: 4-6 weeks

### Risk Notes
- LLM quality: Component generation accuracy depends on prompt engineering
- Performance: Gemini API latency could exceed 3s target
- Browser compatibility: Test on all major browsers

### Future Work (Phase 2+)
- [ ] Streaming responses (SSE)
- [ ] Response caching
- [ ] Multi-language AI responses
- [ ] Custom components (user-defined)
- [ ] Real-time collaboration

---

**Document Version**: 1.0
**Last Updated**: 2025-12-05
**Owner**: Product Management
**Status**: ACTIVE

---
