# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# Generate Prisma client (includes alpine/musl binary)
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

# Install production deps only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built app and Prisma engine binary from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
