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
git clean -fd
git reset --hard origin/main

# 2. Setup Subdirectories
echo "📁 Syncing isolated subdirectories..."
mkdir -p "$FRONTEND_DIR"
mkdir -p "$WORKERS_DIR"
mkdir -p "$BASE_DIR/nginx"
mkdir -p "$BASE_DIR/redis/data"
mkdir -p "$BASE_DIR/n8n/data"
mkdir -p "$BASE_DIR/logs"

# 3. Synchronize Frontend files to its subdirectory (Clean previous files first)
echo "🧹 Wiping and cleaning old frontend files & build caches..."
rm -rf "$FRONTEND_DIR"
mkdir -p "$FRONTEND_DIR"
rsync -av --exclude='frontend' --exclude='workers' --exclude='nginx' --exclude='redis' --exclude='n8n' --exclude='logs' --exclude='appwrite' --exclude='.git' "$BASE_DIR/" "$FRONTEND_DIR/"

# 4. Synchronize Workers files to its subdirectory
echo "📑 Moving worker source to isolated subdirectory..."
rm -rf "$WORKERS_DIR"
mkdir -p "$WORKERS_DIR"
rsync -av "$BASE_DIR/workers/" "$WORKERS_DIR/"

# 5. Handle environment variables
if [ -f "$BASE_DIR/frontend/.env.local" ]; then
    echo "📋 Aligning environment keys from .env.local..."
    cp "$BASE_DIR/frontend/.env.local" "$FRONTEND_DIR/.env"
    cp "$BASE_DIR/frontend/.env.local" "$BASE_DIR/.env"
elif [ -f "$FRONTEND_DIR/.env.local" ]; then
    echo "📋 Aligning environment keys..."
    cp "$FRONTEND_DIR/.env.local" "$FRONTEND_DIR/.env"
    cp "$FRONTEND_DIR/.env.local" "$BASE_DIR/.env"
fi

# 6. Rebuild and restart containers
echo "🐳 Rebuilding and rolling containers..."
cd "$BASE_DIR"
docker compose down -v --remove-orphans 2>/dev/null || true

echo "🧹 Pruning Docker builder cache and dangling images to ensure absolutely clean rebuild..."
docker builder prune -a -f
docker image prune -f

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
