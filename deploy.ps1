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

# Create and zip deployment package locally
Write-Host "[2/5] Creating deployment package locally..."
$tempDir = Join-Path $PSScriptRoot "deploy_temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir "nginx") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir "scripts") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir "frontend") | Out-Null

Copy-Item "deploy.sh" (Join-Path $tempDir "deploy.sh")
Copy-Item "docker-compose.frontend.yml" (Join-Path $tempDir "docker-compose.frontend.yml")
Copy-Item "docker-compose.listmonk.yml" (Join-Path $tempDir "docker-compose.listmonk.yml")
Copy-Item "docker-compose.redis.yml" (Join-Path $tempDir "docker-compose.redis.yml")
Copy-Item "nginx/default.conf" (Join-Path $tempDir "nginx/default.conf")
Copy-Item "scripts/setup-vps.sh" (Join-Path $tempDir "scripts/setup-vps.sh")
Copy-Item "scripts/certbot-ssl.sh" (Join-Path $tempDir "scripts/certbot-ssl.sh")
Copy-Item "scripts/auto-update.sh" (Join-Path $tempDir "scripts/auto-update.sh")
Copy-Item "$LOCAL_ENV" (Join-Path $tempDir "frontend/.env.local")

$zipFile = Join-Path $PSScriptRoot "deploy.zip"
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile
Remove-Item -Recurse -Force $tempDir

# Create project dir on VPS (prompts 1)
Write-Host "[3/5] Creating project directory on VPS..."
ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" "mkdir -p ${PROJECT_DIR}"

# Upload deployment package (prompts 2)
Write-Host "[4/5] Uploading deployment package to VPS..."
scp -o StrictHostKeyChecking=no "$zipFile" "${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/deploy.zip"
Remove-Item -Force $zipFile

# Extract and Execute on VPS (prompts 3)
Write-Host "[5/5] Extracting package and executing Remote Deployment script..."
ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_HOST}" "apt-get install -y unzip && cd ${PROJECT_DIR} && unzip -o deploy.zip && rm deploy.zip && chmod +x deploy.sh && chmod +x scripts/*.sh && ./deploy.sh && (crontab -l 2>/dev/null | grep -v 'backup-vps.ts' | grep -v 'auto-update.sh' ; echo '0 3 * * * /root/tranzlo-project/scripts/auto-update.sh') | crontab -"

Write-Host "=================================================="
Write-Host "✅ Deployment Successful and Verified!"
Write-Host "=================================================="
