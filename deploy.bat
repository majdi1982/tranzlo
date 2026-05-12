@echo off
setlocal

set "VPS_HOST=187.124.179.33"
set "VPS_USER=root"
set "LOCAL_ENV=D:\Tranzlo\.env.local"     REM ← غيّر المسار إذا لزم الأمر
set "PROJECT_DIR=/root/tranzlo"
set "GIT_REPO=https://github.com/majdi1982/tranzlo.git"

echo ==========================================
echo     Tranzlo Full Deployment (Git + VPS)
echo ==========================================
echo.

:: 1. Commit and Push to GitHub
echo [1/4] Checking Git status...
cd /d %~dp0

if not exist ".git" (
    echo Creating new Git repository...
    git init
    git branch -M main
    git remote add origin %GIT_REPO%
)

git add .
git commit -m "Update %DATE% %TIME%" || echo No changes to commit.

echo Pushing to GitHub...
git push -u origin main || git push origin main

if %errorlevel% neq 0 (
    echo Warning: Could not push to GitHub (maybe already up to date)
)

echo.
echo [2/4] Uploading .env.local to VPS...
scp "%LOCAL_ENV%" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/.env.local

if %errorlevel% neq 0 (
    echo ❌ Failed to upload .env.local
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying on VPS...
ssh %VPS_USER%@%VPS_HOST% "cd %PROJECT_DIR% && ./deploy.sh"

echo.
echo ==========================================
echo ✅ Full Deployment Completed!
echo ==========================================
echo GitHub Updated + VPS Deployed
echo Check: https://tranzlo.net
echo.

pause