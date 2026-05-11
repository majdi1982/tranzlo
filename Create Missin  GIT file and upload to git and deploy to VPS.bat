@echo off
setlocal

REM ===== CONFIG =====
set REPO_DIR=/var/www/tranzlo
set VPS_USER=root
set VPS_HOST=187.124.179.33
set BRANCH=main

echo ================================
echo PUSH TO GIT
echo ================================

git add .
git commit -m "auto deploy"
git push origin %BRANCH%

if errorlevel 1 (
    echo ERROR: Git push failed
    exit /b 1
)

echo.
echo ================================
echo DEPLOY TO VPS
echo ================================

ssh %VPS_USER%@%VPS_HOST% ^
"bash -lc 'cd %REPO_DIR% && git pull origin %BRANCH% && docker compose down && docker compose up -d --build'"

if errorlevel 1 (
    echo ERROR: VPS deploy failed
    exit /b 1
)

echo.
echo ================================
echo DEPLOY SUCCESS
echo ================================

pause