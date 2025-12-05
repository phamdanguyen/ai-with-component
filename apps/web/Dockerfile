# Multi-stage build for Next.js Frontend

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml ./

# Copy monorepo structure
COPY apps/web ./apps/web
COPY packages ./packages

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build frontend
WORKDIR /app/apps/web
RUN pnpm build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml ./

# Copy monorepo structure
COPY apps/web ./apps/web
COPY packages ./packages

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy built app from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start Next.js
CMD ["pnpm", "start"]
