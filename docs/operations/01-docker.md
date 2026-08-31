# 01 — Docker

## Images already on this machine — reuse these

Checked before anything was designed. `docker images` reports:

```text
node:22-bookworm-slim                247MB   ← the base for this project
postgres:16-bookworm                 456MB
redis:7-bookworm                     136MB
mysql:8.0                            795MB
adminer:4.8.1-standalone             243MB
minio/minio                          175MB
axllent/mailpit:v1.25               29.4MB
```

The kiosk needs none of the data services (see [ADR 0003](../architecture/adr/0003-no-backend-qr-first.md)),
so `node:22-bookworm-slim` is the only image the build needs — and it is already local, meaning
a first build needs no network.

Production adds one image that was not on the list: `nginx:1.27-alpine` (~50MB), the edge proxy,
justified in [ADR 0005](../architecture/adr/0005-nginx-as-the-production-edge.md). It is pulled
on the first production `up`.

**Adding a new base image requires an ADR.** Not because new images are forbidden, but because
"we already have one that works" is the cheapest answer and it is easy to forget to check.

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage: `deps` → `builder` → `runner` |
| `docker-compose.yml` | Development. Bind-mounted source, hot reload |
| `docker-compose.prod.yml` | Production. Baked image behind nginx, no source mount |
| `.dockerignore` | Excludes `node_modules`, `.next`, `.git`, `docs`, `tasks`, `infra`, `docker-tar` |
| `infra/nginx/` | Proxy config, bind-mounted into the nginx container at runtime |
| `infra/scripts/` | `server-bootstrap.sh` (Ubuntu prep) and `deploy.sh` |

Neither compose file contains a version, a port, or an image tag as a literal. Every one of
those comes from `.env`.

## Development

```bash
docker compose up          # http://localhost:${DEV_PORT}
```

- Source bind-mounted, Next.js dev server with hot reload.
- `node_modules` lives in a **named volume**, not a bind mount — a host `node_modules` built on
  macOS ARM will not run inside a Linux container, and this is the single most common way this
  setup breaks.
- `content/` is mounted separately so the client can edit JSON and see the result without a
  rebuild.
- Runs as a non-root user matching the host UID so files created in the container are editable
  on the host.

## Production

```bash
docker compose -f docker-compose.prod.yml up -d --build   # http://localhost:${PROD_PORT}
```

Two containers. `nginx` is the only one published, on `${BIND_IP}:${PROD_PORT}`; `kiosk` uses
`expose` and is reachable only from inside the compose network — see
[ADR 0005](../architecture/adr/0005-nginx-as-the-production-edge.md). On a server, use
`infra/scripts/deploy.sh` rather than running compose by hand:
[06 — Server Deployment](06-server-deployment.md).

- `next build` with `output: "standalone"` — the runner stage copies only the standalone server,
  the static assets, and `public/`. No `node_modules`, no source, no dev dependencies.
- The app binds `0.0.0.0` inside the container. With the default it would be reachable on
  `localhost` only, and nginx would get connection refused with nothing else looking wrong.
- `nginx` waits on `condition: service_healthy`, so a proxy is never fronting an app that has
  not finished starting.
- Runs as non-root `node`.
- `restart: unless-stopped`, because the booth machine will be power-cycled and nobody will be
  there to bring it back up.
- A healthcheck hits `/api/health`; an unhealthy container restarts itself.
- Image tagged `${DOCKER_IMAGE}:${APP_VERSION}`, and the proxy `nginx:${NGINX_VERSION}` —
  both from `.env`.

## The Dockerfile stages

```dockerfile
# deps — install once, cached on lockfile hash alone
FROM node:22-bookworm-slim AS deps

# builder — validate content, typecheck, build
FROM node:22-bookworm-slim AS builder

# runner — standalone output only, non-root, ~180MB
FROM node:22-bookworm-slim AS runner
```

Copy `package.json` and the lockfile before the source in the `deps` stage. Copying source
first invalidates the dependency layer on every code change and turns a 10-second rebuild into
a 3-minute one.

`ARG APP_VERSION` is passed in at build time and baked in as `NEXT_PUBLIC_APP_VERSION` so the
running app can display which build it is — which is the first question anyone asks when the
screen at the booth is behaving oddly.

## Verifying a production build locally

Before it goes anywhere near the booth:

```bash
docker compose -f docker-compose.prod.yml up -d --build
curl -f http://localhost:${PROD_PORT}/api/health
docker compose -f docker-compose.prod.yml logs --tail=50
```

Then open it in a browser at the TV's actual resolution, and **pull the network cable** and
confirm it still works. That last step is not optional — it is the failure mode that actually
happens at events, and it is trivially easy to test in advance and trivially easy to forget.
