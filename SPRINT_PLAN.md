# Sprint Plan - All-in-One Chat Recovery
**Sprint Name**: Phase 2 Week 1 - Critical Bug Fixes & Validation
**Created**: 2025-12-05
**Duration**: 1 Sprint (5 working days)
**Status**: 🟡 PLANNED

---

## 🎯 Sprint Goal

Fix critical blockers preventing MVP completion:
1. Verify & fix 2-Request architecture
2. Fix component rendering pipeline
3. Implement input state management
4. Reach 65%+ E2E test pass rate

**Success Criteria**:
- ✅ 35+ tests passing (65%+)
- ✅ 2-Request architecture validated
- ✅ Components rendering in chat
- ✅ No P0 blockers remaining

---

## 🔴 Critical Issues (P0 - Must Fix This Sprint)

### Issue P0.1: Component Rendering Broken
**Status**: 🔴 BLOCKED
**Impact**: Cannot demo F3 (7 Components)
**Root Cause**: Unknown - message count not increasing

#### Story: Debug & Fix Component Rendering Pipeline
**Priority**: 🔴 P0.1 CRITICAL
**Points**: 13
**Owner**: [Dev]

**Tasks**:
1. [ ] **Debug Session** (3 pts)
   - Set up local environment with detailed logging
   - Add console.log to trace component flow
   - Check network requests in DevTools
   - Verify API response contains component spec

   **Acceptance**:
   - Can trace full component flow from request to render
   - Screenshots of network requests
   - Console logs showing component spec received

2. [ ] **Fix Backend Response** (5 pts) - IF NEEDED
   - Verify dual-request handler sends component spec
   - Check response format matches schema
   - Test with curl/Postman
   - Add API test for response validation

   **Acceptance**:
   - API returns valid component spec
   - curl test successful
   - Response matches expected format

3. [ ] **Fix Frontend Rendering** (5 pts) - IF NEEDED
   - Verify MessageWithComponent mounting
   - Check component prop passing
   - Fix component rendering logic
   - Add error handling

   **Acceptance**:
   - Component renders in DOM
   - E2E test passes: "component visible after response"
   - No console errors

---

### Issue P0.2: Dual-Request Architecture Unverified
**Status**: 🔴 BLOCKED
**Impact**: Don't know if core feature works
**Root Cause**: No API-level tests

#### Story: Create API-Level E2E Tests for Dual-Request
**Priority**: 🔴 P0.2 CRITICAL
**Points**: 8
**Owner**: [QA/Dev]

**Tasks**:
1. [ ] **Create API Test Suite** (5 pts)
   - Create new file: `apps/web/tests/e2e/api-dual-request.spec.ts`
   - Test endpoint: POST /api/chat/complete
   - Verify 2 requests sent in parallel
   - Validate response format
   - Check response time < 5s

   **Acceptance**:
   ```typescript
   test('should send dual requests in parallel', async () => {
     // Mock timing to verify parallel execution
     // Verify both responses received
     // Check response contains textSummary + componentSpec
   })
   ```

2. [ ] **Validate Response Schema** (3 pts)
   - Check response structure:
     ```typescript
     {
       success: boolean,
       data: {
         textSummary: string,
         componentSpec: { type: string, props: {} } | null,
         metadata: {
           textGenTime: number,
           componentGenTime: number
         }
       }
     }
     ```
   - Verify text ≤ 3 sentences
   - Verify componentSpec is valid JSON

   **Acceptance**:
   - Schema validation test passes
   - Response format correct
   - Text length within limits

---

### Issue P0.3: Input State Management Broken
**Status**: 🟡 IN PROGRESS (partial)
**Impact**: UX broken, can spam requests
**Root Cause**: Missing disable logic

#### Story: Implement Input Disable & Loading State
**Priority**: 🔴 P0.3 HIGH
**Points**: 5
**Owner**: [Frontend Dev]

**Tasks**:
1. [ ] **Add isLoading State** (2 pts)
   - Modify ChatInterface.tsx
   - Add useState for isLoading
   - Set to true on sendMessage
   - Set to false on response received

   **Acceptance**:
   - isLoading state in component
   - Console logs show state changes
   - No TypeScript errors

2. [ ] **Disable Input During Load** (2 pts)
   - Disable input field when isLoading=true
   - Disable send button when isLoading=true
   - Show visual feedback (opacity, cursor)

   **Acceptance**:
   - Input disabled in UI
   - E2E test passes: "input should be disabled"
   - No spam possible

3. [ ] **Add Loading Indicator** (1 pt)
   - Show animated dots/spinner
   - Display "Processing..." message
   - Animate during response

   **Acceptance**:
   - Loading indicator visible
   - Animated smoothly
   - E2E test: "loading state visible" passes

---

## 🟠 High Priority Issues (P1 - Complete This Sprint)

### Issue P1.1: Locator Strict Mode Violations
**Status**: 🟡 IN PROGRESS
**Impact**: Tests flaky, false negatives
**Root Cause**: Generic selectors matching multiple elements

#### Story: Fix E2E Test Locators
**Priority**: 🟠 P1.1 HIGH
**Points**: 3
**Owner**: [QA]

**Tasks**:
1. [ ] **Fix chat-interface.spec.ts** (2 pts)
   - Line 16: Replace `page.locator('p')` with specific selector
   - Line 15: Use `getByText('Ask me anything')`
   - Line 90: Fix strict mode for input selector

   **Acceptance**:
   - All 3 tests pass
   - No strict mode violations
   - Locators are specific

2. [ ] **Fix component-rendering.spec.ts** (1 pt)
   - Review all locators
   - Fix any generic element selectors
   - Make selectors specific to component

   **Acceptance**:
   - All selectors are specific
   - No warnings about multiple matches

---

### Issue P1.2: Missing Progressive Disclosure UI
**Status**: 🔴 NOT STARTED
**Impact**: UX doesn't match PRD
**Root Cause**: Not implemented

#### Story: Implement Expand/Collapse Component Pattern
**Priority**: 🟠 P1.2 MEDIUM-HIGH
**Points**: 8
**Owner**: [Frontend Dev]

**Tasks**:
1. [ ] **Design Pattern** (2 pts)
   - Design expand/collapse UI
   - Sketch interaction flow
   - Define CSS classes
   - Create figma mockup (optional)

   **Acceptance**:
   - Design documented
   - Interaction clear
   - Ready for implementation

2. [ ] **Implement Collapse Component** (4 pts)
   - Create ExpandableComponent wrapper
   - Add useState for expanded state
   - Button to toggle expansion
   - Smooth collapse/expand animation
   - CSS for hidden state

   **Acceptance**:
   - Component mounts without error
   - Toggle works
   - Animation smooth
   - No TypeScript errors

3. [ ] **Integrate with MessageWithComponent** (2 pts)
   - Wrap component rendering in ExpandableComponent
   - Show text by default
   - Component hidden by default
   - Click to expand

   **Acceptance**:
   - Component hidden initially
   - Text always visible
   - Expand button works
   - E2E test passes

---

## 🟡 Medium Priority Issues (P2 - Can Start Next Sprint)

### Issue P2.1: Component Coverage (5/7 Missing)
**Status**: 🔴 NOT STARTED
**Impact**: 14% feature complete only
**Root Cause**: Components not fully implemented

#### Story: Implement Form Component
**Priority**: 🟡 P2.1 MEDIUM
**Points**: 8
**Owner**: [Frontend Dev]

**Tasks**:
1. [ ] **Create Form Component** (4 pts)
   - Structure: FormComponent.tsx
   - Support: text, select, checkbox, radio fields
   - Props: fields[], layout, onSubmit
   - Validation on submit

   **Acceptance**:
   - Component renders
   - All field types work
   - Validation triggers
   - No TypeScript errors

2. [ ] **Add Form Tests** (2 pts)
   - Unit tests for validation
   - E2E test for form submission
   - Test different field types

   **Acceptance**:
   - 3+ tests passing
   - All field types covered

3. [ ] **Update Component Registry** (2 pts)
   - Register FormComponent
   - Add to component factory
   - Add to type definitions

   **Acceptance**:
   - Component registry updated
   - Can instantiate from API

---

#### Story: Implement List Component
**Priority**: 🟡 P2.1 MEDIUM
**Points**: 5
**Owner**: [Frontend Dev]

**Tasks**:
1. [ ] **Create List Component** (3 pts)
   - Structure: ListComponent.tsx
   - Support: items[], searchable, selectable
   - Badge support for status
   - Filter/search functionality

   **Acceptance**:
   - Component renders list
   - Search filters items
   - Checkboxes selectable
   - Badges display

2. [ ] **Add Tests** (2 pts)
   - E2E tests for filtering
   - E2E tests for selection
   - E2E tests for display

   **Acceptance**:
   - 3+ tests passing

---

#### Story: Implement Slides Component
**Priority**: 🟡 P2.1 MEDIUM
**Points**: 8
**Owner**: [Frontend Dev]

**Tasks**:
1. [ ] **Create Slides Component** (4 pts)
   - Structure: SlidesComponent.tsx
   - Navigation: prev/next buttons, dots
   - Auto-play with interval control
   - Touch swipe for mobile

   **Acceptance**:
   - Component renders slides
   - Navigation works
   - Auto-play toggles
   - No errors

2. [ ] **Implement Auto-Play** (2 pts)
   - setInterval for auto rotation
   - Pause on hover
   - Interval configurable

   **Acceptance**:
   - Auto-plays
   - Interval adjustable
   - Can toggle off

3. [ ] **Add Tests** (2 pts)
   - E2E navigation tests
   - E2E auto-play test
   - E2E dot indicator test

   **Acceptance**:
   - 3+ tests passing

---

#### Story: Implement Report Component
**Priority**: 🟡 P2.1 MEDIUM
**Points**: 8
**Owner**: [Frontend Dev]

**Tasks**:
1. [ ] **Create Report Component** (4 pts)
   - Structure: ReportComponent.tsx
   - Sections with headings/content
   - Print button
   - Author/date metadata
   - Page break support

   **Acceptance**:
   - Component renders
   - All sections display
   - Print button visible
   - Metadata shows

2. [ ] **Implement Print/PDF Export** (2 pts)
   - Print button triggers print dialog
   - PDF export via browser print
   - Print-friendly styling
   - Page breaks work

   **Acceptance**:
   - Print dialog opens
   - PDF generation works
   - Formatting correct

3. [ ] **Add Tests** (2 pts)
   - E2E print button test
   - E2E structure test
   - E2E metadata test

   **Acceptance**:
   - 3+ tests passing

---

### Issue P2.2: Missing Tool System Tests
**Status**: 🔴 NOT STARTED
**Impact**: Cannot verify tools work
**Root Cause**: No API tests for tools

#### Story: Create Tool System E2E Tests
**Priority**: 🟡 P2.2 MEDIUM
**Points**: 5
**Owner**: [QA]

**Tasks**:
1. [ ] **Test get_current_date Tool** (2 pts)
   - Call /api/tools endpoint
   - Execute get_current_date
   - Verify response format
   - Check date is current

   **Acceptance**:
   - Tool returns date
   - Format correct
   - No errors

2. [ ] **Test calculate Tool** (2 pts)
   - Execute calculate("2+2")
   - Verify result = 4
   - Test complex expressions
   - Handle errors

   **Acceptance**:
   - Tool calculates correctly
   - Errors handled
   - Results validated

3. [ ] **Test Error Handling** (1 pt)
   - Test invalid tool call
   - Test bad parameters
   - Verify error messages

   **Acceptance**:
   - Errors returned gracefully
   - Message helpful

---

## 📊 Sprint Backlog Summary

### Points Distribution
```
P0 Issues: 26 points (54%)
├─ P0.1: 13 points
├─ P0.2: 8 points
└─ P0.3: 5 points

P1 Issues: 11 points (23%)
├─ P1.1: 3 points
└─ P1.2: 8 points

P2 Issues: 34 points (71%)
├─ Form: 8 points
├─ List: 5 points
├─ Slides: 8 points
├─ Report: 8 points
└─ Tool Tests: 5 points

TOTAL: 71 points (P0+P1 = 37 points for this sprint)
```

### Work Breakdown
- **Debugging & Investigation**: 8 points
- **API/Backend Fixes**: 5 points
- **Frontend Implementation**: 19 points
- **Testing**: 5 points
- **Total This Sprint**: 37 points

---

## 👥 Team Assignments

### Frontend Developer (Primary)
- P0.1: Debug component rendering (3 pts)
- P0.3: Input disable & loading state (5 pts)
- P1.2: Progressive disclosure UI (8 pts)
- **Total**: 16 points

### Backend/Full Stack Developer
- P0.2: API validation tests (3 pts)
- P0.1: Backend fix if needed (5 pts)
- P2.2: Tool system tests (5 pts)
- **Total**: 13 points

### QA Engineer
- P1.1: Fix test locators (3 pts)
- P0.2: Dual-request tests (5 pts)
- P2.2: Tool tests (5 pts)
- **Total**: 13 points

---

## 📅 Daily Standup Plan

### Day 1 (Monday)
**Goal**: Understand current state & begin debugging

- [ ] Team sync on critical blockers (15 min)
- [ ] Frontend: Start P0.1 debugging session
- [ ] Backend: Verify API response format
- [ ] QA: Begin P0.2 test creation

**Deliverable**: Clear picture of root causes

---

### Day 2 (Tuesday)
**Goal**: Fix P0 issues & validate architecture

- [ ] Frontend: Complete debugging, identify needed fixes
- [ ] Backend: Implement API fixes if needed
- [ ] QA: Validate dual-request with tests

**Deliverable**: P0.1 & P0.2 tests passing

---

### Day 3 (Wednesday)
**Goal**: Complete input state management & fix test locators

- [ ] Frontend: Complete P0.3 implementation
- [ ] QA: Complete P1.1 test fixes
- [ ] All: Run full test suite

**Deliverable**: 35+ tests passing (65%+)

---

### Day 4 (Thursday)
**Goal**: Begin P1.2 progressive disclosure

- [ ] Frontend: Design & start implementing expand/collapse
- [ ] Backend: Help with any remaining P0 issues
- [ ] QA: Prepare P1.2 test cases

**Deliverable**: P1.2 design ready

---

### Day 5 (Friday)
**Goal**: Sprint review & cleanup

- [ ] Frontend: Finish P1.2 or move to backlog
- [ ] All: Polish & final testing
- [ ] Team: Sprint review & retrospective

**Deliverable**: Sprint complete, 65%+ tests passing

---

## 🏁 Definition of Done

For each task to be considered complete:
- [ ] Code written & passes linting (ESLint, Prettier)
- [ ] TypeScript strict mode: no errors
- [ ] Unit tests passing (if applicable)
- [ ] E2E tests written & passing
- [ ] No console errors
- [ ] Code reviewed (PR approved)
- [ ] Merged to main/dev branch
- [ ] Documented (JSDoc, comments where needed)

---

## 📈 Success Metrics

### Measurable Goals
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| E2E Tests Passing | 22/54 (40%) | 35/54 (65%) | 🎯 |
| P0 Blockers | 3 | 0 | 🎯 |
| Components Working | 1/7 | 3/7 | 🎯 |
| API Tests | 0 | 5+ | 🎯 |
| Code Coverage | Unknown | 60%+ | 🎯 |

### Quality Gates
- ✅ No P0 unresolved issues
- ✅ 65%+ E2E tests passing
- ✅ All P0 features have tests
- ✅ No TypeScript strict errors
- ✅ Code review completed

---

## 🚨 Risk Mitigation

### Risk 1: Component rendering issue takes longer than expected
**Mitigation**:
- Pair programming session if stuck > 4 hours
- Escalate to senior dev
- Consider fallback approach

### Risk 2: API response format needs significant changes
**Mitigation**:
- Verify with product early
- Create migration strategy
- Test thoroughly before merge

### Risk 3: Firefox MediaFoundation issue blocks testing
**Mitigation**:
- Skip Firefox for now (use 2-browser config)
- Use Docker for CI/CD
- Plan separate Docker setup sprint

---

## 📋 Checklist for Sprint Start

- [ ] Team read and understands this sprint plan
- [ ] Jira/task board updated with stories & tasks
- [ ] Developers have local environment running
- [ ] QA has test environment ready
- [ ] Daily standup scheduled (9:00 AM daily)
- [ ] Sprint review scheduled (end of Day 5)
- [ ] Slack/Discord channel for sprint updates

---

## 📞 Escalation Path

### Issue Resolution
1. **Task Level**: Developer + Peer (15 min sync)
2. **Story Level**: Team Lead + Developer (30 min sync)
3. **Sprint Level**: Product Owner + Tech Lead (1 hour)

### Blockers
- **Minutes 0-30**: Solve locally
- **Minutes 30-60**: Ask peer for help
- **Minutes 60+**: Report to team lead
- **> 2 hours**: Escalate to product owner

---

## 🎓 Learning Objectives

By end of sprint, team should understand:
1. How Dual-Request architecture works
2. How component rendering pipeline works
3. How to write API-level E2E tests
4. Progressive disclosure UI patterns
5. Full component lifecycle in chat

---

## 🔄 Sprint Retrospective Template

**What went well?**
- [ ]
- [ ]

**What could be improved?**
- [ ]
- [ ]

**Action items for next sprint:**
- [ ]
- [ ]

---

## 📝 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-05 | Initial sprint plan created |
| - | - | - |

---

*Sprint Plan Created by Claude Code*
*Last Updated: 2025-12-05*
*Status: READY FOR SPRINT START*
