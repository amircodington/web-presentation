# 06 — Server deployment

Deploying to a Linux server, as opposed to the booth mini-PC covered in
[05 — Kiosk Deployment](05-kiosk-deployment.md). Same images, same compose file; the difference
is that the port faces a network.

## The shape of it

```text
                    ┌─────────────────────────────────────────┐
   internet ───────▶│  ${BIND_IP}:${PROD_PORT}   →  nginx :80 │
                    │                                │        │
                    │                    compose network      │
                    │                                ▼        │
                    │                  kiosk :${APP_INTERNAL_PORT}
                    │                  (expose only, no host port)
                    └─────────────────────────────────────────┘
```

nginx is the only container with a published port. The Next.js container has no host-facing
socket at all — see [ADR 0005](../architecture/adr/0005-nginx-as-the-production-edge.md).

## Everything is in `.env`

No value below is written in a compose file, a Dockerfile or an nginx config. All of it comes
from the committed root `.env`, which arrives with the git checkout:

| Key | Default | Meaning |
|---|---|---|
| `PROD_PORT` | `3002` | Public port nginx is published on |
| `BIND_IP` | `0.0.0.0` | Host interface that port binds to |
| `SERVER_HOST` | `89.45.89.150` | Public address; nginx `server_name` |
| `APP_INTERNAL_PORT` | `3000` | App port inside the network, never published |
| `NGINX_VERSION` | `1.27-alpine` | Proxy image tag |

`BIND_IP=0.0.0.0` means "every interface this machine has", so the same committed value works
on the server, on the booth mini-PC and on a laptop with no per-machine edit. Set it to one
address only to deliberately restrict which interface answers.

Changing the public port is one edit to `PROD_PORT` followed by a redeploy. Remember the host
firewall: containers publish through it, so a new port needs `ufw allow <port>/tcp`.

## First time on a fresh Ubuntu server

Ubuntu's own `docker.io` and `docker-compose` packages ship the v1 `docker-compose` binary,
which does not understand these compose files. The bootstrap script installs Docker Engine and
the v2 compose plugin from Docker's apt repository instead, which is the only supported path.

```bash
ssh root@89.45.89.150
git clone git@github.com:amircodington/web-presentation.git
cd web-presentation
sudo ./infra/scripts/server-bootstrap.sh    # Docker + compose plugin + ufw
./infra/scripts/deploy.sh                   # pull, build, up, wait for health
```

`server-bootstrap.sh` is re-runnable and installs nothing the deploy does not need. If it added
your user to the `docker` group, log out and back in before deploying.

## Every deploy after that

```bash
cd web-presentation
./infra/scripts/deploy.sh              # latest main
./infra/scripts/deploy.sh v1.2.0       # a specific tag — prefer this for a release
```

The script fetches, checks out, builds, starts, then polls `/api/health` for up to three
minutes. If health never passes it prints `ps` and the last 60 log lines and exits non-zero,
so a broken deploy fails loudly rather than leaving a half-started stack. Dangling images from
previous builds are pruned on success — a small VPS disk fills with them otherwise.

Doing it by hand is the same three commands:

```bash
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
curl -f http://127.0.0.1:3002/api/health
```

## Checking it

```bash
curl -f http://127.0.0.1:3002/api/health              # from the server
curl -f http://89.45.89.150:3002/api/health           # from anywhere
docker compose -f docker-compose.prod.yml ps          # both must say (healthy)
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -T   # rendered config
```

`nginx -T` is the one to reach for when the config on disk and the config nginx is running seem
to disagree: the server block is rendered from a template at container start, so the file in
the repo is not literally what nginx read.

## When it does not come up

| Symptom | Cause |
|---|---|
| Connection refused from outside, fine on the server | Firewall. `sudo ufw allow 3002/tcp` |
| `bind: address already in use` | Something else holds `PROD_PORT`. `sudo ss -tulpn \| grep 3002` |
| nginx exits with `host not found in upstream` | The `kiosk` service never started; read its logs |
| 502 from nginx | App is up but not listening on `0.0.0.0` — check `HOSTNAME` in the container |
| `docker-compose: command not found` | v1 binary. Use `docker compose` (space), installed by the bootstrap script |

## TLS

Not configured — the server is reached by IP, and a public certificate cannot be issued for a
bare IP address. Once a domain points at the host, add a `listen 443 ssl` block to
`infra/nginx/templates/kiosk.conf.template`, mount the certificate into the nginx service, and
put the domain in `SERVER_HOST`. Nothing in the application changes.
