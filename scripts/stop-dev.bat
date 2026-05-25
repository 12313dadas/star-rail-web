@echo off
REM 关闭本地开发窗口，释放 Prisma 引擎文件锁（避免 EPERM）
taskkill /F /FI "WINDOWTITLE eq SR-Backend*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SR-Frontend*" /T >nul 2>&1
timeout /t 1 /nobreak >nul
