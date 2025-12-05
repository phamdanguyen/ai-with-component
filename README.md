# GenUI Platform - AI-Powered Interactive Components

[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-blue)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4+-red)](https://www.fastify.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 📋 Overview

GenUI Platform is a **Generative UI system** that transforms natural language queries into interactive React components. Users chat with an AI assistant that generates text summaries AND interactive components (charts, tables, forms) in real-time.

### ✨ Key Features
- 💬 **Chat Interface**: Intuitive UI for conversational interactions
- 🎨 **Dynamic Components**: Auto-generated charts, tables, cards, forms, lists, slides, reports
- 🔄 **Dual-Stream Response**: Text + Component generation in parallel
- 📊 **Session Management**: Conversation history & context tracking
- 🚀 **Mock API Mode**: Test without Gemini API key
- 🐳 **Docker Ready**: Production-ready containerization
- ⚡ **Monorepo**: Organized workspace with shared packages

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (optional)

### Development Mode
```bash
# Install dependencies
pnpm install

# Start all services (frontend on 3002, backend on 3001)
pnpm dev

# Access app: http://localhost:3002/playground
```

### Docker Mode
```bash
# Build images
docker-compose build

# Start services (frontend on 8080, backend on 3001)
docker-compose up -d

# Access app: http://localhost:8080
```

---

## 📁 Project Structure

```
all-in-one-chat/
├── apps/web/                    # Next.js Frontend
│   ├── app/playground/          # Chat playground
│   ├── components/chat/         # Chat UI components
│   ├── hooks/useDualStreamUI.ts # Chat state management
│   ├── lib/api-client.ts        # API client
│   └── Dockerfile               # Frontend container
│
├── packages/middleware/         # Fastify Backend
│   ├── src/server.ts            # Main server
│   ├── src/services/            # Core services
│   ├── src/types/               # Type definitions
│   └── Dockerfile               # Backend container
│
├── docker-compose.yml           # Docker orchestration
└── README.md                    # This file
```

---

## 🔧 API Endpoints

### Chat
```
POST /api/chat
Body: { "message": "Show me sales data", "sessionId": "session_123" }
Response: { "success": true, "data": { "textSummary": "...", "componentSpec": {...} } }
```

### Session Management
```
POST   /api/sessions              # Create session
GET    /api/sessions/:id          # Get session
GET    /api/sessions/:id/history  # Get conversation history
DELETE /api/sessions/:id          # Delete session
```

---

## 📊 Sprint 1 Status (COMPLETE ✅)

| Story | Points | Status | Owner |
|-------|--------|--------|-------|
| E1.S1: Chat UI | 5 | ✅ Done | Frontend |
| E1.S2: Message Display | 5 | ✅ Done | Frontend |
| E1.S3: Session Management | 3 | ✅ Done | Backend |
| E1.S4: API Client | 3 | ✅ Done | Full-stack |
| Backend Setup | 2 | ✅ Done | Backend |
| **TOTAL** | **18** | **100%** | - |

---

## 🔑 Environment Variables

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://genui-middleware:3001/api

# Backend
PORT=3001
NODE_ENV=production
GEMINI_API_KEY=your_key_here  # Optional, uses mock if empty
CORS_ORIGIN=*
LOG_LEVEL=info
```

---

## 📚 Component Types

- **Chart**: Line, bar, pie, area, scatter, radar, combo
- **Table**: Sortable, paginated tables with rich formatting
- **Card**: Summary cards with status indicators
- **Form**: Multi-field forms with validation
- **List**: Searchable, filterable lists
- **Slides**: Carousel presentations
- **Report**: Formatted business reports

---

## 🐳 Docker Deployment

Frontend runs on **port 8080**, backend on **3001**:

```bash
# Build and start
docker-compose build
docker-compose up -d

# Check status
docker-compose logs -f

# Cleanup
docker-compose down -v
```

---

## 🔄 Available Commands

```bash
# Development
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm lint             # Run linter
pnpm test             # Run tests
pnpm clean            # Clean build artifacts

# Individual services
cd apps/web && pnpm dev              # Frontend only
cd packages/middleware && pnpm dev   # Backend only
```

---

## 🎯 Next Steps

- **Phase 2**: Real Gemini API integration & streaming
- **Phase 3**: Database persistence & advanced features
- **Phase 4**: Deployment & scaling

---

**Status**: Sprint 1 Complete ✅ | **Version**: 0.1.0 | **Updated**: Dec 5, 2025
