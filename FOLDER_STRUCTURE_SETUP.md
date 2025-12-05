# Folder Structure Setup Guide
## Sprint 1 - Create These Folders & Files

**Purpose**: Exact file structure needed for Sprint 1 implementation

---

## 📁 Frontend Folder Structure (apps/web)

### Already Exists
```
apps/web/
├── app/                           (✅ exists)
│   ├── layout.tsx
│   └── page.tsx
├── public/                        (✅ exists)
├── components/                    (✅ exists)
├── lib/                          (✅ exists)
├── styles/                       (✅ exists)
├── package.json                  (✅ exists)
└── tsconfig.json                 (✅ exists)
```

### Create These (Sprint 1)

#### Step 1: Create Playground Page & Route
```
apps/web/app/playground/
├── page.tsx                       ← CREATE (E1.S1)
└── layout.tsx                     ← CREATE (optional)
```

**Command**:
```bash
mkdir -p apps/web/app/playground
```

**Files to create**:
```typescript
// apps/web/app/playground/page.tsx
// Copy skeleton from SPRINT1_KICKOFF.md
```

---

#### Step 2: Create Chat Components
```
apps/web/components/chat/
├── ChatInterface.tsx              ← CREATE (E1.S1)
├── MessageWithComponent.tsx       ← CREATE (E1.S2)
├── InputField.tsx                ← CREATE (optional sub-component)
├── TypingIndicator.tsx           ← CREATE (loading indicator)
└── index.ts                       ← CREATE (exports)
```

**Command**:
```bash
mkdir -p apps/web/components/chat
```

**Files to create**:
```typescript
// apps/web/components/chat/ChatInterface.tsx
// Copy skeleton from SPRINT1_KICKOFF.md

// apps/web/components/chat/MessageWithComponent.tsx
// Copy skeleton from SPRINT1_KICKOFF.md

// apps/web/components/chat/TypingIndicator.tsx
// Simple loading dots component

// apps/web/components/chat/index.ts
export { ChatInterface } from './ChatInterface';
export { MessageWithComponent } from './MessageWithComponent';
export { TypingIndicator } from './TypingIndicator';
```

---

#### Step 3: Create Hooks
```
apps/web/hooks/
├── useDualStreamUI.ts             ← CREATE (E1.S4)
└── index.ts                       ← CREATE (exports)
```

**Command**:
```bash
mkdir -p apps/web/hooks
```

**Files to create**:
```typescript
// apps/web/hooks/useDualStreamUI.ts
// Copy skeleton from SPRINT1_KICKOFF.md

// apps/web/hooks/index.ts
export { useDualStreamUI } from './useDualStreamUI';
```

---

#### Step 4: Create Library Files
```
apps/web/lib/
├── api-client.ts                  ← CREATE (E1.S4)
├── types.ts                       ← CREATE (E1.S4)
└── index.ts                       ← CREATE (optional)
```

**Command**: (should exist, just add files)
```bash
# lib folder likely exists already
touch apps/web/lib/api-client.ts
touch apps/web/lib/types.ts
```

**Files to create**:
```typescript
// apps/web/lib/types.ts
// Copy skeleton from SPRINT1_KICKOFF.md

// apps/web/lib/api-client.ts
// Copy skeleton from SPRINT1_KICKOFF.md
```

---

#### Step 5: Create API Route (if needed for proxy)
```
apps/web/app/api/
├── chat/
│   └── route.ts                   ← CREATE (optional proxy)
```

**Command**:
```bash
mkdir -p apps/web/app/api/chat
```

---

### Frontend Complete Structure (After Sprint 1)

```
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── playground/               (✅ new)
│   │   └── page.tsx
│   └── api/
│       └── chat/
│           └── route.ts          (optional)
├── components/
│   ├── chat/                     (✅ new)
│   │   ├── ChatInterface.tsx
│   │   ├── MessageWithComponent.tsx
│   │   ├── InputField.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── index.ts
│   └── generative/               (keep existing)
├── hooks/                        (✅ new)
│   ├── useDualStreamUI.ts
│   └── index.ts
├── lib/                          (✅ add to existing)
│   ├── api-client.ts
│   ├── types.ts
│   └── index.ts
├── styles/
├── public/
├── package.json
└── tsconfig.json
```

---

## 🔧 Backend Folder Structure (packages/middleware)

### Already Exists
```
packages/middleware/
├── src/
│   └── (empty or partial)
├── package.json                   (✅ exists)
└── tsconfig.json                  (✅ exists)
```

### Create These (Sprint 1)

#### Step 1: Create Core Server Files
```
packages/middleware/src/
├── server.ts                      ← CREATE (Backend Setup)
├── index.ts                       ← CREATE (Backend Setup)
└── logger.ts                      ← CREATE (optional)
```

**Command**:
```bash
mkdir -p packages/middleware/src
```

**Files to create**:
```typescript
// packages/middleware/src/server.ts
// Copy skeleton from SPRINT1_KICKOFF.md

// packages/middleware/src/index.ts
// Copy skeleton from SPRINT1_KICKOFF.md
```

---

#### Step 2: Create Types Folder
```
packages/middleware/src/types/
├── core.types.ts                  ← CREATE (E1.S3)
├── component-schemas.ts           ← CREATE (Phase 2+)
├── component-validators.ts        ← CREATE (Phase 2+)
└── index.ts                       ← CREATE (exports)
```

**Command**:
```bash
mkdir -p packages/middleware/src/types
```

**Files to create**:
```typescript
// packages/middleware/src/types/core.types.ts
// Copy skeleton from SPRINT1_KICKOFF.md

// packages/middleware/src/types/index.ts
export * from './core.types';
```

---

#### Step 3: Create Services Folder
```
packages/middleware/src/services/
├── session-management.service.ts  ← CREATE (E1.S3)
├── llm-factory.ts                 ← CREATE (Backend Setup)
└── index.ts                       ← CREATE (exports)
```

**Command**:
```bash
mkdir -p packages/middleware/src/services
```

**Files to create**:
```typescript
// packages/middleware/src/services/session-management.service.ts
// Copy skeleton from SPRINT1_KICKOFF.md

// packages/middleware/src/services/llm-factory.ts
// LLM provider factory (create empty for now)

// packages/middleware/src/services/index.ts
export { SessionManagementService } from './session-management.service';
export { LLMFactory } from './llm-factory';
```

---

#### Step 4: Create Storage Folder
```
packages/middleware/src/storage/
├── InMemorySessionStore.ts        ← CREATE (E1.S3)
├── types.ts                       ← CREATE (Store types)
└── index.ts                       ← CREATE (exports)
```

**Command**:
```bash
mkdir -p packages/middleware/src/storage
```

**Files to create**:
```typescript
// packages/middleware/src/storage/InMemorySessionStore.ts
// In-memory implementation using Map

// packages/middleware/src/storage/types.ts
// ISessionStore interface

// packages/middleware/src/storage/index.ts
export { InMemorySessionStore } from './InMemorySessionStore';
export type { ISessionStore } from './types';
```

---

#### Step 5: Create Middleware Folder
```
packages/middleware/src/middleware/
├── index.ts                       ← CREATE (middleware setup)
```

**Command**:
```bash
mkdir -p packages/middleware/src/middleware
```

---

#### Step 6: Create Tests Folder
```
packages/middleware/src/__tests__/
├── setup.ts                       ← CREATE (test setup)
├── session-management.test.ts     ← CREATE (E1.S3 tests)
├── server.test.ts                 ← CREATE (Backend tests)
└── integration.test.ts            ← CREATE (E2E tests)
```

**Command**:
```bash
mkdir -p packages/middleware/src/__tests__
```

---

### Backend Complete Structure (After Sprint 1)

```
packages/middleware/
├── src/
│   ├── server.ts                  (✅ new)
│   ├── index.ts                   (✅ new)
│   ├── logger.ts                  (✅ new)
│   ├── types/                     (✅ new)
│   │   ├── core.types.ts
│   │   └── index.ts
│   ├── services/                  (✅ new)
│   │   ├── session-management.service.ts
│   │   ├── llm-factory.ts
│   │   └── index.ts
│   ├── storage/                   (✅ new)
│   │   ├── InMemorySessionStore.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── middleware/                (✅ new)
│   │   └── index.ts
│   └── __tests__/                 (✅ new)
│       ├── setup.ts
│       ├── session-management.test.ts
│       ├── server.test.ts
│       └── integration.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts               (might need to create)
```

---

## 📝 Root Level Files

### Create These in Project Root

```
all-in-one-chat/
├── GETTING_STARTED.md             (✅ created)
├── SPRINT1_QUICK_REFERENCE.md     (✅ created)
├── SPRINT1_KICKOFF.md             (✅ created)
├── SPRINT1_BOARD.md               (✅ created)
├── DAY1_CHECKLIST.md              (✅ created)
├── GIT_WORKFLOW.md                (✅ created)
├── FOLDER_STRUCTURE_SETUP.md      (✅ this file)
└── .env                           ← CREATE (manually)
```

**.env file**:
```bash
# Create in project root
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
GEMINI_API_KEY=test_key_for_now
```

---

## 🚀 Setup Script (Optional)

If you want to create all folders at once:

```bash
#!/bin/bash
# Run from project root

# Frontend folders
mkdir -p apps/web/app/playground
mkdir -p apps/web/components/chat
mkdir -p apps/web/hooks
mkdir -p apps/web/lib

# Backend folders
mkdir -p packages/middleware/src/types
mkdir -p packages/middleware/src/services
mkdir -p packages/middleware/src/storage
mkdir -p packages/middleware/src/middleware
mkdir -p packages/middleware/src/__tests__

# GitHub folders
mkdir -p .github

echo "✅ All folders created!"
```

Save as `setup_folders.sh`, then:
```bash
chmod +x setup_folders.sh
./setup_folders.sh
```

---

## 📋 File Creation Checklist

### Frontend (E1.S1 + E1.S2 + E1.S4)

**E1.S1 - Chat Interface**:
- [ ] `apps/web/app/playground/page.tsx`
- [ ] `apps/web/components/chat/ChatInterface.tsx`
- [ ] `apps/web/components/chat/TypingIndicator.tsx`
- [ ] `apps/web/components/chat/index.ts`

**E1.S2 - Messages**:
- [ ] `apps/web/components/chat/MessageWithComponent.tsx`

**E1.S4 - API Client**:
- [ ] `apps/web/lib/api-client.ts`
- [ ] `apps/web/lib/types.ts`
- [ ] `apps/web/hooks/useDualStreamUI.ts`
- [ ] `apps/web/hooks/index.ts`

---

### Backend (E1.S3 + Backend Setup)

**Backend Setup**:
- [ ] `packages/middleware/src/server.ts`
- [ ] `packages/middleware/src/index.ts`
- [ ] `packages/middleware/src/middleware/index.ts`

**E1.S3 - Session Management**:
- [ ] `packages/middleware/src/types/core.types.ts`
- [ ] `packages/middleware/src/services/session-management.service.ts`
- [ ] `packages/middleware/src/services/index.ts`
- [ ] `packages/middleware/src/storage/InMemorySessionStore.ts`
- [ ] `packages/middleware/src/storage/types.ts`
- [ ] `packages/middleware/src/storage/index.ts`

**LLM Support**:
- [ ] `packages/middleware/src/services/llm-factory.ts`

---

### Tests & Config

- [ ] `packages/middleware/src/__tests__/setup.ts`
- [ ] `packages/middleware/src/__tests__/session-management.test.ts`
- [ ] `packages/middleware/src/__tests__/server.test.ts`
- [ ] `packages/middleware/vitest.config.ts` (if doesn't exist)

---

### Root Config

- [ ] `.env` (create manually with values above)
- [ ] `.github/pull_request_template.md` (✅ created)

---

## ✅ Verification After Setup

After creating all folders & files:

```bash
# Verify frontend structure
ls -R apps/web/app/playground/
ls -R apps/web/components/chat/
ls -R apps/web/hooks/
ls apps/web/lib/

# Verify backend structure
ls -R packages/middleware/src/

# Verify dev servers start
pnpm dev

# Check both are running
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## 🎯 Implementation Order

### **Day 1 (Today) - Setup Folders**

1. Create all folders (use script above)
2. Copy file skeletons from SPRINT1_KICKOFF.md
3. Verify structure matches above

### **Day 1-2 - Implement Files**

**Frontend (E1.S1)**:
1. Implement ChatInterface.tsx
2. Implement /playground route
3. Add tests
4. Create PR

**Backend (Backend Setup)**:
1. Implement server.ts
2. Add /health endpoint
3. Verify starts on :3001
4. Create PR

**Both (E1.S3 + E1.S4)**:
1. Implement SessionManagementService
2. Implement api-client.ts
3. Integration test
4. Create PR

---

## 🚨 Common Issues

### "Folder doesn't exist"
```bash
# Create it
mkdir -p path/to/folder
```

### "File not found when importing"
```bash
# Check path is correct in import
import { ChatInterface } from '@/components/chat'
                           ↑ absolute path from root

# Verify tsconfig.json has paths configured
# Look for "paths": { "@/*": ["./"]  }
```

### "TypeScript errors after creating files"
```bash
# Restart TypeScript server in IDE
# Or run: pnpm build
```

---

**Folder Structure Version**: 1.0
**Created**: 2025-12-05
**Owner**: Engineering Lead

**Let's start creating! 🚀**
