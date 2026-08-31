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

if [[ "$TARGET_USER" != "root" ]]; then
  log "Adding $TARGET_USER to the docker group"
  usermod -aG docker "$TARGET_USER"
  echo "  Log out and back in for this to take effect."
fi

# Containers publish through the host firewall, so the port has to be open
# before anything outside the machine can reach nginx.
log "Opening port $PROD_PORT and SSH in ufw"
ufw allow OpenSSH >/dev/null
ufw allow "${PROD_PORT}/tcp" >/dev/null
ufw --force enable >/dev/null
ufw status numbered

log "Done"
echo "  Next:  ./infra/scripts/deploy.sh"
