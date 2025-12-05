# Source Tree Analysis

## Project Directory Structure

```
all-in-one-chat/ (Monorepo Root)
├── apps/                           # Applications
│   └── web/                        # Frontend: Next.js Application
│       ├── src/
│       │   ├── app/               # Next.js App Router (entry point: app.ts/page.tsx)
│       │   ├── components/        # React UI components
│       │   ├── pages/             # Route pages
│       │   └── api/               # Frontend API layer (client-side)
│       ├── public/                # Static assets
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.js
│
├── packages/                       # Shared packages
│   ├── middleware/                # Backend: Fastify API Service
│   │   ├── src/
│   │   │   ├── server.ts          # Entry point: HTTP server setup
│   │   │   ├── index.ts           # Module exports
│   │   │   ├── routes/            # API route handlers
│   │   │   ├── services/          # Business logic (LLM service, etc.)
│   │   │   └── middleware/        # Fastify middleware (validation, etc.)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts       # Test configuration
│   │
│   ├── react-sdk/                 # Shared React SDK
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/        # GenUI components (Chart, Table, Card, etc.)
│   │   │   └── hooks/             # React hooks
│   │   └── package.json
│   │
│   ├── ui-components/             # Component Library
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Form/
│   │   │   ├── Table/
│   │   │   ├── Chart/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── types/                      # Shared TypeScript Types
│       ├── src/
│       │   ├── index.ts           # Main type exports
│       │   ├── api.ts             # API request/response types
│       │   ├── components.ts      # Component prop types
│       │   └── models.ts          # Data model types
│       └── package.json
│
├── docs/                           # Documentation (this folder)
│   ├── index.md                   # Master index
│   ├── project-overview.md        # This overview
│   ├── source-tree-analysis.md    # Directory tree
│   ├── architecture-web.md        # Frontend architecture
│   ├── architecture-middleware.md # Backend architecture
│   ├── development-guide.md       # Setup & development
│   ├── integration-architecture.md # Part communication
│   └── project-scan-report.json   # Scan metadata
│
├── .github/                        # GitHub config
│   └── workflows/                 # CI/CD workflows (if present)
│
├── package.json                    # Root monorepo config
├── pnpm-workspace.yaml            # PNPM workspace definition
├── turbo.json                      # Turborepo build orchestration
├── tsconfig.json                  # Root TypeScript config
├── README.md                       # Project README
├── docker-compose.yml             # Docker configuration
├── Makefile                        # Build/dev commands
├── pnpm-lock.yaml                 # Dependency lock file
└── node_modules/                  # Installed dependencies (excluded from scans)
```

## Critical Directories

### Root Level (`/`)
- **`apps/`** - Contains executable applications
  - `web/` - Next.js frontend app (entry point: `pages/` or `app/`)
- **`packages/`** - Reusable libraries shared across apps
  - `middleware/` - Backend API service (entry point: `server.ts`)
  - `react-sdk/` - React component SDK
  - `ui-components/` - Shared UI component library
  - `types/` - Shared type definitions

### Frontend (`apps/web/`)
- **`src/app/`** or **`src/pages/`** - Route definitions (Next.js App Router)
- **`src/components/`** - React components
- **`public/`** - Static assets (CSS, fonts, images)
- **`src/api/`** - API client layer (calls middleware backend)

### Backend (`packages/middleware/`)
- **`src/server.ts`** - HTTP server entry point
- **`src/routes/`** - API endpoint handlers
- **`src/services/`** - Business logic (LLM integration, processing)
- **`src/middleware/`** - Request validation, auth, logging

### Shared (`packages/*/`)
- **`react-sdk/src/components/`** - GenUI components (Chart, Table, Card, Form, List, Slides, Report)
- **`ui-components/src/`** - Base UI components (Button, Input, etc.)
- **`types/src/`** - Type definitions for API contracts and data models

## Integration Points

```
Frontend (Next.js)          Backend (Fastify)            LLM (Google Gemini)
┌─────────────┐           ┌──────────────┐              ┌─────────────┐
│ apps/web    │──HTTP───→ │ middleware/  │──API call──→ │ Gemini API  │
│ React       │◀──JSON───  │ Fastify      │◀──Response─  │             │
└─────────────┘           └──────────────┘              └─────────────┘
        │                         │
        └────────────────────────┴─────→ Shared Types & Components
             packages/react-sdk/
             packages/ui-components/
             packages/types/
```

## Entry Points

### Frontend Entry
- **File**: `apps/web/src/app/page.tsx` (App Router) or `apps/web/src/pages/index.tsx` (Pages Router)
- **Command**: `npm run dev` → Next.js dev server on port 3000

### Backend Entry
- **File**: `packages/middleware/src/server.ts`
- **Command**: `npm run dev` → Fastify HTTP server
- **Default Port**: 3000 (next to frontend)

### Monorepo Entry
- **File**: `package.json` (root)
- **Command**: `pnpm dev` → Runs both frontend & backend via Turborepo

## Key File Patterns

### Configuration Files
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `package.json` - NPM/PNPM metadata
- `vitest.config.ts` - Vitest test configuration
- `turbo.json` - Turborepo pipeline
- `.env` files - Environment variables

### Build Output
- `dist/` - TypeScript compiled output
- `.next/` - Next.js build output
- `coverage/` - Test coverage reports (excluded from analysis)

### Excluded Directories
- `node_modules/` - Dependencies (large, excluded from scans)
- `.git/` - Git history
- `dist/`, `build/`, `.next/` - Build outputs

## File Organization Patterns

### React Components (apps/web/)
```
src/components/
├── Chat/                   # Chat-related components
├── GenUI/                  # GenUI component renderers
├── Layout/                 # Layout components
└── shared/                 # Shared components
```

### API Routes (packages/middleware/)
```
src/routes/
├── api/
│   ├── chat/              # Chat endpoints
│   ├── components/        # Component generation endpoints
│   └── health/            # Health check
└── health.ts             # Liveness probe
```

### Services (packages/middleware/)
```
src/services/
├── geminiService.ts       # Google Gemini integration
├── componentService.ts    # Component generation logic
└── validationService.ts   # Zod-based validation
```

## Summary

- **Total Parts**: 2 main (web + middleware) + 3 shared packages
- **Primary Language**: TypeScript (all parts)
- **Build System**: Turborepo with PNPM workspace
- **Frontend Framework**: Next.js (SSR)
- **Backend Framework**: Fastify (HTTP API)
- **Key Directories**:
  - Frontend: `apps/web/src/`
  - Backend: `packages/middleware/src/`
  - Shared: `packages/*/src/`

---

**Generated**: 2025-12-04 by BMad Document Project Workflow
**Scan Level**: Quick (directory structure + critical folders)
