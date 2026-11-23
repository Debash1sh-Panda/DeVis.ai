FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter api build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma

USER nestjs
EXPOSE 3001

CMD ["node", "dist/main"]
