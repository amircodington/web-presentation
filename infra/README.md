# infra/

Everything needed to run the project on a machine that is not a developer laptop. No
application code lives here, and nothing here is baked into an image — the nginx configs are
bind-mounted at runtime, which is why `infra` is in `.dockerignore`.

```text
infra/
├── nginx/
│   ├── nginx.conf              main config; replaces the image default
│   ├── snippets/
│   │   └── proxy.conf          proxy headers shared by every location
│   └── templates/
│       └── kiosk.conf.template server block; ${NGINX_*} filled in at container start
└── scripts/
    ├── server-bootstrap.sh     one-time Ubuntu prep: Docker, compose plugin, ufw
    └── deploy.sh               pull, build, up, wait for health
```

## Why the server block is a template

The nginx image runs `envsubst` over `/etc/nginx/templates/*.template` at start and writes the
result into `/etc/nginx/conf.d/`. That is what lets the listen port, public host and upstream
come from the root `.env` instead of being duplicated in a config file — the rule in
[ADR 0004](../docs/architecture/adr/0004-env-as-single-source-of-truth.md).

`NGINX_ENVSUBST_FILTER: ^NGINX_` in the compose file restricts substitution to that prefix.
Without it the entrypoint substitutes every variable it can see, and one named like an nginx
runtime variable would blank that variable out mid-config.

Only `templates/` is processed. `nginx.conf` and `snippets/` are mounted verbatim, so they can
use `$host`, `$remote_addr` and friends freely.

## Editing the config

```bash
# after any change to nginx.conf, snippets/ or templates/
docker compose -f ../docker-compose.prod.yml exec nginx nginx -t   # validate
docker compose -f ../docker-compose.prod.yml restart nginx         # apply
docker compose -f ../docker-compose.prod.yml exec nginx nginx -T   # read what it actually ran
```

A syntax error takes the proxy down on restart and the app with it, as far as anyone outside
the host can tell. Run `nginx -t` first, every time.

Full deployment guide: [`docs/operations/06-server-deployment.md`](../docs/operations/06-server-deployment.md).
