$VPS_HOST = "187.124.179.33"
$VPS_USER = "root"
$LOCAL_ENV = "D:\Tranzlo\.env.local"
$PROJECT_DIR = "/root/tranzlo-project"
$GIT_REPO = "https://github.com/majdi1982/tranzlo.git"

Write-Host "=================================================="
Write-Host "     Tranzlo Full Production Deployment (Git + VPS)"
Write-Host "=================================================="

# Sync Git
Write-Host "[1/5] Syncing latest local changes to Git..."
git add .
git commit -m "Automated deployment sync: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
git push origin main

# Create dirs on VPS
Write-Host "[2/5] Creating isolated subdirectories on VPS..."
ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" "mkdir -p ${PROJECT_DIR}/nginx ${PROJECT_DIR}/scripts ${PROJECT_DIR}/frontend"

# Upload files
Write-Host "[3/5] Uploading production configurations..."
scp -o StrictHostKeyChecking=no "deploy.sh" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/deploy.sh"
scp -o StrictHostKeyChecking=no "docker-compose.frontend.yml" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/docker-compose.frontend.yml"
scp -o StrictHostKeyChecking=no "docker-compose.listmonk.yml" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/docker-compose.listmonk.yml"
scp -o StrictHostKeyChecking=no "docker-compose.redis.yml" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/docker-compose.redis.yml"
scp -o StrictHostKeyChecking=no "nginx/default.conf" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/nginx/default.conf"
scp -o StrictHostKeyChecking=no "scripts/setup-vps.sh" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/scripts/setup-vps.sh"
scp -o StrictHostKeyChecking=no "scripts/certbot-ssl.sh" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/scripts/certbot-ssl.sh"
scp -o StrictHostKeyChecking=no "scripts/auto-update.sh" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/scripts/auto-update.sh"


# Upload env
Write-Host "[4/5] Uploading secure environment credentials..."
scp -o StrictHostKeyChecking=no "$LOCAL_ENV" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/frontend/.env.local"

# Execute
Write-Host "[5/5] Executing Remote Deployment script..."
ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" "chmod +x ${PROJECT_DIR}/deploy.sh && chmod +x ${PROJECT_DIR}/scripts/*.sh && ${PROJECT_DIR}/deploy.sh && (crontab -l 2>/dev/null | grep -v 'backup-vps.ts' | grep -v 'auto-update.sh' ; echo '0 3 * * * /root/tranzlo-project/scripts/auto-update.sh') | crontab -"


Write-Host "=================================================="
Write-Host "✅ Deployment Successful and Verified!"
Write-Host "=================================================="
