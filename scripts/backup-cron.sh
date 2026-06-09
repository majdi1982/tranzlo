#!/bin/bash
# Tranzlo VPS Backup Cron Registration Script
# Run this script on the VPS to schedule backups.

PROJECT_DIR="/root/tranzlo-project"
CRON_JOB="0 3 * * * cd $PROJECT_DIR && npx tsx src/scripts/backup-vps.ts >> /var/log/tranzlo-backup.log 2>&1"

echo "=================================================="
echo "    Tranzlo Google Drive Backup Cron Installer"
echo "=================================================="

# Check if JSON key exists
if [ ! -f "$PROJECT_DIR/google-service-account.json" ]; then
    echo "⚠️  WARNING: google-service-account.json not found in $PROJECT_DIR."
    echo "   Ensure you upload your Google Cloud credentials JSON key to this path before backups run."
fi

# Check if crontab entry already exists
crontab -l 2>/dev/null | grep -q "backup-vps.ts"
if [ $? -eq 0 ]; then
    echo "✅ Backup cron job is already registered."
else
    # Append cron job to existing crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Successfully registered backup cron job (Daily at 3:00 AM)."
fi

echo "   Scheduled: $CRON_JOB"
echo "=================================================="
