#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Neko Sensei — Deploy to shared VPS
# Builds locally, rsyncs the standalone output, reloads systemd.
# ─────────────────────────────────────────────
set -euo pipefail

VPS_USER="xno"
VPS_IP="89.167.23.147"
REMOTE_DIR="/home/xno/neko-sensei"
SERVICE="neko-sensei.service"

cd "$(dirname "$0")/.."

echo "▶ Building Neko Sensei…"
NEXT_PUBLIC_BASE_PATH=/neko-sensei npm run build

echo "▶ Ensuring remote directory exists…"
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${REMOTE_DIR}"

echo "▶ Uploading source (rsync)…"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  ./ "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/"

echo "▶ Installing deps + building on VPS…"
ssh "${VPS_USER}@${VPS_IP}" "cd ${REMOTE_DIR} && npm ci --omit=dev=false && NEXT_PUBLIC_BASE_PATH=/neko-sensei npm run build"

echo "▶ Restarting service…"
# systemd runs neko-sensei.service as user xno with Restart=always, so we can
# drop sudo entirely: kill the running next-server process tree as xno and
# systemd will respawn it against the fresh .next/ on disk.
# Anchor the pattern with ^ so it matches only next-server's argv[0] and
# never the shell cmdline that runs pkill (which starts with bash/sh).
if ssh "${VPS_USER}@${VPS_IP}" "pgrep -u ${VPS_USER} -f '^next-server' | xargs -r kill -TERM" 2>/dev/null; then
  sleep 3
  if ssh "${VPS_USER}@${VPS_IP}" "pgrep -u ${VPS_USER} -f '^next-server' >/dev/null"; then
    echo "✓ Service restarted"
  else
    echo "⚠ Service didn't come back up — check 'systemctl status ${SERVICE}' on the VPS."
  fi
else
  echo "⚠ Could not signal the running process. Fallback:"
  echo "    ssh -t ${VPS_USER}@${VPS_IP} 'sudo systemctl restart ${SERVICE}'"
fi

echo ""
echo "✓ Deployed → http://${VPS_IP}/neko-sensei/"
