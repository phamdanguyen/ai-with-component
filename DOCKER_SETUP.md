# Docker Setup Guide

This guide provides comprehensive instructions for deploying GenUI Platform using Docker and Docker Compose.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Service Configuration](#service-configuration)
4. [Environment Variables](#environment-variables)
5. [Networking](#networking)
6. [Managing Services](#managing-services)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements
- Docker >= 20.10
- Docker Compose >= 2.0
- At least 2GB free disk space
- Stable internet connection (for building images)

### Installation
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

### Verify Installation
```bash
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd all-in-one-chat
```

### 2. Build Images
```bash
# Build both frontend and backend images
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build middleware
```

### 3. Start Services
```bash
# Start in background (-d flag)
docker-compose up -d

# View logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f middleware
```

### 4. Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **Health Check**: `curl http://localhost:3001/health`

### 5. Stop Services
```bash
# Stop containers (keeps volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

---

## Service Configuration

### Frontend Service (Next.js)

**Container Name**: `genui-frontend`
**Port**: 8080 (mapped to 3000 internal)
**Build Context**: `apps/web/Dockerfile`

```yaml
frontend:
  build:
    context: .
    dockerfile: apps/web/Dockerfile
  container_name: genui-frontend
  ports:
    - "8080:3000"
  environment:
    - NODE_ENV=production
    - NEXT_PUBLIC_API_URL=http://genui-middleware:3001/api
    - BACKEND_API_URL=http://genui-middleware:3001/api
  networks:
    - genui-network
  restart: unless-stopped
```

**Key Points**:
- Production build optimized with multi-stage Dockerfile
- Uses internal container hostname `genui-middleware:3001` for API calls
- Auto-restarts on crash (unless explicitly stopped)
- Connected to `genui-network` bridge

---

### Middleware Service (Fastify)

**Container Name**: `genui-middleware`
**Port**: 3001
**Build Context**: `packages/middleware/Dockerfile`

```yaml
middleware:
  build:
    context: .
    dockerfile: packages/middleware/Dockerfile
  container_name: genui-middleware
  ports:
    - "3001:3001"
  environment:
    - NODE_ENV=production
    - PORT=3001
    - GEMINI_API_KEY=${GEMINI_API_KEY}
    - CORS_ORIGIN=http://genui-frontend:3000
    - LOG_LEVEL=info
  networks:
    - genui-network
  restart: unless-stopped
  depends_on:
    - frontend
```

**Key Points**:
- Reads `GEMINI_API_KEY` from `.env` file
- CORS configured for internal frontend container
- Depends on frontend (starts after frontend)
- Fastify runs on port 3001

---

## Environment Variables

### Setup `.env` File
Create `.env` file in project root:

```bash
# Copy from template
cp .env.example .env

# Edit .env with your values
nano .env
```

### Available Variables

| Variable | Service | Required | Default | Description |
|----------|---------|----------|---------|-------------|
| `GEMINI_API_KEY` | Middleware | No | (empty) | Google Gemini API key, uses mock mode if empty |
| `NODE_ENV` | Both | Yes | production | Environment (development/production) |
| `PORT` | Middleware | Yes | 3001 | Backend port |
| `LOG_LEVEL` | Middleware | No | info | Log level (debug/info/warn/error) |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | http://genui-middleware:3001/api | Backend API URL |
| `CORS_ORIGIN` | Middleware | No | * | CORS allowed origin |

### Example `.env`
```bash
# .env file
GEMINI_API_KEY=sk-your-actual-key-here
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
NEXT_PUBLIC_API_URL=http://genui-middleware:3001/api
CORS_ORIGIN=http://genui-frontend:3000
```

---

## Networking

### Docker Network: `genui-network`

The services communicate through a bridge network:

```bash
# View network details
docker network inspect genui-network

# Services can reference each other by container name:
# Frontend → http://genui-middleware:3001/api
# Middleware → listens on http://0.0.0.0:3001
```

### Port Mappings

| Service | Internal | External | Access |
|---------|----------|----------|--------|
| Frontend | 3000 | 8080 | http://localhost:8080 |
| Middleware | 3001 | 3001 | http://localhost:3001 |

---

## Managing Services

### View Service Status
```bash
# List running containers
docker-compose ps

# View detailed logs
docker-compose logs --tail=50 frontend

# Follow logs in real-time
docker-compose logs -f
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart frontend

# Force recreate containers
docker-compose up -d --force-recreate
```

### Execute Commands in Container
```bash
# Run shell in frontend container
docker-compose exec frontend sh

# Run shell in middleware container
docker-compose exec middleware sh

# Run pnpm commands
docker-compose exec frontend pnpm install
```

### View Logs
```bash
# All services logs
docker-compose logs

# Last 100 lines
docker-compose logs --tail=100

# Follow middleware logs
docker-compose logs -f middleware

# View only errors
docker-compose logs middleware | grep -i error
```

---

## Troubleshooting

### Issue: Containers Won't Start

**Problem**: `docker-compose up` fails immediately

**Solutions**:
```bash
# Check for port conflicts
netstat -ano | findstr :8080  # Windows
lsof -i :8080                  # macOS/Linux

# Remove orphaned containers
docker-compose down --remove-orphans

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Frontend Can't Connect to Backend

**Problem**: "Failed to fetch" or CORS errors

**Check**:
```bash
# Verify middleware is running
docker-compose ps middleware

# Check middleware logs
docker-compose logs middleware

# Test connectivity
docker-compose exec frontend curl http://genui-middleware:3001/health

# Verify CORS headers
curl -H "Origin: http://genui-frontend:3000" http://localhost:3001/health
```

### Issue: Out of Disk Space

**Problem**: `no space left on device`

**Solutions**:
```bash
# Clean up unused images/containers/volumes
docker system prune -a -v

# Remove specific volumes
docker-compose down -v

# Check disk usage
docker system df
```

### Issue: High Memory Usage

**Problem**: Containers consuming too much memory

**Solutions**:
```bash
# Monitor resource usage
docker stats

# Set memory limits in docker-compose.yml
services:
  frontend:
    mem_limit: 512m
  middleware:
    mem_limit: 256m

# Restart with resource limits
docker-compose up -d
```

### Issue: Network Errors

**Problem**: `network genui-network not found`

**Solutions**:
```bash
# Recreate network
docker network rm genui-network || true
docker-compose up -d

# Check network connectivity
docker-compose exec frontend ping genui-middleware
```

### View Detailed Diagnostics
```bash
# Full diagnostic info
docker-compose config

# Image inspection
docker inspect genui-frontend

# Container logs
docker logs -f genui-frontend
```

---

## Production Deployment

### Best Practices

1. **Security**:
   ```yaml
   # Use specific image tags, not 'latest'
   image: node:22-alpine  # Avoid 'latest'

   # Don't run as root
   USER node

   # Use read-only root filesystem
   security_opt:
     - no-new-privileges:true
   ```

2. **Resource Limits**:
   ```yaml
   services:
     frontend:
       mem_limit: 512m
       cpus: "0.5"
     middleware:
       mem_limit: 256m
       cpus: "0.25"
   ```

3. **Logging**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

4. **Health Checks**:
   ```yaml
   middleware:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
       interval: 30s
       timeout: 10s
       retries: 3
   ```

### Deployment Commands

```bash
# Production build
docker-compose -f docker-compose.yml build --no-cache

# Start with production settings
docker-compose -f docker-compose.yml up -d --scale frontend=1 --scale middleware=1

# Monitor
docker-compose logs -f --tail=100

# Health check
curl http://localhost:8080/health
curl http://localhost:3001/health

# Backup volumes
docker run --rm -v genui_data:/data -v $(pwd)/backup:/backup \
  alpine tar czf /backup/genui-backup.tar.gz -C /data .
```

### Cleanup

```bash
# Remove old images
docker rmi $(docker images --filter "dangling=true" -q)

# Remove old containers
docker container prune -f

# Full cleanup
docker-compose down -v
docker system prune -a -f
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-stage Builds Guide](https://docs.docker.com/build/building/multi-stage/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated**: Dec 5, 2025
