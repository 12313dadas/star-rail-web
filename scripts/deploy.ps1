# 一键部署到阿里云服务器
# 用法:
#   $env:DEPLOY_PASSWORD = "你的SSH密码"
#   .\scripts\deploy.ps1

param(
  [string]$DeployHost = $env:DEPLOY_HOST,
  [string]$Password = $env:DEPLOY_PASSWORD
)

if (-not $Password) {
  Write-Host "请先设置部署密码:" -ForegroundColor Yellow
  Write-Host '  $env:DEPLOY_PASSWORD = "你的SSH密码"' -ForegroundColor White
  Write-Host "  .\scripts\deploy.ps1" -ForegroundColor White
  Write-Host ""
  Write-Host "或使用 SSH 密钥: `$env:DEPLOY_USE_KEY = '1'" -ForegroundColor Gray
  exit 1
}

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $DeployHost) { $env:DEPLOY_HOST = "47.103.215.35" }

Write-Host "正在部署到 $env:DEPLOY_HOST ..." -ForegroundColor Cyan
node scripts/deploy-remote.mjs

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "部署成功! http://$env:DEPLOY_HOST" -ForegroundColor Green
}
