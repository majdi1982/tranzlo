#!/bin/bash
# One-time setup: copy renewal script and install cron job for auto-renewal
# Run this on the VPS as root

set -e

SCRIPT_SRC="./renew-certs.sh"
SCRIPT_DST="/opt/tranzlo-renew-certs.sh"
CRON_LOG="/var/log/tranzlo-cert-renew.log"

echo "[1/3] Copying renewal script..."
cp "$SCRIPT_SRC" "$SCRIPT_DST"
chmod +x "$SCRIPT_DST"

echo "[2/3] Setting up cron job for twice-daily renewal attempt..."
# Certbot recommends running renew twice daily
# Cron job runs at 3:00 AM and 3:00 PM UTC
CRON_LINE="0 3,15 * * * $SCRIPT_DST >> $CRON_LOG 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -Fq "$SCRIPT_DST"; then
  echo "  Cron job already exists, skipping."
else
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
  echo "  Cron job added."
fi

echo "[3/3] Testing renewal script (dry-run)..."
certbot renew --dry-run --webroot --webroot-path /var/www/certbot

echo ""
echo "Setup complete!"
echo "  Script: $SCRIPT_DST"
echo "  Log:    $CRON_LOG"
echo ""
echo "To verify cron job: crontab -l"
echo "To run manually:    $SCRIPT_DST"
