# Getting Started - All-in-One Chat
## Welcome to the Project! 👋

**Last Updated**: 2025-12-05
**Status**: 🟢 Sprint 1 In Progress

---

## 🎯 Quick Overview (2 min)

**What is All-in-One Chat?**
An AI platform that generates interactive UI components (charts, tables, forms) in response to user queries.

**Why is this cool?**
Instead of just text responses, users get beautiful, interactive components they can drill into.

**Tech Stack?**
- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Fastify, TypeScript
- AI: Google Gemini API
- Monorepo: PNPM + Turborepo

**Timeline?**
- Phase 1 (4 weeks): MVP foundation
- Phase 2-5 (Next 6 months): Scale, optimize, add features

---

## 📚 Documents - Which One Do I Read?

### Based on Your Role

#### **👨‍💼 Project Manager / Product Owner**
**Start here**: 1 hour
```
1. README.md (this file) - 5 min
2. docs/PRD.md - 20 min
3. docs/ROADMAP.md - 20 min
4. docs/SPRINT_PLAN_PHASE1.md - 15 min

→ You now know: What, When, Why
```

#### **🏗️ Architect / Tech Lead**
**Start here**: 1.5 hours
```
1. docs/ARCHITECTURE.md - 30 min
2. docs/TECH_SPEC.md (Section 1-6) - 40 min
3. docs/USER_STORIES.md - 20 min

→ You now know: How, Technical approach
```

#### **👨‍💻 Backend Engineer**
**Start here**: 2 hours
```
1. docs/TECH_SPEC.md (Section 3, 5, 6) - 40 min
2. docs/USER_STORIES.md (E2, E4, E5, E6) - 30 min
3. SPRINT1_QUICK_REFERENCE.md - 10 min
4. DAY1_CHECKLIST.md - 10 min

→ You now know: Services, API, testing strategy

Then: Start coding with SPRINT1_KICKOFF.md
```

#### **🎨 Frontend Engineer**
**Start here**: 2 hours
```
1. docs/TECH_SPEC.md (Section 4) - 30 min
2. docs/USER_STORIES.md (E1, E3, E6.S3) - 40 min
3. SPRINT1_QUICK_REFERENCE.md - 10 min
4. DAY1_CHECKLIST.md - 10 min

→ You now know: Components, API client, hooks

Then: Start coding with SPRINT1_KICKOFF.md
```

#### **🧪 QA / Tester**
**Start here**: 1.5 hours
```
1. docs/USER_STORIES.md - 40 min
2. docs/TECH_SPEC.md (Section 11) - 20 min
3. docs/PRD.md - 20 min

→ You now know: What to test, How to test
```

---

## 🚀 Get Up and Running (15 min)

### Prerequisites
- Node.js >= 18.0.0
- PNPM >= 8.0.0
- Git

### Installation

```bash
# 1. Clone repo
git clone <repo-url>
cd all-in-one-chat

# 2. Install dependencies
npm install -g pnpm@8.15.0
pnpm install

# 3. Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
GEMINI_API_KEY=test_key_for_now
EOF

# 4. Start dev servers
pnpm dev

# 5. Verify
# Terminal 1: Frontend
curl http://localhost:3000        # Should return HTML

# Terminal 2: Backend
curl http://localhost:3001/health # Should return { status: ok }
```

### Success!
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:3001
- ✅ Chat UI: http://localhost:3000/playground

---

## 📁 Project Structure

```
all-in-one-chat/
├── docs/                          # Project documentation
│   ├── PRD.md                     # Product requirements
│   ├── ARCHITECTURE.md            # System design
│   ├── USER_STORIES.md            # User stories + epics
│   ├── ROADMAP.md                 # 6-month roadmap
│   ├── TECH_SPEC.md               # Technical specification
│   ├── SPRINT_PLAN_PHASE1.md      # Sprint 1 plan (4 weeks)
│   └── INDEX.md                   # Documentation index
│
├── apps/web/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── playground/           # Chat interface
│   │   └── api/                  # API routes
│   ├── components/
│   │   ├── chat/                 # Chat components
│   │   └── generative/           # 7 GenUI components
│   ├── hooks/                    # React hooks
│   ├── lib/                      # Utilities
│   └── package.json
│
├── packages/middleware/           # Fastify backend
│   ├── src/
│   │   ├── server.ts             # Fastify setup
│   │   ├── services/             # Business logic
│   │   ├── types/                # Type definitions
│   │   └── storage/              # Data stores
│   └── package.json
│
├── pnpm-workspace.yaml            # Workspace config
├── turbo.json                     # Build config
├── GETTING_STARTED.md             # This file
├── SPRINT1_QUICK_REFERENCE.md     # Developer cheat sheet
├── DAY1_CHECKLIST.md              # First day guide
└── README.md                      # Original project README
```

---

## 📖 Reading Order (By Timeline)

### **NOW (Before Starting)**
1. ✅ GETTING_STARTED.md (this file)
2. ✅ docs/PRD.md
3. ✅ docs/ARCHITECTURE.md sections 1-3

### **First Day (Dec 5)**
1. ✅ DAY1_CHECKLIST.md
2. ✅ SPRINT1_QUICK_REFERENCE.md
3. ✅ docs/SPRINT_PLAN_PHASE1.md - Sprint 1 section

### **Week 1 (Dec 5-11)**
1. ✅ docs/TECH_SPEC.md
2. ✅ docs/USER_STORIES.md (your assigned stories)
3. ✅ docs/SPRINT1_KICKOFF.md (detailed implementation guide)

### **Ongoing**
- docs/ROADMAP.md (reference as needed)
- docs/ARCHITECTURE.md (reference as questions come up)
- docs/INDEX.md (find documents you need)

---

## 🎯 Common Workflows

### "I'm starting development"
```
1. Read: docs/TECH_SPEC.md
2. Read: docs/SPRINT_PLAN_PHASE1.md (your sprint)
3. Read: docs/SPRINT1_KICKOFF.md (detailed tasks)
4. Start coding!
```

### "I need to understand the architecture"
```
1. Read: docs/ARCHITECTURE.md
2. Look at: apps/web and packages/middleware structure
3. Read: docs/TECH_SPEC.md (more details)
```

### "I need to know what to build"
```
1. Read: docs/USER_STORIES.md
2. Find your assigned story
3. Read: "Acceptance Criteria" and "Technical Details"
4. Check: docs/SPRINT1_KICKOFF.md for code skeleton
```

### "I'm debugging an issue"
```
1. Check: docs/TECH_SPEC.md section 10 (Troubleshooting)
2. Check: SPRINT1_QUICK_REFERENCE.md (Quick fixes)
3. Check: docs/ARCHITECTURE.md (Understanding flow)
4. Ask: In daily standup or Slack
```

### "I'm reviewing someone's PR"
```
1. Check: docs/USER_STORIES.md (acceptance criteria)
2. Check: docs/TECH_SPEC.md (code patterns)
3. Check: PR template in docs/SPRINT1_KICKOFF.md
4. Review: Does it meet acceptance criteria?
```

---

## 👥 Team Roles

### **Frontend Lead**
- Stories: E1.S1, E1.S2, E3.S1, E3.S2, E3.S5, E3.S7, E6.S3
- Key files: `apps/web/components/chat/`, `apps/web/hooks/useDualStreamUI.ts`
- Responsible for: UI components, user experience, responsive design

### **Backend Lead**
- Stories: E1.S3, Backend Setup, E2.S1, E2.S2, E2.S3, E4.S2, E4.S3, E5.S1, E6.S1, E6.S2
- Key files: `packages/middleware/src/services/`
- Responsible for: API, LLM integration, services, database schema

### **Full-stack Dev**
- Stories: E1.S4, E3.S3, E3.S4, E3.S6, E3.S0, E5.S2, Integration, Documentation
- Key files: Both frontend and backend
- Responsible for: API client, component registry, integration testing, docs

---

## 🎯 Current Phase

### **Phase 1: MVP (Dec 5 - Dec 31, 2025)**

**What**: Build core chat interface + dual-stream architecture
**When**: 4 weeks (4 sprints of 1 week each)
**Who**: Frontend Lead, Backend Lead, Full-stack Dev
**Effort**: 106 points total

**Sprint 1** (This week - Dec 5-11): Chat UI + Backend Setup (18 pts)
**Sprint 2** (Dec 12-18): Dual-stream Architecture (26 pts)
**Sprint 3** (Dec 19-25): Component Library (33 pts)
**Sprint 4** (Dec 26-31): Integration + Hardening (29 pts)

---

## ✅ Checklist to Start

- [ ] Node.js >= 18 installed (`node --version`)
- [ ] PNPM installed (`pnpm --version`)
- [ ] Repo cloned (`cd all-in-one-chat`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] .env file created
- [ ] Both servers start (`pnpm dev`)
- [ ] Frontend loads (`http://localhost:3000`)
- [ ] Backend health check passes (`http://localhost:3001/health`)
- [ ] Read docs/PRD.md
- [ ] Read docs/ARCHITECTURE.md
- [ ] Assigned story clear

**If all checked: You're ready!** 🚀

---

## 📞 Getting Help

### Daily Sync
**Time**: 10:00 AM
**Duration**: 15 min
**What**: Share progress, blockers, ask questions

### Slack Channel
**#engineering**
- Questions anytime
- Code reviews
- Pair programming
- Quick answers

### Documentation
**docs/** folder
- PRD.md: What are we building?
- ARCHITECTURE.md: How do we build it?
- USER_STORIES.md: What exactly to build?
- TECH_SPEC.md: How to implement?
- SPRINT1_KICKOFF.md: Detailed tasks

### Pair Programming
- No shame asking for help!
- Complex tasks are done in pairs
- Knowledge sharing is valuable

---

## 🚨 Important Notes

### Before You Code

- ✅ Read your assigned stories
- ✅ Understand acceptance criteria
- ✅ Ask questions if unclear
- ✅ Check existing code patterns
- ✅ No solo big decisions - discuss first

### During Development

- ✅ Commit often (`git commit -m "feature: XYZ"`)
- ✅ Write tests as you go
- ✅ Keep messages in git small and descriptive
- ✅ Ask for help early, not late
- ✅ Update documentation as you go

### Before PR

- ✅ Local tests pass (`pnpm test`)
- ✅ Build passes (`pnpm build`)
- ✅ No console errors (`F12 console`)
- ✅ Mobile tested (if UI)
- ✅ Follow PR template (in SPRINT1_KICKOFF.md)

---

## 🎬 Your First Day

**Morning (9 AM - 10 AM)**:
1. Team kickoff meeting
2. Environment setup help
3. Story assignment

**10 AM**:
Daily standup - 15 min

**10:15 AM - 5 PM**:
- Start your assigned story
- Use SPRINT1_QUICK_REFERENCE.md
- Follow DAY1_CHECKLIST.md
- Ask questions in Slack

**5 PM**:
- Commit your work
- Push branch
- Update team in Slack

---

## 📊 Project Health Dashboard

### Current Status
- **Phase**: Phase 1 (MVP)
- **Sprint**: Sprint 1 (Week 1)
- **Stories**: 5 assigned
- **Points**: 18 total
- **Team**: 3 people
- **Velocity**: 18-20 pts/week (estimate)

### Key Metrics (Track During Sprint)
- [ ] Build passing: `pnpm build` ✅
- [ ] Tests passing: `pnpm test` ✅
- [ ] Code coverage: > 40% (target)
- [ ] No critical bugs: 0 (target)
- [ ] Story completion: 5/5 (target)

---

## 🎉 Success Looks Like (End of Sprint 1)

### By Friday Dec 11:
- ✅ All 5 stories DONE (moved to Done column)
- ✅ Chat UI works (http://localhost:3000/playground)
- ✅ Backend API working (POST /api/chat)
- ✅ Tests passing (pnpm test)
- ✅ Build succeeds (pnpm build)
- ✅ Code coverage > 40%
- ✅ 0 critical bugs
- ✅ Demo runs smoothly
- ✅ Retrospective completed

### If all above true: **Sprint 1 SUCCESSFUL!** 🎉

---

## 📚 Quick Reference

| Need | Document |
|------|----------|
| What to build? | docs/PRD.md |
| How to build it? | docs/ARCHITECTURE.md |
| What's my story? | docs/USER_STORIES.md |
| Implementation details? | docs/TECH_SPEC.md |
| Sprint plan? | docs/SPRINT_PLAN_PHASE1.md |
| First day guide? | DAY1_CHECKLIST.md |
| Code skeleton? | docs/SPRINT1_KICKOFF.md |
| Quick tips? | SPRINT1_QUICK_REFERENCE.md |
| Find docs? | docs/INDEX.md |

---

## 🚀 Ready to Start?

1. **Setup environment** (15 min) - See "Get Up and Running" above
2. **Read your docs** (30 min) - Based on your role
3. **First standup** (10 AM) - See you there!
4. **Start coding** (10:15 AM) - Let's build!

---

## 🎓 Learning Resources

### Getting Familiar with Tech Stack

**Next.js 16**:
- https://nextjs.org/docs
- Focus on: App Router, Components, Hooks, API Routes

**Fastify**:
- https://www.fastify.io/docs/latest/
- Focus on: Getting Started, Routes, Plugins

**TypeScript**:
- https://www.typescriptlang.org/docs/
- Focus on: Basic Types, Interfaces, Generics

**Tailwind CSS**:
- https://tailwindcss.com/docs
- Focus on: Utility-First, Responsive Design, Components

**React Hooks**:
- https://react.dev/reference/react
- Focus on: useState, useEffect, useCallback, useRef

### Project-Specific

- All links in docs/
- Code comments throughout codebase
- Ask teammates in Slack
- Pair programming sessions

---

## 🎬 Let's Go!

**Welcome to the team!** 🎉

You're about to help build an amazing product.

**Next step**: Setup your environment and see you at 10 AM standup!

**Questions?** Ask now in Slack!

---

**Version**: 1.0
**Last Updated**: 2025-12-05
**Owner**: Engineering Lead
**Status**: 🟢 ACTIVE

**Good luck! Build fast, have fun!** 🚀

---
