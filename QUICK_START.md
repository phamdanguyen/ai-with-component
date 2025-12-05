# Quick Start Guide - 5 Minutes to Running GenUI Platform

Get the GenUI Platform up and running in minutes with this quick start guide.

---

## ⚡ 2-Minute Development Setup

### 1. Prerequisites Check
```bash
node --version     # Should be >= 18.0.0
pnpm --version     # Should be >= 8.0.0
```

### 2. Install & Start
```bash
# Clone/navigate to project
cd all-in-one-chat

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3002/playground
- **Backend**: http://localhost:3001/api

**That's it!** The chat interface is now live.

---

## 🐳 3-Minute Docker Setup

### 1. Prerequisites Check
```bash
docker --version           # Should be >= 20.10
docker-compose --version   # Should be >= 2.0
```

### 2. Build & Run
```bash
# Navigate to project
cd all-in-one-chat

# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

### 3. Access the Application
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001/api

Done! Services running in containers.

---

## 🎯 Using the Chat Interface

### Start a Conversation
1. Open http://localhost:3002/playground (or http://localhost:8080 for Docker)
2. Type a message in the input field
3. Press Enter or click Send

### Example Prompts
- "Show me a chart with sales data"
- "Create a table with user information"
- "Generate a form for contact information"
- "Display a summary card"

### Features
- **New Chat Button**: Start fresh conversation (appears after first message)
- **Collapsible Components**: Click to expand/collapse generated UI components
- **Session Tracking**: Conversation automatically saved with session ID

---

## 🔧 Development Workflow

### Start Individual Services
```bash
# Frontend only (from apps/web)
cd apps/web && pnpm dev

# Backend only (from packages/middleware)
cd packages/middleware && pnpm dev
```

### Build All Packages
```bash
pnpm build
```

### Run Tests
```bash
pnpm test
```

### Linting & Formatting
```bash
pnpm lint
```

---

## 🚀 Common Commands Reference

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start all services (dev mode) |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Run linter |
| `docker-compose up -d` | Start Docker services |
| `docker-compose down` | Stop Docker services |
| `docker-compose logs -f` | View live logs |

---

## 📋 Project Structure

```
all-in-one-chat/
├── apps/web/              # Frontend (Next.js)
├── packages/middleware/   # Backend (Fastify)
└── docker-compose.yml     # Docker orchestration
```

---

## 🔍 Debugging

### Port Issues?
```bash
# Check if ports are in use
# Windows:
netstat -ano | findstr :3002

# macOS/Linux:
lsof -i :3002
```

### Clear Everything & Restart
```bash
# Development
rm -rf apps/web/.next packages/middleware/dist node_modules
pnpm install && pnpm dev

# Docker
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### View Backend Logs
```bash
# Development
cd packages/middleware && pnpm dev

# Docker
docker-compose logs -f middleware
```

### Test API Directly
```bash
# Health check
curl http://localhost:3001/health

# Send chat message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}'
```

---

## 🌍 Environment Variables

The project works out-of-the-box without environment variables (uses mock mode). To use real Gemini API:

### Create `.env` File
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### For Docker
```bash
# Create .env in project root, docker-compose will load it
GEMINI_API_KEY=your_key_here
```

---

## 📚 Next Steps

- **Chat Interface**: Try various prompts to generate different component types
- **Backend Exploration**: Review `packages/middleware/src/` for service architecture
- **Frontend Components**: Check `apps/web/components/chat/` for UI implementation
- **Docker Deep-Dive**: See `DOCKER_SETUP.md` for detailed container guide
- **Full Documentation**: Read `README.md` for comprehensive overview

---

## 📖 Key Documentation Files

- **`README.md`** - Main overview and features
- **`DOCKER_SETUP.md`** - Detailed Docker guide
- **`SPRINT_1_SUMMARY.md`** - Sprint 1 completion details
- **`ARCHITECTURE.md`** - System design and technical details

---

## ✅ Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "Port already in use" | Kill process: `taskkill /PID <pid> /F` |
| "Module not found" | Run `pnpm install` |
| "Cannot find .next" | Run `pnpm build` first |
| "Backend not responding" | Check `pnpm dev` logs for errors |
| "Docker build fails" | Try `docker-compose build --no-cache` |

---

## 🎓 Tips & Tricks

### Live Reload
- Frontend: Automatic with Next.js dev server
- Backend: Automatic with tsx watcher
- Changes save and reflect immediately

### Session Persistence
- Sessions tracked by session ID
- Each new chat gets unique session
- Conversation history preserved for duration of session

### Mock Mode
- Works without Gemini API key
- Generates realistic sample responses
- Perfect for development and testing

### Component Types
The platform supports 7 component types:
- Chart (line, bar, pie, area, scatter, radar)
- Table (sortable, paginated)
- Card (summary cards)
- Form (multi-field)
- List (searchable)
- Slides (carousel)
- Report (formatted)

---

## 🚀 Ready to Deploy?

When ready for production:

1. **Docker Build**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Environment Setup**:
   - Set `GEMINI_API_KEY` in `.env`
   - Configure `CORS_ORIGIN` for your domain
   - Set `NODE_ENV=production`

3. **Access**:
   - Frontend: http://localhost:8080
   - API: http://localhost:3001

See `DOCKER_SETUP.md` for production best practices.

---

## 💡 Need Help?

- **Documentation**: See `README.md` and other `.md` files
- **Service Structure**: Review `packages/middleware/src/services/`
- **Component Examples**: Check `apps/web/components/chat/`
- **Type Definitions**: Look in `packages/middleware/src/types/`

---

**Happy coding!** 🚀

**Last Updated**: December 5, 2025
