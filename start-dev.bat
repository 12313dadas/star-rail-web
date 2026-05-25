@echo off
setlocal
title Star Rail Web - Dev Launcher
cd /d "%~dp0"

echo.
echo  ========================================
echo    Star Rail Web - Local Dev
echo  ========================================
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo    Login:    admin / admin123
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

if not exist "%~dp0backend\node_modules\" (
    echo [INFO] First run: installing dependencies...
    call npm run install:all
    if errorlevel 1 (
        echo [ERROR] install failed
        pause
        exit /b 1
    )
    echo.
)

if not exist "%~dp0frontend\node_modules\" (
    echo [INFO] Installing frontend dependencies...
    pushd "%~dp0frontend"
    call npm install
    popd
)

echo [0/3] Stopping old dev servers (if any)...
call "%~dp0scripts\stop-dev.bat"

echo [1/3] Preparing local database...
pushd "%~dp0backend"
if not exist "node_modules\.prisma\client\query_engine-windows.dll.node" (
    echo [INFO] First run: full Prisma setup...
    call npm run db:setup
) else (
    call npm run dev:prepare
)
popd
echo.

echo [2/3] Starting backend...
start "SR-Backend" cmd /k cd /d "%~dp0backend" ^&^& npm run dev

timeout /t 2 /nobreak >nul

echo [3/3] Starting frontend...
start "SR-Frontend" cmd /k cd /d "%~dp0frontend" ^&^& npm run dev

echo.
echo  Two windows opened: SR-Backend and SR-Frontend
echo  Open browser: http://localhost:5173
echo  Close those windows to stop servers.
echo.
timeout /t 5 >nul
endlocal
