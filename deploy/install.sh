#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Neko Sensei — First-time install (run ON the VPS)
# Installs systemd unit + nginx location block + starts the service.
#
# Usage (from your laptop):
#   ssh -t xno@89.167.23.147 "sudo bash /home/xno/neko-sensei/deploy/install.sh"
# ─────────────────────────────────────────────
set -euo pipefail

APP_DIR="/home/xno/neko-sensei"
UNIT_SRC="${APP_DIR}/deploy/neko-sensei.service"
NGINX_SNIPPET="${APP_DIR}/deploy/neko-sensei.nginx"
NGINX_SITE="/etc/nginx/sites-enabled/default-server"
UNIT_DST="/etc/systemd/system/neko-sensei.service"

echo "▶ Installing systemd unit…"
cp "${UNIT_SRC}" "${UNIT_DST}"
systemctl daemon-reload
systemctl enable neko-sensei.service

echo "▶ Checking nginx for existing neko-sensei block…"
if grep -q "/neko-sensei/" "${NGINX_SITE}"; then
  echo "  already present, skipping"
else
  echo "▶ Patching ${NGINX_SITE}…"
  cp "${NGINX_SITE}" "${NGINX_SITE}.bak.$(date +%s)"
  # Insert snippet just before the final closing brace of the server block
  awk -v f="${NGINX_SNIPPET}" '
    BEGIN { while ((getline line < f) > 0) snippet = snippet line "\n" }
    /^}$/ && !done { print snippet; done=1 }
    { print }
  ' "${NGINX_SITE}" > "${NGINX_SITE}.new"
  mv "${NGINX_SITE}.new" "${NGINX_SITE}"
fi

echo "▶ Testing nginx config…"
nginx -t

echo "▶ Starting neko-sensei service…"
systemctl restart neko-sensei.service
sleep 2
systemctl --no-pager -l status neko-sensei.service | head -15 || true

echo "▶ Reloading nginx…"
systemctl reload nginx

echo ""
echo "✓ Neko Sensei installed. Try: http://89.167.23.147/neko-sensei/"
