# Development Guide

## Prerequisites

### Required Software
- **Node.js** >=18.0.0 ([Download](https://nodejs.org/))
  - Verify: `node --version`

- **pnpm** >=8.0.0 ([Install Guide](https://pnpm.io/installation))
  - Install: `npm install -g pnpm@8.15.0`
  - Verify: `pnpm --version`

- **Git** (for version control)
  - Verify: `git --version`

### System Requirements
- **OS**: macOS, Linux, or Windows (with WSL)
- **Disk Space**: 2+ GB (dependencies)
- **RAM**: 4+ GB recommended

### API Keys
- **Google Gemini API Key** ([Get Key](https://console.cloud.google.com/))
  - Required for running backend middleware
  - Free tier available with limited quota

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourname/all-in-one-chat.git
cd all-in-one-chat
```

### Step 2: Install Dependencies
```bash
# Install all dependencies for all packages
pnpm install
```

This command:
- Installs dependencies for root `package.json`
- Installs dependencies for `apps/web/package.json`
- Installs dependencies for `packages/middleware/package.json`
- Installs dependencies for `packages/react-sdk/package.json`
- Installs dependencies for `packages/ui-components/package.json`
- Installs dependencies for `packages/types/package.json`

### Step 3: Environment Setup

#### Frontend Configuration
Create `apps/web/.env.local`:
```env
# API endpoint for backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Backend Configuration
Create `packages/middleware/.env`:
```env
# Required: Google Gemini API key
GEMINI_API_KEY=your_api_key_here

# Server configuration
PORT=3000
NODE_ENV=development

# Optional: Logging
LOG_LEVEL=debug

# Optional: Caching
CACHE_SIZE=100
CACHE_TTL=3600
```

## Development Commands

### Start Development Servers

#### Run Everything (Recommended)
```bash
# Start both frontend and backend in parallel
pnpm dev
```

This uses Turborepo to run all dev scripts in parallel:
- Frontend: Next.js dev server on `http://localhost:3000`
- Backend: Fastify dev server on `http://localhost:3000` (separate process)

#### Run Individual Servers

```bash
# Frontend only
cd apps/web
pnpm dev

# Backend only
cd packages/middleware
pnpm dev

# SDK only
cd packages/react-sdk
pnpm dev
```

### Build Commands

#### Build All Packages
```bash
# Build everything
pnpm build

# This creates:
# - apps/web/.next/ (Next.js build)
# - packages/middleware/dist/ (TypeScript compiled)
# - packages/react-sdk/dist/ (Compiled SDK)
# - packages/ui-components/dist/ (Compiled components)
```

#### Build Specific Package
```bash
# Build frontend only
cd apps/web && pnpm build

# Build backend only
cd packages/middleware && pnpm build
```

### Test Commands

#### Run All Tests
```bash
pnpm test
```

#### Run Tests for Specific Package
```bash
# Backend tests
cd packages/middleware && pnpm test

# Run specific test file
pnpm test src/services/geminiService.test.ts

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage
```

### Linting and Code Quality

```bash
# Lint all packages
pnpm lint

# Fix linting issues automatically
pnpm lint --fix

# Type checking
pnpm type-check
```

### Clean Up

```bash
# Remove all builds and dependencies
pnpm clean
# This removes:
# - node_modules/
# - dist/ folders
# - .next/ folders
# - coverage/
```

## Project Structure Reference

```
all-in-one-chat/
├── apps/web/              # Frontend Next.js application
├── packages/
│   ├── middleware/        # Backend Fastify API
│   ├── react-sdk/         # React SDK for GenUI
│   ├── ui-components/     # Component library
│   └── types/             # Shared types
├── docs/                  # Documentation
└── package.json          # Root package config
```

## Development Workflow

### 1. Making Changes

#### Frontend Changes
```bash
# Edit files in apps/web/src/
vim apps/web/src/components/Chat/ChatInput.tsx

# Changes hot-reload in dev mode (no manual refresh needed)
```

#### Backend Changes
```bash
# Edit files in packages/middleware/src/
vim packages/middleware/src/services/geminiService.ts

# Changes auto-reload via tsx watch (check console)
```

#### Shared Library Changes
```bash
# Edit packages/react-sdk or packages/ui-components
# Will automatically rebuild and be available to frontend

# May need to restart frontend/backend for changes to propagate
```

### 2. Testing Your Changes

```bash
# Run tests for affected package
pnpm test

# Run frontend tests only
cd apps/web && pnpm test

# Run backend tests
cd packages/middleware && pnpm test

# Test specific feature
pnpm test --grep "chat integration"
```

### 3. Committing Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add chart component to GenUI"

# Push to remote
git push origin feature-branch
```

## Common Development Tasks

### Adding a New Dependency

```bash
# Add to frontend
pnpm add --filter=web react-beautiful-dnd

# Add to backend
pnpm add --filter=middleware dotenv

# Add dev dependency
pnpm add -D --filter=middleware vitest-ui

# Add to workspace root
pnpm add -w turbo
```

### Debugging

#### Frontend Debugging
```bash
# Use browser DevTools
# In Chrome: F12 or Ctrl+Shift+I
# Set breakpoints in Source tab
# React DevTools extension recommended
```

#### Backend Debugging
```bash
# Add console logs
console.log('Debug info:', data)

# Or use Node debugger
node --inspect-brk packages/middleware/dist/server.js

# In Chrome: chrome://inspect
```

### Environment Variables

#### Local Development (.env.local)
- Frontend: `apps/web/.env.local` (Git ignored)
- Backend: `packages/middleware/.env` (Git ignored)
- Shared: `packages/types/.env` (if needed)

**Warning**: Never commit API keys or secrets!

### Type Checking

```bash
# Check TypeScript errors
pnpm type-check

# Fix auto-fixable type errors
pnpm type-check --fix
```

## Troubleshooting

### Issue: Dependencies not installing
```bash
# Solution 1: Clear pnpm store
pnpm store prune

# Solution 2: Reinstall from scratch
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Port 3000 already in use
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Issue: API key not working
```bash
# Verify key format
echo $GEMINI_API_KEY

# Check if key is valid in Google Cloud Console
# Re-create key if necessary
```

### Issue: Changes not reflecting
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Restart dev servers
# Press Ctrl+C and run: pnpm dev
```

### Issue: TypeScript errors in IDE
```bash
# Restart IDE
# Or run: pnpm type-check

# Update TypeScript globally
npm install -g typescript@latest
```

## Performance Tips

### Development
- Use `pnpm dev` for parallel execution
- ESLint runs on save (can be slow) - disable if needed
- Use browser DevTools to identify slow components

### Production Build
- Run `pnpm build` to verify no errors
- Check build output sizes
- Use `pnpm analyze` if available for bundle analysis

## Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Keep Branch Updated
```bash
git fetch origin
git rebase origin/main
# or git merge origin/main
```

### Create Pull Request
```bash
git push origin feature/your-feature-name
# Then open PR on GitHub
```

## Documentation

- See `docs/architecture-web.md` for frontend architecture
- See `docs/architecture-middleware.md` for backend architecture
- See `docs/source-tree-analysis.md` for file structure
- See `docs/integration-architecture.md` for API contracts

## Next Steps

1. **Run the project**: `pnpm dev`
2. **Explore the code**: Check `apps/web/src/` and `packages/middleware/src/`
3. **Read architecture docs**: Start with `docs/` folder
4. **Start developing**: Pick an issue or feature to work on
5. **Join the team**: Check CONTRIBUTING.md for guidelines

---

**Generated**: 2025-12-04 by BMad Document Project Workflow
