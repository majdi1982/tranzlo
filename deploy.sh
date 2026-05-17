#!/usr/bin/env bash
set -euo pipefail

DOMAIN="tranzlo.net"
WWW_DOMAIN="www.tranzlo.net"
APPWRITE_DOMAIN="appwrite.tranzlo.net"
N8N_DOMAIN="n8n.tranzlo.net"
GIT_REPO="https://github.com/majdi1982/tranzlo.git"
BASE_DIR="/root/tranzlo-project"
FRONTEND_DIR="/root/tranzlo-project/frontend"

echo "=================================================="
echo "🚀 Tranzlo Deployment"
echo "=================================================="

# 📥 Pulling latest code
echo "📥 Pulling latest code..."
cd "$FRONTEND_DIR" || exit 1
git fetch --all
git reset --hard origin/main

# 📋 Copying env keys
if [ -f ".env.local" ]; then
    echo "📋 Copying .env.local to .env"
    cp .env.local .env
fi

# 🐳 Building & Starting
echo "🐳 Rebuilding Frontend Container..."
cd "$BASE_DIR" || exit 1
docker compose down --remove-orphans 2>/dev/null || true

if ! docker compose build --no-cache --progress=plain frontend 2>&1 | tee build.log; then
    echo "❌ Build Failed! Last 50 lines:"
    tail -n 50 build.log
    exit 1
fi

echo "🚀 Starting containers..."
docker compose up -d

echo ""
echo "✅ Deployment Successful!"
