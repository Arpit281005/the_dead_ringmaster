# Single-node SQLite production image for The Carnival of Lies.
# Scale to 1 replica. Mount a volume at /data for the database file.
# Railway: set PORT via platform; volume mount /data; see RAILWAY.md.
#
# Runner overlays the full `deps` node_modules (not cherry-picked packages).
# Prisma 7 migrate needs the complete @prisma/config closure (effect, etc.).

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./prisma/build-placeholder.db"
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
# Railway injects PORT; default for local docker runs
ENV PORT=3000
ENV DATABASE_URL="file:/data/carnival.db"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /data

COPY --from=builder /app/.next/standalone ./
# Full dependency closure for Prisma migrate + seed (effect, c12, tsx, better-sqlite3, …)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/app/generated ./app/generated
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# migrate → seed-if-empty (skips when data exists) → Next standalone
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node node_modules/tsx/dist/cli.mjs prisma/seed.ts && node server.js"]
