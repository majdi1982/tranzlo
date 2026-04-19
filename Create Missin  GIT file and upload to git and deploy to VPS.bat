@echo off
setlocal EnableExtensions

REM ===== CHANGEABLE DEPLOY VARIABLES =====

REM Local project
set "LOCAL_PROJECT=D:\Tranzlo"

REM Git
set "GIT_NAME=majdi1982"
set "GIT_EMAIL=majdiaboalila1@gmail.com"
set "GIT_REMOTE=https://github.com/majdi1982/tranzlo.git"
set "GIT_BRANCH=main"

REM VPS
set "VPS_USER=root"
set "VPS_HOST=187.124.179.33"
set "VPS_REPO_DIR=/var/www/tranzlo"
set "VPS_APP_DIR=/var/www/tranzlo"

REM App
set "APP_NAME=tranzlo"
set "APP_PORT=3000"
set "NODE_ENV=production"

REM Optional local env paths
set "LOCAL_ENV_FILE=.env.local"
set "LOCAL_FRONTEND_ENV_FILE=frontend\.env.local"

REM ======================================

call :main
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo =========================================
echo Deploy script finished with code: %EXIT_CODE%
echo =========================================
echo.

if not "%EXIT_CODE%"=="0" (
    echo DEPLOY FAILED
) else (
    echo DEPLOY DONE
)

pause
exit /b %EXIT_CODE%

:main
echo ==================================================
echo START DEPLOY: %DATE% %TIME%
echo ==================================================

call :step "Check local project folder"
if not exist "%LOCAL_PROJECT%" (
    echo ERROR: Local project folder not found: %LOCAL_PROJECT%
    exit /b 1
)

cd /d "%LOCAL_PROJECT%"
if errorlevel 1 (
    echo ERROR: Failed to enter local project folder
    exit /b 1
)
echo OK: Current directory = %CD%

call :step "Check Git is installed"
git --version
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    exit /b 1
)

call :step "Check SSH is installed"
ssh -V
if errorlevel 1 (
    echo ERROR: SSH is not installed or not in PATH
    exit /b 1
)

call :step "Check SCP is installed"
where scp
if errorlevel 1 (
    echo ERROR: SCP is not installed or not in PATH
    exit /b 1
)
echo OK: SSH/SCP found

call :step "Check or create git repo"
if not exist ".git" (
    echo INFO: .git folder missing. Initializing repository...
    git init
    if errorlevel 1 (
        echo ERROR: git init failed
        exit /b 1
    )
) else (
    echo OK: Git repository already exists
)

call :step "Set Git identity"
git config user.name "%GIT_NAME%"
if errorlevel 1 (
    echo ERROR: Failed to set git user.name
    exit /b 1
)
git config user.email "%GIT_EMAIL%"
if errorlevel 1 (
    echo ERROR: Failed to set git user.email
    exit /b 1
)
echo OK: Git identity configured

call :step "Set branch"
git branch -M %GIT_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to set git branch to %GIT_BRANCH%
    exit /b 1
)
echo OK: Branch set to %GIT_BRANCH%

call :step "Check remote origin"
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo INFO: Origin missing. Adding %GIT_REMOTE%
    git remote add origin %GIT_REMOTE%
    if errorlevel 1 (
        echo ERROR: Failed to add git remote origin
        exit /b 1
    )
) else (
    echo OK: Origin already exists
)

call :step "Check package.json locally"
if exist "package.json" (
    echo OK: Found package.json in project root
) else if exist "frontend\package.json" (
    echo OK: Found frontend\package.json
) else (
    echo ERROR: No package.json found in root or frontend\
    exit /b 1
)

call :step "Git add"
git add .
if errorlevel 1 (
    echo ERROR: git add failed
    exit /b 1
)
echo OK: git add finished

call :step "Git commit if needed"
git diff --cached --quiet
if errorlevel 1 (
    echo INFO: Changes detected. Creating commit...
    git commit -m "deploy update"
    if errorlevel 1 (
        echo ERROR: git commit failed
        exit /b 1
    )
) else (
    echo OK: No changes to commit
)

call :step "Git push"
git push -u origin %GIT_BRANCH%
if errorlevel 1 (
    echo ERROR: git push failed
    exit /b 1
)
echo OK: git push finished

call :step "Create ecosystem.config.js"
(
echo module.exports = {
echo   apps: [
echo     {
echo       name: '%APP_NAME%',
echo       cwd: '%VPS_APP_DIR%',
echo       script: 'npm',
echo       args: 'start',
echo       env: {
echo         NODE_ENV: '%NODE_ENV%',
echo         PORT: %APP_PORT%
echo       },
echo       autorestart: true,
echo       time: true
echo     }
echo   ]
echo };
) > "%TEMP%\ecosystem.config.js"

if errorlevel 1 (
    echo ERROR: Failed to create temporary ecosystem.config.js
    exit /b 1
)
echo OK: Created %TEMP%\ecosystem.config.js

call :step "Test VPS SSH connection"
ssh %VPS_USER%@%VPS_HOST% "echo VPS SSH OK"
if errorlevel 1 (
    echo ERROR: SSH connection to VPS failed
    exit /b 1
)
echo OK: SSH connection works

call :step "Create VPS repo directory"
ssh %VPS_USER%@%VPS_HOST% "mkdir -p %VPS_REPO_DIR%"
if errorlevel 1 (
    echo ERROR: Failed to create VPS repo directory: %VPS_REPO_DIR%
    exit /b 1
)
echo OK: VPS repo directory ready

call :step "Upload ecosystem.config.js"
scp "%TEMP%\ecosystem.config.js" %VPS_USER%@%VPS_HOST%:%VPS_REPO_DIR%/ecosystem.config.js
if errorlevel 1 (
    echo ERROR: Failed to upload ecosystem.config.js
    exit /b 1
)
echo OK: ecosystem.config.js uploaded

call :step "Remote repo prepare"
ssh %VPS_USER%@%VPS_HOST% "bash -lc 'set -e; mkdir -p %VPS_REPO_DIR%; if [ ! -d %VPS_REPO_DIR%/.git ]; then git clone %GIT_REMOTE% %VPS_REPO_DIR%; fi; cd %VPS_REPO_DIR%; git fetch origin %GIT_BRANCH%; git reset --hard origin/%GIT_BRANCH%;'"
if errorlevel 1 (
    echo ERROR: Remote repo prepare failed
    exit /b 1
)
echo OK: Remote repo prepared

call :step "Upload .env if found"
if exist "%LOCAL_ENV_FILE%" (
    echo INFO: Uploading %LOCAL_ENV_FILE% to %VPS_APP_DIR%/.env
    scp "%LOCAL_ENV_FILE%" %VPS_USER%@%VPS_HOST%:%VPS_APP_DIR%/.env
    if errorlevel 1 (
        echo ERROR: Failed to upload %LOCAL_ENV_FILE%
        exit /b 1
    )
    echo OK: Uploaded %LOCAL_ENV_FILE%
) else if exist "%LOCAL_FRONTEND_ENV_FILE%" (
    echo INFO: Uploading %LOCAL_FRONTEND_ENV_FILE% to %VPS_APP_DIR%/.env
    scp "%LOCAL_FRONTEND_ENV_FILE%" %VPS_USER%@%VPS_HOST%:%VPS_APP_DIR%/.env
    if errorlevel 1 (
        echo ERROR: Failed to upload %LOCAL_FRONTEND_ENV_FILE%
        exit /b 1
    )
    echo OK: Uploaded %LOCAL_FRONTEND_ENV_FILE%
) else (
    echo WARNING: No local .env found. Skipping upload.
)

call :step "Remote build and PM2 restart"
ssh %VPS_USER%@%VPS_HOST% "bash -lc 'set -e; cd %VPS_APP_DIR%; [ -f package.json ] || { echo ERROR: package.json not found; exit 1; }; npm install; npm run build; pm2 restart %APP_NAME% --update-env || pm2 start %VPS_REPO_DIR%/ecosystem.config.js --only %APP_NAME%; pm2 save; pm2 list;'"
if errorlevel 1 (
    echo ERROR: Remote build or PM2 restart failed
    exit /b 1
)
echo OK: Remote build and PM2 restart done

call :step "Cleanup"
del "%TEMP%\ecosystem.config.js" >nul 2>&1
echo OK: Temporary files cleaned

echo ==================================================
echo DEPLOY SUCCESS: %DATE% %TIME%
echo ==================================================
exit /b 0

:step
echo.
echo --------------------------------------------------
echo [%DATE% %TIME%] %~1
echo --------------------------------------------------
exit /b 0