#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Neko Sensei — Deploy to shared VPS
# Builds locally, rsyncs the standalone output, reloads systemd.
# ─────────────────────────────────────────────
set -euo pipefail

VPS_USER="xno"
VPS_IP="89.167.23.147"
REMOTE_DIR="/opt/neko-sensei"
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

echo "▶ Restarting systemd service (sudo)…"
ssh -t "${VPS_USER}@${VPS_IP}" "sudo systemctl restart ${SERVICE}"

echo ""
echo "✓ Deployed → http://${VPS_IP}/neko-sensei/"
