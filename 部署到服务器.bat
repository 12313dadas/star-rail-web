@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  星穹空间 — 部署到 http://47.103.215.35
echo  需要服务器 SSH 密码（不会写入文件）
echo.
set /p DEPLOY_PASSWORD=请输入 SSH 密码: 
if "%DEPLOY_PASSWORD%"=="" (
  echo 未输入密码，已取消。
  pause
  exit /b 1
)
set DEPLOY_HOST=47.103.215.35
set DEPLOY_USER=root
node scripts/deploy-remote.mjs
echo.
if %ERRORLEVEL% equ 0 (
  echo 部署成功，可访问 http://47.103.215.35
) else (
  echo 部署失败，请检查密码与网络。
)
pause
