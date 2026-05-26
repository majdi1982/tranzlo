#!/usr/bin/env bash
set -euo pipefail

DOMAINS="tranzlo.net www.tranzlo.net appwrite.tranzlo.net n8n.tranzlo.net"
EMAIL="admin@tranzlo.net"

echo "=================================================="
echo "  Obtaining SSL Certificates for all domains"
echo "=================================================="

# Stop any running nginx container temporarily
cd /root/tranzlo-project
docker compose stop nginx 2>/dev/null || true
docker compose rm -f nginx 2>/dev/null || true

# Get certificates using standalone mode
for DOMAIN in $DOMAINS; do
    echo ""
    echo "Getting certificate for: $DOMAIN"
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN \
        --preferred-challenges http
done

echo ""
echo "=================================================="
echo "  All certificates obtained!"
echo "=================================================="
certbot certificates

echo ""
echo "Now run: docker compose up -d nginx"
echo "=================================================="
