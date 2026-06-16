# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# openssl required by Prisma schema-engine on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Generate Prisma client with the musl-openssl-3.0.x binary
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# openssl must be present for Prisma schema-engine to load (migrate deploy)
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

# Copy the entire node_modules from builder so Prisma binaries are identical
# (avoids re-downloading and potential platform/openssl mismatch)
COPY --from=builder /app/node_modules ./node_modules

# Prune dev dependencies in-place
RUN npm prune --omit=dev && npm cache clean --force

# Copy built NestJS app
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Run migrations then start the API
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
