# Sprint Quick Start Guide
**Sprint**: Phase 2 Week 1 - Critical Bug Fixes
**Duration**: 5 Working Days (Monday-Friday)
**Start Date**: 2025-12-05
**Status**: 🟢 READY TO START

---

## ⚡ Quick Overview (30 seconds)

```
GOAL: Fix 3 critical blockers preventing MVP demo
TARGET: 65%+ E2E tests passing (35/54)

🔴 Critical Issues:
1. Components don't render after AI response
2. Can't verify 2-Request architecture works
3. Input field doesn't disable during response

📊 Team: 3 people × 5 days = 15 person-days
📈 Scope: 37 story points (P0 + P1 only)
```

---

## 🚀 Day 1 (TODAY) - Understanding & Setup

### Morning (2 hours)

**Team Standup** (15 min)
```
Where: Slack video call / Meeting Room
Time: 9:00 AM
Agenda:
- Read SPRINT_PLAN.md together
- Understand 3 critical blockers
- Ask questions
- Assign tasks
```

**Setup & Environment** (45 min)
```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Start dev servers
cd apps/web && pnpm dev &
cd packages/middleware && pnpm dev &

# Verify running
curl http://localhost:3000     # Frontend
curl http://localhost:3001/health   # Backend
```

**Read Documentation** (30 min)
- [ ] TEST_REPORT_E2E.md (focus on "Critical Issues")
- [ ] IMPLEMENTATION_STATUS.md (focus on "What's Broken")
- [ ] SPRINT_PLAN.md (focus on P0 stories)

---

### Afternoon (3 hours)

**Role-Based Kickoff**

#### 👨‍💻 Frontend Developer

**Goal**: Understand component rendering issue

1. [ ] Open ChatInterface flow in code
   ```
   apps/web/components/chat/ChatInterface.tsx
   ↓
   apps/web/hooks/useDualStreamUI.ts
   ↓
   apps/web/lib/api-client.ts
   ```

2. [ ] Open MessageWithComponent.tsx
   - How is it called?
   - What props does it expect?
   - Is it mounting?

3. [ ] Set up logging
   ```typescript
   console.log('📤 Sending message:', input);
   console.log('📥 Response received:', response);
   console.log('🎨 Component spec:', response.componentSpec);
   console.log('🖼️ Rendering component:', componentSpec.type);
   ```

4. [ ] Send test message in UI
   - Open http://localhost:3000/playground
   - Send: "show me a table"
   - Watch browser console
   - Check if component renders

**Deliverable**: Understand where rendering breaks

---

#### 🔧 Backend/Full Stack Developer

**Goal**: Verify API response format

1. [ ] Start API server
   ```bash
   cd packages/middleware
   pnpm dev
   ```

2. [ ] Test with curl
   ```bash
   curl -X POST http://localhost:3001/api/chat/complete \
     -H "Content-Type: application/json" \
     -d '{
       "message": "show me a table",
       "sessionId": "test-session"
     }' | jq .
   ```

3. [ ] Check response structure
   - Does it have textSummary?
   - Does it have componentSpec?
   - Is componentSpec valid?
   - How long does request take?

4. [ ] Check source code
   ```
   packages/middleware/src/middleware/dual-request-handler.ts
   packages/middleware/src/services/text-summary.service.ts
   ```

5. [ ] Add logging
   ```typescript
   console.log('📨 Dual request started');
   console.log('✅ Text response:', textResponse);
   console.log('✅ Component response:', componentResponse);
   console.log('⏱️ Response time:', endTime - startTime);
   ```

**Deliverable**: Understand API response flow

---

#### 🧪 QA Engineer

**Goal**: Understand test failures

1. [ ] Review failing tests
   - Open `apps/web/tests/e2e/chat-interface.spec.ts`
   - Review test at line 16 (strict mode issue)
   - Review test at line 90 (input disable issue)

2. [ ] Run tests locally
   ```bash
   cd apps/web
   pnpm test -- chat-interface.spec.ts
   ```

3. [ ] Check failures
   - Screenshot location: `test-results/`
   - Error logs: `test-results/**/error-context.md`
   - Open in browser to see actual state

4. [ ] Create test checklist
   - [ ] Current pass/fail status
   - [ ] Root cause per test
   - [ ] Fix required (yes/no)

**Deliverable**: Clear test failure analysis

---

### End of Day 1

**Sync-up** (15 min)
```
Share findings:
- Frontend: "Component doesn't render because..."
- Backend: "Response looks like..."
- QA: "Tests fail because..."
```

**Blockers Found**: Document any unexpected issues

---

## 🔥 Day 2 (Tomorrow) - Fix P0.1 & P0.2

### Goal
Fix component rendering + verify dual-request architecture

### Frontend Track (P0.1 - Debug & Fix)

**Step 1: Identify Issue** (1 hour)
- [ ] Run one message through debugger
- [ ] Use browser DevTools breakpoints
- [ ] Check MessageWithComponent props
- [ ] Check if component renders in DOM

**Step 2: Create Fix** (2 hours)
- [ ] If rendering issue: Fix component mounting
- [ ] If props issue: Fix prop passing
- [ ] If response issue: Work with backend
- [ ] Add error handling

**Step 3: Verify Fix** (30 min)
- [ ] Manual test in UI
- [ ] Run E2E test: `component-rendering.spec.ts`
- [ ] Check console for errors

**Definition of Done**:
- [ ] Component visible in chat after message
- [ ] No console errors
- [ ] E2E test passes

---

### Backend Track (P0.2 - Create API Tests)

**Step 1: Create Test File** (30 min)
```bash
# Create new test file
cat > apps/web/tests/e2e/api-dual-request.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('Dual-Request API', () => {
  test('should send dual requests in parallel', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/chat/complete', {
      data: {
        message: 'show me a table',
        sessionId: 'test-session'
      }
    });

    const data = await response.json();

    // Verify structure
    expect(data.success).toBe(true);
    expect(data.data.textSummary).toBeDefined();
    expect(data.data.componentSpec).toBeDefined();
    expect(data.data.metadata.textGenTime).toBeDefined();
    expect(data.data.metadata.componentGenTime).toBeDefined();
  });
});
EOF
```

**Step 2: Run & Fix** (1.5 hours)
- [ ] Run test: `pnpm test -- api-dual-request.spec.ts`
- [ ] Check failures
- [ ] Fix backend if needed
- [ ] Rerun until passing

**Step 3: Add Response Validation** (30 min)
- [ ] Validate text ≤ 3 sentences
- [ ] Validate componentSpec is JSON
- [ ] Validate response time < 5s
- [ ] Add assertions for all

**Definition of Done**:
- [ ] API test passes
- [ ] Response format correct
- [ ] Performance acceptable

---

### QA Track (Run Existing Tests)

**Step 1: Run Full Suite** (30 min)
```bash
cd apps/web
pnpm test 2>&1 | tee test-results-day2.log
```

**Step 2: Track Results** (30 min)
- [ ] Count passing tests
- [ ] List newly passing tests (if any)
- [ ] Document any new failures
- [ ] Note performance issues

**Step 3: Report** (30 min)
- Create summary document:
  ```
  Tests Passing: XX/54
  Improvement: +XX from yesterday
  New Failures: XX (document root causes)
  Blockers: List any
  ```

**Definition of Done**:
- [ ] Full test suite run
- [ ] Results documented
- [ ] Trending tracked

---

### End of Day 2 Check-in (15 min)

```
Questions to answer:
✓ Is component rendering fixed?
✓ Does API return correct format?
✓ How many tests passing now?
✓ Any new blockers?
```

---

## 🎯 Day 3 - Fix P0.3 & Run Full Suite

### Goal
Disable input during request + reach 65% tests passing

### Frontend Track (P0.3 - Input Disable)

**Simple 3-Step Fix**:

1. [ ] Add state
```typescript
const [isLoading, setIsLoading] = useState(false);
```

2. [ ] Disable on send
```typescript
const handleSend = async () => {
  setIsLoading(true);
  try {
    await sendMessage(input);
  } finally {
    setIsLoading(false);
  }
};
```

3. [ ] Update UI
```typescript
<input disabled={isLoading} />
<button disabled={isLoading}>{isLoading ? 'Sending...' : 'Send'}</button>
```

**Time**: 30-45 minutes
**Definition of Done**:
- [ ] Input disables on send
- [ ] Button shows "Sending..."
- [ ] No spam possible
- [ ] E2E test passes

---

### QA Track (Fix Test Locators)

**Issues to Fix** (From TEST_REPORT_E2E.md):

1. [ ] Line 16: Strict mode violation
   ```typescript
   // Before
   await expect(page.locator('p')).toContainText('Ask me anything');

   // After
   await expect(page.getByText('Ask me anything')).toBeVisible();
   ```

2. [ ] Line 90: Input selector
   ```typescript
   // Make selector specific
   const input = page.locator('input[placeholder="Type your message..."]');
   ```

3. [ ] Verify no warnings
   ```bash
   pnpm test 2>&1 | grep -i "strict\|multiple\|resolved"
   ```

**Time**: 1-2 hours
**Definition of Done**:
- [ ] All locators specific
- [ ] No strict mode warnings
- [ ] Tests pass consistently

---

### Full Team - Run Test Suite

```bash
# Run complete test suite
cd apps/web
pnpm test

# Count results
pnpm test 2>&1 | grep -E "passed|failed"
```

**Success**: 35+ tests passing (65%+)

---

## 📅 Day 4 & 5 - Polish & Wrap Up

### Day 4 Morning
- [ ] All P0 issues complete?
- [ ] Tests passing? (65%+)
- [ ] Code review in progress?

### Day 4 Afternoon
- [ ] Code reviews complete
- [ ] All PRs merged
- [ ] Test suite fully passing

### Day 5 Morning
- [ ] Final test run
- [ ] Documentation updated
- [ ] Prepare for demo

### Day 5 Afternoon
- [ ] Sprint Review meeting
- [ ] Retrospective
- [ ] Plan next sprint

---

## 📋 Daily Checklist

### Every Morning
- [ ] Read overnight updates
- [ ] Standup meeting (15 min)
- [ ] Clear task for today
- [ ] Check if blocked

### During Day
- [ ] Push code frequently
- [ ] Add comments for complex code
- [ ] Update ticket status
- [ ] Log blockers immediately

### End of Day
- [ ] Create PR if code done
- [ ] Update ticket status
- [ ] Document findings
- [ ] Prepare for tomorrow

---

## 🐛 Common Issues & Fixes

### Issue: "Components not appearing"
**Quick Checks**:
1. [ ] Check browser console for errors
2. [ ] Check network tab for API response
3. [ ] Check if componentSpec in response
4. [ ] Check MessageWithComponent rendered

### Issue: "Tests failing with timeout"
**Quick Fixes**:
1. [ ] Increase timeout in test
2. [ ] Check if server running
3. [ ] Check if port correct
4. [ ] Clear browser cache

### Issue: "API returns 500 error"
**Quick Fixes**:
1. [ ] Check backend console
2. [ ] Check environment variables
3. [ ] Check Gemini API key valid
4. [ ] Restart backend server

### Issue: "Input doesn't disable"
**Quick Fixes**:
1. [ ] Check isLoading state set
2. [ ] Check disabled attribute applied
3. [ ] Check no other logic overriding
4. [ ] Check React re-render working

---

## 🎉 Success Indicators

By end of sprint, you'll see:
✅ **35+ E2E tests passing** (was 22)
✅ **All P0 issues resolved**
✅ **Components rendering in chat**
✅ **Can't spam messages** (input disables)
✅ **API validated working**

---

## 📞 Need Help?

### Quick Questions
👉 Ask teammate first (5 min)

### Stuck > 30 minutes
👉 Ask in #sprint-support Slack

### Blocked Completely
👉 Escalate to Tech Lead

### Outside Sprint Scope
👉 Document, move to backlog

---

## 📊 Track Progress

### Daily Progress Board
```
Day 1: ? tests → ? tests (Status: Understanding)
Day 2: ? tests → ? tests (Status: Fixing P0.1 & P0.2)
Day 3: ? tests → ? tests (Status: Fixing P0.3)
Day 4: ? tests → ? tests (Status: Polishing)
Day 5: ? tests → 35+ tests (Status: Complete!)
```

### Update daily on Slack
```
📊 Day 3 EOD Status:
- Tests: 30/54 passing (55%)
- P0 Issues: 1/3 fixed
- Blockers: None
- Tomorrow: Finish input disable
```

---

## 🚀 Ready to Start?

1. [ ] Read this page (you are here ✓)
2. [ ] Read SPRINT_PLAN.md (detailed tasks)
3. [ ] Join morning standup at 9 AM
4. [ ] Pick your role (Frontend/Backend/QA)
5. [ ] Complete Day 1 setup
6. [ ] Report findings at end of day

**Questions?** → Ask in #sprint-support before starting

---

*Let's ship it! 🚀*

Generated: 2025-12-05
Status: READY FOR EXECUTION
