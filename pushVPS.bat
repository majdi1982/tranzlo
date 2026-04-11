@echo off
setlocal

REM ===== CHANGE THESE IF NEEDED =====
set "LOCAL_PROJECT=D:\tranzlo"
set "GIT_NAME=majdi1982"
set "GIT_EMAIL=majdiaboalila1@gmail.com"
set "VPS_USER=root"
set "VPS_HOST=187.124.179.33"
set "VPS_APP_DIR=/var/www/tranzlo"
set "GIT_BRANCH=main"
set "APP_NAME=tranzlo"
set "APP_PORT=3000"
REM ==================================

cd /d "%LOCAL_PROJECT%" || goto :error

echo.
echo [1/7] Set Git name and email
git config user.name "%GIT_NAME%"
git config user.email "%GIT_EMAIL%"
if errorlevel 1 goto :error

echo.
echo [2/7] Force branch name to main
git branch -M %GIT_BRANCH%
if errorlevel 1 goto :error

echo.
echo [3/7] Git add
git add .
if errorlevel 1 goto :error

echo.
echo [4/7] Git commit if needed
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "update"
    if errorlevel 1 goto :error
) else (
    echo No changes to commit.
)

echo.
echo [5/7] Git push
git push --force-with-lease origin %GIT_BRANCH%
if errorlevel 1 goto :error

echo.
echo [6/7] Build PM2 config file
(
echo module.exports = {
echo   apps: [
echo     {
echo       name: '%APP_NAME%',
echo       cwd: '%VPS_APP_DIR%',
echo       script: 'npm',
echo       args: 'start',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: %APP_PORT%
echo       },
echo       autorestart: true,
echo       time: true
echo     }
echo   ]
echo };
) > "%TEMP%\ecosystem.config.js"
if errorlevel 1 goto :error

echo.
scp "%TEMP%\ecosystem.config.js" %VPS_USER%@%VPS_HOST%:%VPS_APP_DIR%/ecosystem.config.js
if errorlevel 1 goto :error

echo.
echo [7.1/7] Upload .env.local to VPS
scp ".env.local" %VPS_USER%@%VPS_HOST%:%VPS_APP_DIR%/.env.local
if errorlevel 1 echo Warning: .env.local upload failed. Make sure .env.local exists locally.

ssh %VPS_USER%@%VPS_HOST% "set -e; cd %VPS_APP_DIR%; git fetch origin %GIT_BRANCH%; git reset --hard origin/%GIT_BRANCH%; npm install --legacy-peer-deps; npm run build; pm2 restart %APP_NAME% --update-env || pm2 start ecosystem.config.js --only %APP_NAME%; pm2 save"
if errorlevel 1 goto :error

del "%TEMP%\ecosystem.config.js" >nul 2>&1

echo.
echo DONE SUCCESSFULLY
pause
exit /b 0

:error
echo.
echo DEPLOY FAILED
pause
exit /b 1