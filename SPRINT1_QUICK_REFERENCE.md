# Sprint 1 Quick Reference Card
## 1-Page Cheat Sheet for Developers

**Print this out or keep open while coding!**

---

## 🎯 Sprint 1 Mission (5 Days)

Build chat interface + backend foundation
- 5 Stories, 18 points
- Goal: Chat works locally

---

## 📋 The 5 Stories

| # | Story | Owner | Points | Status |
|---|-------|-------|--------|--------|
| 1 | E1.S1: Chat UI | Frontend | 5 | 🔴 To Do |
| 2 | E1.S2: Messages | Frontend | 5 | 🔴 To Do |
| 3 | E1.S3: Sessions | Backend | 3 | 🔴 To Do |
| 4 | E1.S4: API Client | Full-stack | 3 | 🔴 To Do |
| 5 | Backend Setup | Backend | 2 | 🔴 To Do |

---

## 🚀 Quick Start (30 min)

```bash
# 1. Clone & install (5 min)
git clone <repo>
cd all-in-one-chat
pnpm install

# 2. Create .env (1 min)
# PROJECT_ROOT/.env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
GEMINI_API_KEY=test_key

# 3. Start servers (1 min)
pnpm dev

# 4. Verify (1 min)
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/health
```

---

## 📁 Key Folders to Know

```
apps/web/                 # React/Next.js frontend
├── app/playground/       ← Chat page goes here
├── components/chat/      ← Chat components here
├── hooks/                ← useDualStreamUI hook here
└── lib/                  ← api-client.ts, types.ts

packages/middleware/      # Fastify backend
├── src/
│   ├── server.ts        ← Fastify setup here
│   ├── services/        ← Business logic here
│   ├── types/           ← Type definitions
│   └── storage/         ← In-memory stores
└── package.json
```

---

## 💻 Frontend Tasks (E1.S1-2)

### E1.S1: Chat Interface UI (5 pts)
**Owner**: Frontend Lead

**Main File**: `apps/web/components/chat/ChatInterface.tsx`
- Input field + send button
- Messages display
- Typing indicator
- Responsive

**Test**:
```bash
# Start dev server
pnpm dev

# Open browser
http://localhost:3000/playground

# Test: Type → Click Send → Message appears
```

### E1.S2: Message Display (5 pts)
**Owner**: Frontend Lead

**Main File**: `apps/web/components/chat/MessageWithComponent.tsx`
- User/assistant messages
- "Xem chi tiết" button
- Component expand/collapse
- Animations

**Test**:
```bash
# Type 10 messages
# Scroll smoothly?
# Mobile view?
# No console errors?
```

---

## 🔧 Backend Tasks (E1.S3-4, Setup)

### E1.S3: Session Management (3 pts)
**Owner**: Backend Lead

**Main File**: `packages/middleware/src/services/session-management.service.ts`
- Create session on first message
- Store in localStorage (frontend)
- Pass sessionId to API

**Test**:
```bash
# 1. Send message
# 2. Open F12 → Storage → localStorage
# 3. See sessionId? ✅
# 4. Refresh page
# 5. sessionId still there? ✅
```

### E1.S4: API Client (3 pts)
**Owner**: Full-stack Dev

**Main File**: `apps/web/lib/api-client.ts`
```typescript
apiClient.sendMessage(message, sessionId)
  → POST /api/chat
  → return { success, data }
```

**Test**:
```bash
# F12 → Network → filter "fetch"
# Send message
# See POST /api/chat? ✅
# Status 200? ✅
# Response has textSummary? ✅
```

### Backend Setup (2 pts)
**Owner**: Backend Lead

**Main Files**: `packages/middleware/src/server.ts`, `src/index.ts`
- Fastify running on :3001
- CORS middleware
- /health endpoint
- /api/chat stub

**Test**:
```bash
# Terminal 1
pnpm dev -F middleware

# Terminal 2
curl http://localhost:3001/health
# { "status": "ok", "timestamp": "..." }

# Terminal 2
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feat/e1-s1-chat-interface

# Make changes
# Commit often
git add .
git commit -m "feat: E1.S1 - Add input field"
git commit -m "feat: E1.S1 - Add send button"

# Before pushing: test locally
pnpm test
pnpm build

# Push & create PR
git push origin feat/e1-s1-chat-interface

# Fill PR template:
# - Description: What changed
# - Story: Which story #
# - Testing: Manual test results
# - Screenshots: If UI
```

---

## ✅ Definition of Done (Per Story)

- [ ] Code written & tested locally
- [ ] Unit tests pass: `pnpm test`
- [ ] No console errors: F12 console clear
- [ ] Build succeeds: `pnpm build`
- [ ] PR created & reviewed
- [ ] PR merged to main
- [ ] Story moved to DONE in Jira

---

## 🔗 API Contract (Sprint 1)

### Request
```json
POST /api/chat
{
  "message": "Show me sales data",
  "sessionId": "sess-123abc"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "textSummary": "Here's the sales data...",
    "componentSpec": null,
    "metadata": {
      "textGenTime": 0,
      "componentGenTime": 0,
      "toolsUsed": []
    }
  }
}
```

---

## 🎯 Daily Standup (10 min)

**10:00 AM Each Day**

Your answer to 3 questions:
1. ✅ What did I complete yesterday?
2. 🔄 What will I do today?
3. ⚠️ Any blockers?

**Example**:
```
Frontend Lead:
✅ Completed: ChatInterface component
🔄 Today: MessageWithComponent styling
⚠️ Blocker: Need API response format confirmation

Backend Lead:
✅ Completed: Fastify setup, health endpoint
🔄 Today: SessionManagementService
⚠️ Blocker: None

Full-stack Dev:
✅ Completed: api-client.ts scaffold
🔄 Today: Error handling, tests
⚠️ Blocker: API contract needed ASAP
```

---

## 🧪 Run Tests

```bash
# All tests
pnpm test

# Specific test
pnpm test ChatInterface

# Coverage report
pnpm test --coverage

# Watch mode (auto-rerun on change)
pnpm test --watch
```

---

## 🚨 Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000/3001 in use | `kill -9 <PID>` or `netstat` |
| Module not found | `pnpm install` |
| TypeScript errors | `pnpm build` (check tsconfig) |
| CORS error | Backend CORS should allow `http://localhost:3000` |
| localStorage not working | Not private mode? Clear cache? |
| Tests failing | Run `pnpm test --verbose` for details |

---

## 📞 Important URLs

```
Frontend: http://localhost:3000/playground
Backend: http://localhost:3001
Health: http://localhost:3001/health
Docs: docs/SPRINT1_KICKOFF.md
PRD: docs/PRD.md
Architecture: docs/ARCHITECTURE.md
```

---

## 🎯 End of Sprint Checklist (Friday)

- [ ] All 5 stories in DONE column
- [ ] All PRs merged
- [ ] Tests passing: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] No critical bugs
- [ ] Demo works locally
- [ ] Retrospective completed

---

**Sprint 1: Dec 5-11, 2025**
**Team**: Frontend Lead, Backend Lead, Full-stack Dev
**Goal**: Chat UI + Backend foundation working

**Print this out! 🖨️**
