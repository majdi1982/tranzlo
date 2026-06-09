#!/usr/bin/env bash
# Tranzlo VPS Daily Automated Update & OS Upgrade Script
# Scheduled to run daily at 3:00 AM via crontab

PROJECT_DIR="/root/tranzlo-project"
LOG_FILE="/var/log/tranzlo-auto-update.log"

echo "==================================================" >> "$LOG_FILE"
echo "🔄 RUNNING DAILY AUTO-UPDATE: $(date)" >> "$LOG_FILE"
echo "==================================================" >> "$LOG_FILE"

# 1. Update OS System Packages
echo "📦 Step 1/2: Checking and upgrading OS packages..." >> "$LOG_FILE"
export DEBIAN_FRONTEND=noninteractive
apt-get update >> "$LOG_FILE" 2>&1
apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" >> "$LOG_FILE" 2>&1
echo "   ✅ OS package upgrade completed." >> "$LOG_FILE"

# 2. Check for App Updates on Git
echo "📥 Step 2/2: Checking for new updates on GitHub..." >> "$LOG_FILE"
cd "$PROJECT_DIR"

# Ensure git is safe to run
git config --global --add safe.directory "$PROJECT_DIR" || true

git fetch --all >> "$LOG_FILE" 2>&1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🆕 New application updates found on GitHub!" >> "$LOG_FILE"
    echo "   Local commit:  $LOCAL" >> "$LOG_FILE"
    echo "   Remote commit: $REMOTE" >> "$LOG_FILE"
    echo "🚀 Pulling changes and triggering redeployment..." >> "$LOG_FILE"
    
    git reset --hard origin/main >> "$LOG_FILE" 2>&1
    chmod +x deploy.sh
    
    # Run the deployment script and log outputs
    ./deploy.sh >> "$LOG_FILE" 2>&1
    echo "   ✅ Site successfully updated and redeployed!" >> "$LOG_FILE"
else
    echo "✅ Site is already up-to-date with GitHub. No redeployment needed." >> "$LOG_FILE"
fi

echo "==================================================" >> "$LOG_FILE"
echo "🎉 AUTO-UPDATE PROCESS COMPLETED SUCCESSFULY" >> "$LOG_FILE"
echo "==================================================" >> "$LOG_FILE"
