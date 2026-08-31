# 0005 — nginx as the production edge

**Status:** Accepted · 2026-08-31

## Context

Until now production published the Next.js standalone server straight onto a host port. That
was adequate while the only deployment target was the booth mini-PC, where the sole client is
a Chromium instance on `localhost`.

The app now also runs on a public server (`89.45.89.150:3002`), reachable from the open
internet. Exposing a Node process directly to that is a different proposition: Node terminates
the connection itself, so slow-client handling, request buffering, header limits and static
asset caching are all the application's problem, and the server's version and internals are
advertised to anyone who connects. There is also nowhere to terminate TLS when a certificate
is eventually added, and no way to put anything else on the same host later.

`nginx:1.27-alpine` is a base image this project did not previously use, which AGENTS.md §7
requires be justified here.

## Decision

A second container, `nginx:1.27-alpine`, is the only thing published in production. The Next.js
container moves from `ports` to `expose`, so it is reachable only from inside the compose
network.

All nginx configuration lives in `infra/nginx/`. The server block is a template rendered at
container start by the image's own `envsubst` entrypoint, which keeps the listen address, the
public host and the upstream port in the root `.env` rather than duplicated in a config file —
the rule in ADR 0004.

## Consequences

**Positive.** One published port instead of two, and the app has no host-facing socket at all.
Static assets and `/media/` get explicit cache headers and are kept out of the access log, so a
festival day of polling does not fill the disk. gzip is applied once at the edge rather than
per-response in Node. TLS has an obvious home when a domain is pointed at the server: one
`listen 443 ssl` in the template, no application change. `server_tokens off` stops the version
banner.

**Negative.** A second container to start, monitor and keep patched, and one more hop on every
request. The rendered config is not readable in the repo — `infra/nginx/templates/` holds the
template, and what nginx actually ran is only visible inside the container.

**Mitigation.** `nginx` depends on `kiosk` being *healthy*, so an unhealthy app is never
fronted by a proxy claiming to be up, and both containers carry their own healthcheck.
`docker compose -f docker-compose.prod.yml exec nginx nginx -T` prints the fully rendered
config when the template's output is in question.

**Rejected: Caddy.** Automatic HTTPS is its main draw and there is no domain yet, only an IP,
which cannot get a public certificate. It would also be a new image with no other use here,
whereas nginx is the thing the eventual host will already be running.

**Rejected: staying on a directly published Node port.** Works, and is what the booth mini-PC
effectively still does behind `localhost`. It stops being defensible the moment the port faces
the internet.
