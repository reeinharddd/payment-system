# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY prisma ./prisma/

# Install dependencies
RUN bun install

COPY apps/backend ./apps/backend
COPY libs ./libs

RUN bunx prisma generate
RUN bun run --filter backend build

# Stage 2: Production
FROM oven/bun:1

WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/

RUN bun install --production

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.status === 200 ? 0 : 1))"

CMD ["bun", "apps/backend/dist/main.js"]
