#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/root/tranzlo-project"
FRONTEND_DIR="/root/tranzlo-project/frontend"
WORKERS_DIR="/root/tranzlo-project/workers"

echo "=================================================="
echo "🚀 Tranzlo Enterprise Production Deployment"
echo "=================================================="

# 1. Pull Latest Git Code
echo "📥 Fetching latest code from GitHub..."
cd "$BASE_DIR"
git fetch --all
git reset --hard origin/main

# 2. Setup Subdirectories
echo "📁 Syncing isolated subdirectories..."
mkdir -p "$FRONTEND_DIR"
mkdir -p "$WORKERS_DIR"
mkdir -p "$BASE_DIR/nginx"
mkdir -p "$BASE_DIR/redis/data"
mkdir -p "$BASE_DIR/n8n/data"
mkdir -p "$BASE_DIR/logs"

# 3. Synchronize Frontend files to its subdirectory
echo "📑 Moving frontend source to isolated subdirectory..."
rsync -av --exclude='frontend' --exclude='workers' --exclude='nginx' --exclude='redis' --exclude='n8n' --exclude='logs' --exclude='appwrite' --exclude='.git' "$BASE_DIR/" "$FRONTEND_DIR/"

# 4. Synchronize Workers files to its subdirectory
echo "📑 Moving worker source to isolated subdirectory..."
rsync -av "$BASE_DIR/workers/" "$WORKERS_DIR/"

# 5. Handle environment variables
if [ -f "$FRONTEND_DIR/.env.local" ]; then
    echo "📋 Aligning environment keys..."
    cp "$FRONTEND_DIR/.env.local" "$FRONTEND_DIR/.env"
    cp "$FRONTEND_DIR/.env.local" "$BASE_DIR/.env"
fi

# 6. Rebuild and restart containers
echo "🐳 Rebuilding and rolling containers..."
cd "$BASE_DIR"
docker compose down --remove-orphans 2>/dev/null || true

if ! docker compose build --no-cache --progress=plain; then
    echo "❌ Build Failed!"
    exit 1
fi

echo "🚀 Starting containers..."
docker compose up -d

# 7. Check container health
echo "🩺 Verifying container health..."
sleep 5
docker compose ps

echo "=================================================="
echo "✅ Deployment Completed Successfully!"
echo "=================================================="
