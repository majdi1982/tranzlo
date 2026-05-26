@echo off
setlocal enabledelayedexpansion

set "VPS_HOST=187.124.179.33"
set "VPS_USER=root"
set "LOCAL_ENV=D:\Tranzlo\.env.local"
set "PROJECT_DIR=/root/tranzlo-project"
set "GIT_REPO=https://github.com/majdi1982/tranzlo.git"

echo ==================================================
echo     Tranzlo Full Production Deployment (Git + VPS)
echo ==================================================
echo.

:: Ensure correct directory
cd /d %~dp0
echo Current Directory: %CD%

:: Commit & Push changes to Git
if not exist ".git" (
    echo [0/5] Initializing Git Repository...
    git init
    git branch -M main
    git remote add origin %GIT_REPO%
)

echo [1/5] Syncing latest local changes to Git...
git add .
git commit -m "Automated deployment sync: %DATE% %TIME%" || echo No new changes to commit.
git push -u origin main || git push origin main

:: Create directory structure on VPS
echo [2/5] Creating isolated subdirectories on VPS...
ssh -o StrictHostKeyChecking=no %VPS_USER%@%VPS_HOST% "mkdir -p %PROJECT_DIR%/nginx %PROJECT_DIR%/scripts %PROJECT_DIR%/frontend"

:: Upload config files
echo [3/5] Uploading production configurations...
scp -o StrictHostKeyChecking=no "deploy.sh" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/deploy.sh
scp -o StrictHostKeyChecking=no "docker-compose.yml" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/docker-compose.yml
scp -o StrictHostKeyChecking=no "nginx\default.conf" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/nginx/default.conf
scp -o StrictHostKeyChecking=no "scripts\setup-vps.sh" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/scripts/setup-vps.sh
scp -o StrictHostKeyChecking=no "scripts\certbot-ssl.sh" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/scripts/certbot-ssl.sh

:: Upload environment variables
echo [4/5] Uploading secure environment credentials...
scp -o StrictHostKeyChecking=no "%LOCAL_ENV%" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/frontend/.env.local

:: Execute Remote Deployment
echo [5/5] Executing Remote Deployment script...
ssh -o StrictHostKeyChecking=no %VPS_USER%@%VPS_HOST% "chmod +x %PROJECT_DIR%/deploy.sh && chmod +x %PROJECT_DIR%/scripts/*.sh && %PROJECT_DIR%/deploy.sh"

echo.
echo ==================================================
echo ✅ Deployment Successful and Verified!
echo ==================================================
echo Done!
