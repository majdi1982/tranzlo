#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "  Tranzlo VPS Initial Setup"
echo "=================================================="

# System update
apt update && apt upgrade -y

# Install prerequisites
apt install -y ca-certificates curl gnupg lsb-release uidmap dbus git certbot python3-certbot-nginx

# Install Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable Docker
systemctl enable docker

# Create swap (2GB)
if ! swapon --show | grep -q /swapfile; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Create project directory
mkdir -p /root/tranzlo-project
mkdir -p /root/tranzlo-project/nginx
mkdir -p /root/tranzlo-project/scripts
mkdir -p /root/tranzlo-project/frontend
mkdir -p /root/tranzlo-project/workers
mkdir -p /root/tranzlo-project/redis/data
mkdir -p /root/tranzlo-project/n8n/data
mkdir -p /root/tranzlo-project/logs
mkdir -p /root/tranzlo-project/logs/nginx
mkdir -p /var/www/certbot

echo ""
echo "Verifying installation:"
docker --version
docker compose version
echo ""
echo "=================================================="
echo "  VPS ready for Tranzlo deployment!"
echo "=================================================="
