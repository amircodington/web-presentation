# Deliberately no `# syntax=docker/dockerfile:1` directive. That pins the build
# frontend to an image BuildKit downloads from Docker Hub before it can read
# this file at all — a network round-trip on every build, on a network that
# resets Docker Hub connections at random. Nothing here needs a frontend newer
# than the one built into BuildKit: no heredocs, no RUN --mount.

ARG NODE_VERSION=22-bookworm-slim

# ─── deps ────────────────────────────────────────────────────────────────────
# Manifests are copied alone so this layer is cached on the lockfile hash. Copying
# source first would invalidate it on every code change and turn a 10s rebuild
# into a 3-minute one.
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── builder ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ARG APP_VERSION=0.0.0
ENV APP_VERSION=${APP_VERSION}
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─── runner ──────────────────────────────────────────────────────────────────
# Standalone output only: no node_modules, no source, no dev dependencies.
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ARG APP_VERSION=0.0.0
ARG APP_INTERNAL_PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}
ENV PORT=${APP_INTERNAL_PORT}
# Binding to 0.0.0.0 rather than localhost is what makes the server reachable
# from another container on the compose network. With the default the nginx
# service gets connection refused and nothing else looks wrong.
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE ${APP_INTERNAL_PORT}

# Reads $PORT rather than a literal so the probe follows APP_INTERNAL_PORT.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
