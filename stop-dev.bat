@echo off
setlocal
title Star Rail Web - Stop Dev
cd /d "%~dp0"

echo.
echo  Stopping processes on ports 3001 and 5173...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo  Killed PID %%a port 3001
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    echo  Killed PID %%a port 5173
)

echo.
echo  Done. Or close SR-Backend / SR-Frontend windows manually.
echo.
pause
endlocal
