#!/usr/bin/env bash
#
# One-time preparation of a fresh Ubuntu server (22.04 / 24.04) so that
# infra/scripts/deploy.sh can run. Installs Docker Engine and the compose
# plugin from Docker's own apt repository — the `docker.io` and
# `docker-compose` packages in Ubuntu's archive are older and ship the v1
# `docker-compose` binary, which does not understand this project's compose
# files.
#
#   sudo ./infra/scripts/server-bootstrap.sh
#
# Re-runnable.

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo." >&2
  exit 1
fi

TARGET_USER="${SUDO_USER:-root}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROD_PORT="$(grep -E '^PROD_PORT=' "$REPO_ROOT/.env" | cut -d= -f2)"

log() { printf '\n\033[1;36m▸ %s\033[0m\n' "$*"; }

log "Installing prerequisites"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git gnupg ufw

# Installing docker-ce over an existing docker.io from Ubuntu's archive
# conflicts on the same binaries. If a working engine and a v2 compose plugin
# are already here, there is nothing to install.
if docker compose version >/dev/null 2>&1; then
  log "Docker and the v2 compose plugin are already installed — skipping"
  echo "  $(docker --version)"
  echo "  $(docker compose version)"
  SKIP_DOCKER_INSTALL=1
fi

if [[ -z "${SKIP_DOCKER_INSTALL:-}" ]]; then
log "Adding Docker's apt repository"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

cat > /etc/apt/sources.list.d/docker.list <<REPO
deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable
REPO

log "Installing Docker Engine and the compose plugin"
apt-get update -qq
apt-get install -y -qq \
  docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

log "Enabling Docker on boot"
systemctl enable --now docker
fi

if [[ "$TARGET_USER" != "root" ]]; then
  log "Adding $TARGET_USER to the docker group"
  usermod -aG docker "$TARGET_USER"
  echo "  Log out and back in for this to take effect."
fi

# Containers publish through the host firewall, so the port has to be open
# before anything outside the machine can reach nginx.
log "Allowing SSH and port $PROD_PORT in ufw"
ufw allow OpenSSH >/dev/null
ufw allow "${PROD_PORT}/tcp" >/dev/null

# Enabling ufw is NOT automatic, and that is deliberate. Turning it on with
# only these two rules would drop every other port on the machine — this server
# also publishes 3000, 3001 and 4000 for unrelated stacks, and enabling the
# firewall here would take all of them offline with no warning. Whoever owns
# the host has to decide the full rule set.
if ufw status | grep -q "Status: active"; then
  echo "  ufw is active; the rules above are live."
else
  echo
  echo "  ufw is INACTIVE and this script will not enable it."
  echo "  Other services on this host publish their own ports — enabling ufw"
  echo "  with only the rules above would cut them off. Currently published:"
  docker ps --format '    {{.Names}}  {{.Ports}}' 2>/dev/null || true
  echo
  echo "  To enable it, allow those ports first, then: sudo ufw enable"
fi
ufw status numbered

log "Done"
echo "  Next:  ./infra/scripts/deploy.sh"
