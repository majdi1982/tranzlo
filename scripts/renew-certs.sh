#!/bin/bash
# Renew all Let's Encrypt certificates via webroot and reload nginx in Docker
set -e

WEBROOT="/var/www/certbot"
COMPOSE_DIR="/root/tranzlo-project"
NGINX_CONTAINER="tranzlo-nginx"

echo "[$(date)] Starting certificate renewal..."

certbot renew \
  --webroot \
  --webroot-path "$WEBROOT" \
  --non-interactive

# Reload nginx inside Docker to pick up new certificates
echo "[$(date)] Reloading nginx..."
cd "$COMPOSE_DIR"
docker compose exec -T "$NGINX_CONTAINER" nginx -s reload

echo "[$(date)] Certificate renewal complete."
