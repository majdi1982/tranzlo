#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/root/tranzlo-project"
TARGET_FRONTEND="/root/tranzlo/frontend"
TARGET_LISTMONK="/root/tranzlo/listmonk"
TARGET_REDIS="/root/tranzlo/redis"

echo "=================================================="
echo "🚀 Tranzlo Enterprise Modular Production Deployment"
echo "=================================================="

# 1. Pull Latest Git Code
echo "📥 Fetching latest code from GitHub..."
cd "$BASE_DIR"
git fetch --all
git clean -fd
git reset --hard origin/main

# 2. Setup Subdirectories & Docker Network
echo "📁 Syncing target directories..."
mkdir -p "$TARGET_FRONTEND"
mkdir -p "$TARGET_LISTMONK"
mkdir -p "$TARGET_REDIS"

echo "🌐 Creating shared external network if it doesn't exist..."
docker network create tranzlo-net 2>/dev/null || true

# 3. Stop old unified docker-compose stack if running
if [ -f "$BASE_DIR/docker-compose.yml" ]; then
    echo "🛑 Stopping old unified deployment..."
    docker compose -f "$BASE_DIR/docker-compose.yml" down --remove-orphans 2>/dev/null || true
fi

# 4. Synchronize Frontend files to its target folder
echo "🧹 Syncing frontend source code..."
rsync -av --delete --exclude='frontend' --exclude='workers' --exclude='nginx' --exclude='redis' --exclude='n8n' --exclude='logs' --exclude='appwrite' --exclude='.git' "$BASE_DIR/" "$TARGET_FRONTEND/"
cp "$BASE_DIR/docker-compose.frontend.yml" "$TARGET_FRONTEND/docker-compose.yml"

# 5. Handle environment variables for frontend
if [ -f "$BASE_DIR/frontend/.env.local" ]; then
    echo "📋 Copying environment keys from base project..."
    cp "$BASE_DIR/frontend/.env.local" "$TARGET_FRONTEND/.env"
elif [ -f "$TARGET_FRONTEND/.env.local" ]; then
    echo "📋 Copying environment keys..."
    cp "$TARGET_FRONTEND/.env.local" "$TARGET_FRONTEND/.env"
fi

# 6. Synchronize Listmonk & Redis configurations
echo "📑 Syncing modular configurations for Listmonk and Redis..."
cp "$BASE_DIR/docker-compose.listmonk.yml" "$TARGET_LISTMONK/docker-compose.yml"
cp "$BASE_DIR/docker-compose.redis.yml" "$TARGET_REDIS/docker-compose.yml"
if [ -f "$BASE_DIR/listmonk/config.toml" ]; then
    cp "$BASE_DIR/listmonk/config.toml" "$TARGET_LISTMONK/config.toml"
fi

# 7. Start Redis Stack
echo "🔑 Starting Redis stack..."
cd "$TARGET_REDIS"
docker compose down || true
docker compose up -d

# 8. Start Listmonk Stack
echo "📧 Starting Listmonk stack..."
cd "$TARGET_LISTMONK"
docker compose down || true
docker compose up -d

# Wait for postgres to be ready and initialize db schema if necessary
echo "⏳ Waiting for Listmonk Database to initialize..."
sleep 5
# Check if Listmonk needs db installation schema
if docker logs tranzlo-listmonk 2>&1 | grep -q "the database does not appear to be setup"; then
    echo "⚙️ Initializing Listmonk Database Schema..."
    docker compose run --rm listmonk ./listmonk --install --yes || true
    docker compose restart listmonk
fi

# 9. Build and Start Frontend Stack
echo "🌐 Building and starting Next.js Frontend stack..."
cd "$TARGET_FRONTEND"
docker compose down || true

echo "🧹 Pruning unused Docker containers, builder cache, and images..."
docker builder prune -a -f
docker system prune -af

if ! docker compose build --no-cache --progress=plain; then
    echo "❌ Build Failed!"
    exit 1
fi
docker compose up -d

echo "🧹 Cleaning up dangling/old Docker images..."
docker image prune -f

# 10. Verify Health
echo "🩺 Verifying container statuses..."
sleep 3
docker ps -a --filter "name=tranzlo-"

echo "=================================================="
echo "✅ Deployment Completed Successfully!"
echo "=================================================="
