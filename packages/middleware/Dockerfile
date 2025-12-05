# Multi-stage build for Fastify Backend

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml ./

# Copy monorepo structure
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build middleware
WORKDIR /app/packages/middleware
RUN pnpm build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml ./

# Copy monorepo structure
COPY packages ./packages
COPY apps/web ./apps/web

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy built app from builder
COPY --from=builder /app/packages/middleware/dist ./packages/middleware/dist

WORKDIR /app/packages/middleware

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start Fastify server
CMD ["node", "dist/server.js"]
