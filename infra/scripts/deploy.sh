#!/usr/bin/env bash
#
# Pull the latest code and bring the kiosk up behind nginx.
#
#   ./infra/scripts/deploy.sh              # deploy the latest main
#   ./infra/scripts/deploy.sh v1.2.0       # deploy a specific tag
#
# Idempotent: safe to re-run. Rolls nothing back — if the new build is broken
# the previous image is still tagged locally and `git checkout <old tag> &&
# ./infra/scripts/deploy.sh` puts it back.

set -euo pipefail

REF="${1:-}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

COMPOSE="docker compose -f docker-compose.prod.yml"

log() { printf '\n\033[1;36m▸ %s\033[0m\n' "$*"; }

log "Fetching from origin"
git fetch --tags --prune origin

if [[ -n "$REF" ]]; then
  git checkout "$REF"
  git pull --ff-only origin "$REF" 2>/dev/null || true
else
  git checkout main
  git pull --ff-only origin main
fi

# `.env` is committed and is the single source of truth, so it arrives with the
# checkout. Everything below reads from it.
set -a; source ./.env; set +a

log "Deploying ${APP_NAME} ${APP_VERSION} ($(git rev-parse --short HEAD))"

log "Building images"
$COMPOSE build --pull

log "Starting services"
$COMPOSE up -d --remove-orphans

log "Waiting for health"
DEADLINE=$((SECONDS + 180))
until curl -fsS "http://127.0.0.1:${PROD_PORT}/api/health" >/dev/null 2>&1; do
  if (( SECONDS > DEADLINE )); then
    printf '\n\033[1;31m✗ Health check never passed. Recent logs:\033[0m\n\n'
    $COMPOSE ps
    $COMPOSE logs --tail 60
    exit 1
  fi
  sleep 3
done

# Untagged layers from previous builds accumulate fast on a small VPS disk.
log "Pruning dangling images"
docker image prune -f >/dev/null

log "Live"
printf '  local   http://127.0.0.1:%s\n' "$PROD_PORT"
printf '  public  http://%s:%s\n\n' "$SERVER_HOST" "$PROD_PORT"
$COMPOSE ps
