# Story 2-1: Dual-Stream Request Handler

## Story Info
- **Epic**: E2 - Component Generation
- **Story ID**: 2-1
- **Title**: Dual-Stream Request Handler
- **Priority**: P0 Critical
- **Points**: 8
- **Status**: in-progress

---

## User Story

**As a** backend system
**I want to** handle `/api/chat` requests with 2-stream parallel generation
**So that** text and component generate simultaneously for faster responses

---

## Acceptance Criteria

- [ ] `DualRequestHandler` class created and functional
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

---

## Technical Details

### Files to Modify/Create
```
packages/middleware/src/middleware/dual-request-handler.ts
packages/middleware/src/services/text-summary.service.ts
packages/middleware/src/services/component-generation.service.ts
```

### Services Used
- `TextSummaryService` - Text generation with Gemini Flash
- `ComponentGenerationService` - Component spec with Gemini Pro
- `ToolExecutionService` - Tool execution
- `SessionManagementService` - Session management

### API Contract

**Request:**
```typescript
POST /api/chat
{
  message: string;
  sessionId: string;
  conversationHistory?: Message[];
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    textSummary: string;
    componentSpec: ComponentSpec | null;
    metadata: {
      textGenTime: number;
      componentGenTime: number;
      totalTime: number;
      toolsUsed: string[];
    }
  }
}
```

---

## Current Issues (Blockers)

### BLOCKER-001: Cannot Verify Architecture
- **Problem**: No API-level tests to verify 2-request parallel generation
- **Impact**: Unknown if core feature works correctly
- **Solution**: Add API E2E tests with HTTP mocking

### Investigation Needed
1. Are both requests firing in parallel?
2. Is response format correct?
3. What happens when component generation fails?
4. Is timing being tracked correctly?

---

## Tasks

### Task 1: Audit Current Implementation
- [ ] Read `dual-request-handler.ts` completely
- [ ] Verify Promise.all for parallel execution
- [ ] Check error handling paths
- [ ] Verify response format matches contract

### Task 2: Add API E2E Tests
- [ ] Create test file: `packages/middleware/tests/dual-request-handler.test.ts`
- [ ] Test: Both streams fire in parallel
- [ ] Test: Response format validation
- [ ] Test: Component failure fallback
- [ ] Test: Timing metrics accuracy

### Task 3: Fix Issues Found
- [ ] Fix any bugs found during audit
- [ ] Ensure proper error handling
- [ ] Add logging for debugging

### Task 4: Verify Integration
- [ ] Test with real Gemini API
- [ ] Verify frontend receives correct format
- [ ] Test component rendering in chat

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] API E2E tests passing
- [ ] Response time < 5 seconds
- [ ] Error handling verified
- [ ] Frontend integration working
- [ ] Code reviewed and approved

---

## Dependencies

- **Depends On**: E4 (Tool system), E5 (Session management)
- **Blocks**: E2.S2, E2.S3, All component rendering

---

## Notes

This is the **CORE** backend feature. Until this is verified working, component integration into chat cannot be completed. Priority is to:
1. Audit existing code
2. Add tests to verify behavior
3. Fix any issues found
