# 本地一键开发：同时启动后端 + 前端
# 用法: .\scripts\dev.ps1

$Root = Split-Path -Parent $PSScriptRoot
Write-Host ""
Write-Host "  星穹空间 - 本地开发模式" -ForegroundColor Cyan
Write-Host "  前端: http://localhost:5173" -ForegroundColor Gray
Write-Host "  后端: http://localhost:3001" -ForegroundColor Gray
Write-Host ""

$backend = Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Root\backend'; Write-Host '>>> Backend API' -ForegroundColor Magenta; npm run dev"
) -PassThru

Start-Sleep -Seconds 1

$frontend = Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Root\frontend'; Write-Host '>>> Frontend Vite' -ForegroundColor Yellow; npm run dev"
) -PassThru

Write-Host "已启动两个终端窗口（后端 PID $($backend.Id)，前端 PID $($frontend.Id)）" -ForegroundColor Green
Write-Host "关闭对应窗口即可停止服务。" -ForegroundColor Gray
