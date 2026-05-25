#!/bin/bash
# 服务器上执行：拉取最新代码并重启（日常更新用）
set -e

APP_DIR="/opt/star-rail-web"
cd "$APP_DIR"

echo "📥 更新代码..."
if [ -d .git ]; then
  git pull --ff-only
else
  echo "⚠️  非 Git 目录，请先用 deploy-from-local 同步代码"
fi

echo "🔨 构建前端..."
cd frontend
npm ci 2>/dev/null || npm install
npm run build

echo "🔨 构建后端..."
cd ../backend
npm ci 2>/dev/null || npm install
cp .env.production .env 2>/dev/null || true
npx prisma generate --schema prisma/schema.mysql.prisma
npx prisma db push --schema prisma/schema.mysql.prisma --accept-data-loss --accept-data-loss
npm run build
npm run music:sync 2>/dev/null || true
npm run characters:seed 2>/dev/null || true
npm run characters:cache 2>/dev/null || true

echo "⚙️ 更新 Nginx 配置..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/conf.d/star-rail.conf 2>/dev/null || \
  cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/star-rail 2>/dev/null || true

echo "🔄 重启服务..."
cd "$APP_DIR"
pm2 restart star-rail-api || pm2 start deploy/ecosystem.config.cjs --env production
nginx -t && systemctl reload nginx

echo "✅ 更新完成 $(date)"
