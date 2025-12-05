# All-in-One Chat - Project Documentation Index

> **Master entry point for AI-assisted development of the All-in-One Chat Generative UI platform**

## 🎯 Quick Navigation

This documentation provides comprehensive guidance for developers working on the All-in-One Chat project. Start here to understand the project structure, architecture, and development workflow.

### For New Developers 👶
1. **Start here**: [Project Overview](./project-overview.md)
2. **Understand structure**: [Source Tree Analysis](./source-tree-analysis.md)
3. **Set up environment**: [Development Guide](./development-guide.md)
4. **Run the project**: `pnpm dev`

### For Architecture Decisions 🏗️
1. **Full-stack flow**: [Integration Architecture](./integration-architecture.md)
2. **Frontend details**: [Architecture - Web](./architecture-web.md)
3. **Backend details**: [Architecture - Middleware](./architecture-middleware.md)

### For Implementation 💻
1. **Setup**: [Development Guide](./development-guide.md)
2. **Frontend code**: Review `apps/web/src/`
3. **Backend code**: Review `packages/middleware/src/`
4. **API Contracts**: [Integration Architecture](./integration-architecture.md)

---

## 📚 Project Documentation

### Overview & Planning

- **[Project Overview](./project-overview.md)** _(Complete)_
  - Project summary and classification
  - Technology stack breakdown
  - Quick reference guide
  - Getting started instructions

- **[Source Tree Analysis](./source-tree-analysis.md)** _(Complete)_
  - Directory structure with annotations
  - Critical folders explained
  - Entry points documented
  - Integration points mapped

### Architecture Documentation

- **[Architecture - Frontend (Web)](./architecture-web.md)** _(Complete)_
  - Next.js application structure
  - Component organization
  - Routing and page structure
  - API client layer
  - Styling with TailwindCSS
  - Deployment configuration

- **[Architecture - Backend (Middleware)](./architecture-middleware.md)** _(Complete)_
  - Fastify HTTP server setup
  - Service layer organization
  - Route handlers
  - Gemini AI integration
  - Validation with Zod
  - Caching strategy
  - Error handling

- **[Integration Architecture](./integration-architecture.md)** _(Complete)_
  - Multi-part communication
  - API endpoints and contracts
  - Request/response schemas
  - Data flow examples
  - Shared packages integration
  - Error handling patterns
  - Deployment topology

### Development & Operations

- **[Development Guide](./development-guide.md)** _(Complete)_
  - Prerequisites and installation
  - Development commands
  - Build and test procedures
  - Local environment setup
  - Common development tasks
  - Troubleshooting guide
  - Git workflow

---

## 🏗️ Project Structure at a Glance

```
all-in-one-chat (Monorepo)
├── apps/web/                 # Next.js Frontend Application
│   └── src/                  # Frontend source code
├── packages/
│   ├── middleware/           # Fastify Backend API
│   ├── react-sdk/            # React SDK for GenUI components
│   ├── ui-components/        # Shared UI component library
│   └── types/                # Shared TypeScript types
├── docs/                     # Documentation (you are here)
└── [config files]            # Turborepo, PNPM, TypeScript configs
```

**Full structure**: See [Source Tree Analysis](./source-tree-analysis.md)

---

## 🚀 Getting Started (30 seconds)

### Prerequisites
- Node.js >=18.0.0
- pnpm >=8.0.0
- Google Gemini API key

### Quick Start
```bash
# 1. Clone and install
git clone <repository>
cd all-in-one-chat
pnpm install

# 2. Set up environment
echo "GEMINI_API_KEY=your_key_here" > packages/middleware/.env

# 3. Start development
pnpm dev

# 4. Open browser
# Frontend: http://localhost:3000
# API: http://localhost:3000/api/...
```

**Detailed setup**: See [Development Guide](./development-guide.md)

---

## 📊 Technology Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Monorepo** | Turborepo + PNPM workspace |
| **Frontend** | Next.js 16, React 19, TypeScript 5, TailwindCSS 4 |
| **Backend** | Fastify 4.28, TypeScript 5.9, Google Gemini AI |
| **Validation** | Zod 3.23 (runtime schema validation) |
| **Logging** | Pino 9.5 (structured logging) |
| **Caching** | LRU Cache 10.4 (in-memory) |
| **Testing** | Vitest 2.1 (unit/integration) |
| **Build** | TypeScript, ESLint 9 |

**Full tech details**: See [Project Overview](./project-overview.md)

---

## 🔄 Development Workflow

### Common Commands

```bash
# Development
pnpm dev              # Start all dev servers (Next.js + Fastify)
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm clean            # Clean builds and node_modules

# Frontend only
cd apps/web && pnpm dev

# Backend only
cd packages/middleware && pnpm dev
```

**More commands**: See [Development Guide](./development-guide.md)

---

## 🔌 API Integration Guide

### Main Endpoint: Chat Processing

**POST** `/api/chat`

```json
Request: {
  "message": "Create a bar chart with Q1-Q4 data",
  "sessionId": "user-session-uuid",
  "context": []
}

Response: {
  "text_response": "Here's your Q1-Q4 data chart...",
  "ui_component": {
    "type": "chart",
    "spec": { /* component configuration */ }
  }
}
```

**All endpoints**: See [Integration Architecture](./integration-architecture.md)

---

## 📁 Key File Locations

| Purpose | Location |
|---------|----------|
| Frontend entry | `apps/web/src/app/` or `apps/web/src/pages/` |
| Backend entry | `packages/middleware/src/server.ts` |
| Frontend components | `apps/web/src/components/` |
| Backend routes | `packages/middleware/src/routes/` |
| Backend services | `packages/middleware/src/services/` |
| API schemas | `packages/middleware/src/schemas/` |
| Shared types | `packages/types/src/` |
| UI components | `packages/ui-components/src/` |

**Full structure**: See [Source Tree Analysis](./source-tree-analysis.md)

---

## 💡 Key Architectural Concepts

### Two-Request Architecture

The platform uses a dual-stream approach:

1. **Request 1** (Gemini Flash): Generate text response (fast, cost-effective)
2. **Request 2** (Gemini Pro): Generate UI component specification (capable)
3. **Combine**: Return both text and interactive component

### Progressive Disclosure UI

- Text response always visible
- Components collapsible/expandable
- User can focus on text or component

### Caching Strategy

- **Cache Key**: Hash of (message + sessionId + options)
- **TTL**: 1 hour
- **Hit Rate**: ~30-40% for typical usage
- **Result**: Reduced API calls and latency

### Component Types (7 GenUI Components)

- Chart (bar, line, pie, area, etc.)
- Table (sortable, filterable)
- Card (summary, metric displays)
- Form (input, validation)
- List (scrollable item lists)
- Slides (carousel)
- Report (multi-section layouts)

---

## 🔐 Security Notes

- **Input Validation**: All requests validated with Zod
- **API Keys**: Keep `GEMINI_API_KEY` in `.env` (never commit)
- **CORS**: Configured for development and production
- **Authentication**: TBD for future versions

---

## 📈 Performance Targets

- **First Request**: 2-5 seconds (includes LLM API call)
- **Cached Request**: <5 milliseconds
- **Average Latency**: ~1.5 seconds
- **Concurrent Users**: 1000+
- **Memory**: ~200MB baseline

---

## 🧪 Testing

### Run Tests
```bash
pnpm test              # All tests
pnpm test --watch     # Watch mode
pnpm test --coverage  # Coverage report
```

### Test Structure
- **Frontend**: `apps/web/__tests__/`
- **Backend**: `packages/middleware/src/**/*.test.ts`
- **Types**: `packages/types/src/**/*.test.ts`

---

## 🚢 Deployment

### Frontend
- Deployable to: Vercel, Netlify, AWS Amplify, etc.
- Environment: Node.js runtime
- Build: `pnpm build` → `.next/` directory

### Backend
- Deployable to: AWS ECS, Google Cloud Run, Heroku, etc.
- Environment: Node.js >=18
- Build: `pnpm build` → `dist/` directory
- Docker: Dockerfile available

### Environment Variables
See [Development Guide](./development-guide.md) for complete setup

---

## ❓ FAQ

### Q: How do I start developing?
**A:** Run `pnpm install` then `pnpm dev`. See [Development Guide](./development-guide.md).

### Q: How do frontend and backend communicate?
**A:** Via HTTP REST API. See [Integration Architecture](./integration-architecture.md).

### Q: Where do I add a new component?
**A:** Create in `packages/ui-components/src/`, then use in `apps/web/src/components/`.

### Q: How do I add a new API endpoint?
**A:** Create route file in `packages/middleware/src/routes/`, then register in `server.ts`.

### Q: How is the monorepo structured?
**A:** Using Turborepo + PNPM workspace. See [Source Tree Analysis](./source-tree-analysis.md).

### Q: How do I troubleshoot issues?
**A:** See [Development Guide - Troubleshooting](./development-guide.md#troubleshooting).

---

## 📞 Support & Next Steps

### For Questions
1. Check relevant documentation (see links above)
2. Review source code in `apps/` and `packages/`
3. Check `README.md` in project root
4. Open an issue on GitHub

### Ready to Develop?

1. ✅ Environment set up (see [Development Guide](./development-guide.md))
2. ✅ Understand architecture (see relevant architecture docs)
3. ✅ Review integration points (see [Integration Architecture](./integration-architecture.md))
4. 🚀 Start coding!

---

## 📋 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Project Overview | ✅ Complete | 2025-12-04 |
| Source Tree Analysis | ✅ Complete | 2025-12-04 |
| Architecture - Web | ✅ Complete | 2025-12-04 |
| Architecture - Middleware | ✅ Complete | 2025-12-04 |
| Integration Architecture | ✅ Complete | 2025-12-04 |
| Development Guide | ✅ Complete | 2025-12-04 |

---

## 🎓 Learning Paths

### Path 1: Frontend Development
1. [Project Overview](./project-overview.md) - Understand the project
2. [Architecture - Web](./architecture-web.md) - Learn frontend architecture
3. [Development Guide](./development-guide.md) - Set up environment
4. Start in `apps/web/src/`

### Path 2: Backend Development
1. [Project Overview](./project-overview.md) - Understand the project
2. [Architecture - Middleware](./architecture-middleware.md) - Learn backend architecture
3. [Development Guide](./development-guide.md) - Set up environment
4. Start in `packages/middleware/src/`

### Path 3: Full-Stack Development
1. [Project Overview](./project-overview.md)
2. [Integration Architecture](./integration-architecture.md)
3. [Architecture - Web](./architecture-web.md) + [Architecture - Middleware](./architecture-middleware.md)
4. [Development Guide](./development-guide.md)
5. Explore both `apps/web/src/` and `packages/middleware/src/`

---

## 📝 Generated By

**BMad Document Project Workflow** v1.2.0
**Scan Level**: Quick (pattern-based analysis)
**Generation Date**: 2025-12-04
**Project Type**: Monorepo (2 main parts + 3 shared packages)

---

**Ready to develop?** Start with [Development Guide](./development-guide.md) 🚀
