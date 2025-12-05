# Day 1 Checklist - Sprint 1 Kickoff
## Friday, December 5, 2025

**Objective**: Get team aligned and development environment ready

---

## ⏰ Timeline

| Time | Activity | Duration | Owner |
|------|----------|----------|-------|
| 9:00 AM | Sprint 1 Kickoff Meeting | 30 min | Team Lead |
| 9:30 AM | Environment Setup Help | 30 min | Tech Lead |
| 10:00 AM | First Daily Standup | 15 min | All |
| 10:15 AM | Story Assignment & Start | 15 min | All |
| 10:30 AM - 5 PM | Development | 6.5 hours | Each |

---

## 📋 Pre-Meeting Checklist (Before 9:00 AM)

### All Team Members

- [ ] **Slack/Teams joined**
  ```
  Check: Can you see #engineering channel?
  ```

- [ ] **Documents reviewed**
  - [ ] PRD.md (5 min read)
  - [ ] ARCHITECTURE.md - Section 1-2 (10 min read)
  - [ ] SPRINT_PLAN_PHASE1.md - Sprint 1 section (10 min read)

- [ ] **Git repo cloned**
  ```bash
  git clone <repo-url>
  cd all-in-one-chat
  ```

- [ ] **Assigned story noted**
  - Frontend Lead: E1.S1 + E1.S2
  - Backend Lead: E1.S3 + Backend Setup
  - Full-stack Dev: E1.S4

---

## 🎯 9:00 AM - Sprint 1 Kickoff Meeting

### Team Lead Talks (10 min)

```
"Hi team! Welcome to Sprint 1 - all-in-one-chat MVP.

📊 Scope:
- 5 stories, 18 points
- 4 business days (today - Thursday)
- Goal: Chat UI + backend foundation

🎯 Definition of Done:
- All 5 stories in DONE column
- Code tested & deployed to main
- Demo working Friday
- Zero critical bugs

🚦 Daily syncs: 10 AM sharp
✅ Let's build!"
```

### Engineering Lead Talks (10 min)

```
"Architecture overview:
- Frontend: Next.js 16 @ :3000
- Backend: Fastify @ :3001
- API contract: POST /api/chat
- Component spec: type + props

Key alignment items:
- Frontend/backend API contract
- Component spec format
- Error handling strategy

Questions?"
```

### Q&A (10 min)

- Any questions about scope?
- Any questions about architecture?
- Any questions about git workflow?

---

## 💻 9:30 AM - Environment Setup

### Group Activity (Everyone together)

**Tech Lead guides team through setup:**

#### Step 1: Verify Node.js (2 min)
```bash
# Everyone runs:
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 8.0.0

# If not, install from https://nodejs.org/
```

#### Step 2: Install PNPM (3 min)
```bash
# Everyone runs:
npm install -g pnpm@8.15.0
pnpm --version    # Should be >= 8.0.0
```

#### Step 3: Install Dependencies (5 min)
```bash
# Everyone runs (in their cloned repo):
cd all-in-one-chat
pnpm install      # Takes 2-3 min

# Verify: No errors printed
```

#### Step 4: Create .env File (2 min)
```bash
# In project root, create file named .env
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
GEMINI_API_KEY=test_key_for_now
EOF

# Verify: File exists
cat .env
```

#### Step 5: Start Dev Servers (2 min)
```bash
# Terminal window: Run this command
pnpm dev

# Should see:
# ✓ apps/web: ready on http://localhost:3000
# ✓ packages/middleware: ready on http://localhost:3001
```

#### Step 6: Verify Both Servers (3 min)

**Open 3 new terminal windows:**

```bash
# Terminal 1: Check frontend
curl http://localhost:3000
# Should return HTML

# Terminal 2: Check backend health
curl http://localhost:3001/health
# Should return: { "status": "ok", "timestamp": "..." }

# Terminal 3: Check git
git log --oneline | head -5
# Should show recent commits
```

**Victory!** 🎉 Everyone's environment ready

---

## 👥 10:00 AM - Daily Standup #1

**Standard format:**

```
Standup Time: 10:00-10:15 AM

🌅 Friday Dec 5, 2025 - Sprint 1 Day 1
════════════════════════════════════════

Frontend Lead:
  ✅ Done: Environment setup, reviewed architecture
  🔄 Today: Start E1.S1 ChatInterface component
  ⚠️  Blockers: None

Backend Lead:
  ✅ Done: Environment setup, reviewed architecture
  🔄 Today: Backend scaffolding + SessionManagementService
  ⚠️  Blockers: Need to clarify API response format

Full-stack Dev:
  ✅ Done: Environment setup, reviewed architecture
  🔄 Today: Create api-client.ts, types.ts
  ⚠️  Blockers: Waiting for API contract agreement

Team Sync Needed:
  → 5 min: API response contract finalization
```

---

## 🚀 10:15 AM - Story Assignment & Start

### Story Assignments (Read Aloud)

**Frontend Lead**:
```
You have: E1.S1 (Chat Interface UI) + E1.S2 (Messages)
File to start: apps/web/components/chat/ChatInterface.tsx

First steps:
1. Create the ChatInterface.tsx file
2. Use skeleton from SPRINT1_KICKOFF.md
3. Create /playground route
4. Test: page loads at http://localhost:3000/playground
5. Push to branch: feat/e1-s1-chat-interface

When blocked or need help, ping in Slack!
```

**Backend Lead**:
```
You have: E1.S3 (Session Management) + Backend Setup
Files to start:
  - packages/middleware/src/server.ts
  - packages/middleware/src/services/session-management.service.ts

First steps:
1. Create server.ts with Fastify setup
2. Test: curl http://localhost:3001/health → 200
3. Create SessionManagementService
4. Test: Create session, verify localStorage
5. Push to branch: feat/e1-s3-session-management

When blocked or need help, ping in Slack!
```

**Full-stack Dev**:
```
You have: E1.S4 (API Client)
Files to start:
  - apps/web/lib/api-client.ts
  - apps/web/lib/types.ts

First steps:
1. Create types.ts with all interfaces
2. Create api-client.ts with sendMessage() function
3. Test: POST /api/chat returns 200
4. Integrate with ChatInterface
5. Push to branch: feat/e1-s4-api-client

When blocked or need help, ping in Slack!
```

---

## 🎯 10:30 AM - 5:00 PM Development

### What Each Person Does

**Frontend Lead** (E1.S1 ChatInterface UI):

```
1. Create ChatInterface.tsx skeleton (30 min)
   📁 apps/web/components/chat/ChatInterface.tsx

2. Create /playground route (15 min)
   📁 apps/web/app/playground/page.tsx

3. Style input + send button (45 min)
   → Input field visible
   → Send button appears
   → Responsive on mobile

4. Test locally (15 min)
   → http://localhost:3000/playground loads
   → Input field focused
   → Click send button works (message appears)

5. Write unit tests (1 hour)
   → Test input field
   → Test send button
   → Test message appears

6. Create PR (10 min)
   → git add .
   → git commit -m "feat: E1.S1 Chat Interface UI"
   → git push origin feat/e1-s1-chat-interface

Total: 3-4 hours (Good pace for Day 1!)
Afternoon: Start E1.S2 Messages
```

**Backend Lead** (E1.S3 + Backend Setup):

```
1. Create server.ts (30 min)
   📁 packages/middleware/src/server.ts
   → Fastify setup
   → CORS middleware
   → /health endpoint

2. Test backend starts (10 min)
   → pnpm dev -F middleware
   → curl http://localhost:3001/health → 200 OK

3. Create SessionManagementService (1 hour)
   📁 packages/middleware/src/services/session-management.service.ts
   → UUID generation
   → Session creation
   → SessionStore interface

4. Create InMemorySessionStore (45 min)
   📁 packages/middleware/src/storage/InMemorySessionStore.ts
   → Map<sessionId, Session>
   → CRUD operations

5. Create types (30 min)
   📁 packages/middleware/src/types/core.types.ts
   → Session, Message, ComponentSpec types

6. Write tests (1 hour)
   → SessionManagementService tests
   → SessionStore tests

7. Create PR (10 min)
   → git push origin feat/e1-s3-session-management

Total: 4-5 hours (Solid Day 1 progress!)
Afternoon: Start API integration
```

**Full-stack Dev** (E1.S4):

```
1. Create types.ts (30 min)
   📁 apps/web/lib/types.ts
   → Message, Session, ComponentSpec interfaces
   → DualResponse interface

2. Create api-client.ts (1 hour)
   📁 apps/web/lib/api-client.ts
   → sendMessage(message, sessionId) function
   → Error handling
   → Retry logic

3. Test API client (30 min)
   → curl POST /api/chat
   → Verify response parsing
   → Test error handling

4. Create useDualStreamUI hook (1.5 hours)
   📁 apps/web/hooks/useDualStreamUI.ts
   → State management
   → Message history
   → API integration

5. Write tests (1 hour)
   → ApiClient tests
   → Hook tests

6. Create PR (10 min)
   → git push origin feat/e1-s4-api-client

Total: 4-5 hours (Solid Day 1!)
Afternoon: Help Frontend/Backend as needed
```

---

## ✅ 5:00 PM - End of Day Checklist

### Individual Verification

- [ ] **Code compiles**: `pnpm build` has no errors
- [ ] **Tests pass**: `pnpm test` shows green
- [ ] **Committed locally**: `git log` shows today's commits
- [ ] **PR created**: Branch pushed, ready for review

### Team Check-In (Quick Slack Update)

Frontend Lead:
```
Day 1 Summary:
✅ ChatInterface component created
✅ /playground route working
✅ Input + send button functional
✅ PR created: feat/e1-s1-chat-interface

Tomorrow: E1.S2 Messages display
```

Backend Lead:
```
Day 1 Summary:
✅ Fastify server running on :3001
✅ SessionManagementService implemented
✅ InMemorySessionStore working
✅ /health endpoint operational
✅ PR created: feat/e1-s3-session-management

Tomorrow: Error handling + tests
```

Full-stack Dev:
```
Day 1 Summary:
✅ types.ts created with all interfaces
✅ api-client.ts implemented
✅ useDualStreamUI hook working
✅ Tests written
✅ PR created: feat/e1-s4-api-client

Tomorrow: Integration + help team
```

---

## 🎉 Success Indicators for Day 1

By end of day, you should have:

- ✅ All environments working (pnpm dev runs clean)
- ✅ At least 1 story started per person
- ✅ Code compiles without errors
- ✅ Tests written (even if basic)
- ✅ PR created for review
- ✅ Team understands API contract
- ✅ Slack channel buzzing with updates

**If you see all checkmarks: Day 1 SUCCESSFUL!** 🎉

---

## 🆘 If You Get Stuck

### Common Issues & Quick Fixes

**"pnpm dev won't start"**
```bash
# Kill existing processes
pkill -f "node"

# Clear cache
pnpm install --force

# Try again
pnpm dev
```

**"TypeScript errors"**
```bash
# Build to see full errors
pnpm build

# Check tsconfig.json is correct
# Add types: declare module or use @types/react
```

**"Tests failing"**
```bash
# Run with verbose
pnpm test --verbose

# Check test syntax
# Make sure imports are correct
```

**"Port already in use"**
```bash
# Find what's using port
lsof -i :3000
lsof -i :3001

# Kill it
kill -9 <PID>
```

**"CORS error in browser"**
```
Frontend can't reach backend
→ Check backend CORS middleware
→ Should be: origin: 'http://localhost:3000'
```

### Get Help

1. **Ask in Slack** (fastest)
2. **Standup meeting** (10 AM daily)
3. **Pair with teammate** (no shame!)
4. **Check docs**: SPRINT1_KICKOFF.md

---

## 📝 Day 1 Summary Template

**Share this at end of day:**

```markdown
# Day 1 Sprint 1 Summary - Dec 5

## Completed ✅
- [ ] Environment setup for team
- [ ] Story assignments clear
- [ ] Initial code skeleton created
- [ ] PRs created for review
- [ ] Tests written

## In Progress 🔄
- [ ] Code reviews
- [ ] Bug fixes

## Blockers ⚠️
- None so far!

## Velocity Estimate
We're on track for **18 pts** by Friday ✅

## Notes
Great first day! Team is energized and moving fast.
```

---

## 🎬 Ready?

**Before leaving for the day:**

- [ ] Commit all work: `git add . && git commit`
- [ ] Push branch: `git push origin your-branch-name`
- [ ] Update Jira: Move stories to "In Progress"
- [ ] Slack message: Post day summary
- [ ] Close laptop: You earned it! 🍕

---

**This is it! Day 1 of Sprint 1.**

**Godspeed! 🚀**

---

**Questions before we start?** Ask now!

Otherwise: **See you at 10 AM standup!**
