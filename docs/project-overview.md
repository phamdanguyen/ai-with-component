# All-in-One Chat - Project Overview

## Project Summary

**All-in-One Chat** là một nền tảng Generative UI AI-powered cho phép tạo các thành phần UI tương tác thay vì chỉ trả về văn bản.

- **Type**: Monorepo Full-Stack
- **Primary Purpose**: AI-powered interactive component generation platform
- **Architecture**: 2-Request dual-stream (text summary + UI components)
- **Status**: Early development (Phase 1)

## Project Classification

**Repository Type**: Monorepo (Turborepo + PNPM Workspace)

### Parts

1. **Frontend Application** (`apps/web/`)
   - Type: Web (Next.js)
   - Purpose: AI chat interface with generative UI component rendering
   - Tech Stack: Next.js 16, React 19, TypeScript, TailwindCSS

2. **Backend Middleware** (`packages/middleware/`)
   - Type: Backend (Node.js API)
   - Purpose: Fastify middleware for LLM integration and component generation
   - Tech Stack: Fastify, TypeScript, Google Generative AI, Zod validation

3. **Shared Libraries**
   - `packages/react-sdk/` - React SDK for GenUI rendering
   - `packages/ui-components/` - Reusable UI component library
   - `packages/types/` - Shared TypeScript type definitions

## Technology Stack

### Core Infrastructure
- **Monorepo**: Turborepo + PNPM workspace
- **Node.js Version**: >=18.0.0
- **Language**: TypeScript ES2020
- **Build Tool**: Turborepo with parallel execution

### Frontend Stack
- **Framework**: Next.js 16.0.6 (React meta-framework)
- **UI Library**: React 19.2.0
- **Styling**: TailwindCSS 4 + PostCSS
- **Components**: Recharts (charting), Lucide React (icons), Radix UI (headless components)
- **Type Safety**: TypeScript 5
- **Linting**: ESLint 9

### Backend Stack
- **Web Server**: Fastify 4.28.1 (Node.js HTTP framework)
- **Language**: TypeScript 5.9.3
- **AI Integration**: Google Generative AI (@google/generative-ai 0.21.0)
- **Validation**: Zod 3.23.8 (runtime schema validation)
- **Logging**: Pino (structured logging) + Pino Pretty
- **Caching**: LRU Cache 10.4.3
- **Testing**: Vitest 2.1.8
- **Development**: TSX for fast TypeScript execution

### Shared Dependencies
- **Package Manager**: PNPM 8.15.0 (workspace management)
- **Build Orchestration**: Turbo 1.13.0
- **Type Checking**: TypeScript 5.x across all packages

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Repository Structure** | Monorepo with 2 main parts + 3 shared packages |
| **Development Server** | `pnpm dev` (Turborepo parallel execution) |
| **Build Command** | `pnpm build` (generates optimized builds) |
| **Test Command** | `pnpm test` (runs test suites via Vitest) |
| **Linting** | `pnpm lint` (ESLint across all packages) |
| **Node Version** | >=18.0.0 |
| **Package Manager** | pnpm >=8.0.0 |

## Architecture Pattern

### Frontend Architecture
- **Type**: Server-Side Rendered (SSR) + Static Generation
- **Pattern**: Component-based with Next.js App Router
- **Data Flow**: Client → Fastify Backend → Google Gemini API → Component Rendering

### Backend Architecture
- **Type**: Microservice/Middleware API
- **Pattern**: Fastify middleware pipeline
- **Data Flow**: Request → Validation (Zod) → Gemini LLM → Response

### Integration
- **Type**: REST API (HTTP)
- **Protocol**: JSON over HTTP
- **Caching**: LRU cache for AI response optimization

## Development Roadmap

- [x] Phase 1: Setup monorepo structure
- [ ] Phase 1: Implement 2-request architecture
- [ ] Phase 1: Create 2 components (Card + Chart)
- [ ] Phase 2: Complete 7 component types
- [ ] Phase 3: Authentication & database
- [ ] Phase 4: Odoo integration (optional)
- [ ] Phase 5: Production deployment

## Getting Started

### Prerequisites
```bash
Node.js >= 18.0.0
pnpm >= 8.0.0
```

### Installation
```bash
# Install pnpm globally (if needed)
npm install -g pnpm@8.15.0

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Available Scripts
- `pnpm dev` - Start dev servers for all packages
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean all builds and dependencies

## Key Features

- **2-Request Dual-Stream Architecture**: Parallel text summary + UI component generation
- **Progressive Disclosure UI**: Text always visible, components collapsible
- **7 GenUI Components**: Chart, Table, Card, Form, List, Slides, Report
- **SOLID Architecture**: Service-based design from Odoo AI Chat patterns
- **Multi-Provider AI**: Extensible (Gemini now, OpenAI/Claude possible)
- **Type Safety**: Full TypeScript for better developer experience

## Environment Setup

See `.env` files in respective packages for configuration:

**Frontend** (`apps/web/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Backend** (`packages/middleware/.env`):
```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

## Next Steps

1. Review individual part documentation:
   - [Frontend Architecture](./architecture-web.md)
   - [Backend Architecture](./architecture-middleware.md)
2. Check [Development Guide](./development-guide.md) for setup instructions
3. Review [Source Tree Analysis](./source-tree-analysis.md) for codebase structure
4. Reference [Integration Architecture](./integration-architecture.md) for API contracts

---

**Generated**: 2025-12-04 by BMad Document Project Workflow
**Scan Level**: Quick (pattern-based analysis)
