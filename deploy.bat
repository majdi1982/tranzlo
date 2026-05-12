@echo off
setlocal

set "VPS_HOST=187.124.179.33"
set "VPS_USER=root"
set "LOCAL_ENV=D:\Tranzlo\.env.local"
set "PROJECT_DIR=/root/tranzlo"
set "GIT_REPO=https://github.com/majdi1982/tranzlo.git"

echo ==========================================
echo     Tranzlo Full Deployment (Git + VPS)
echo ==========================================
echo.

:: التأكد من المجلد
cd /d %~dp0
echo Current Directory: %CD%

if not exist ".git" (
    echo Creating new Git repository...
    git init
    git branch -M main
    git remote add origin %GIT_REPO%
    git add .
    git commit -m "Initial commit"
)

echo.
echo [1/4] Checking for changes...
git status

echo.
echo [2/4] Adding and committing changes...
git add .
git commit -m "Update %DATE% %TIME%" || echo No new changes to commit.

echo.
echo [3/4] Pushing to GitHub...
git push -u origin main || git push origin main

if %errorlevel% neq 0 (
    echo Warning: Push failed or no changes
)

echo.
echo [4/4] Uploading .env.local and deploying on VPS...
scp "%LOCAL_ENV%" %VPS_USER%@%VPS_HOST%:%PROJECT_DIR%/.env.local

ssh %VPS_USER%@%VPS_HOST% "cd %PROJECT_DIR% && ./deploy.sh"

echo.
echo ==========================================
echo ✅ Deployment Completed!
echo ==========================================
pause