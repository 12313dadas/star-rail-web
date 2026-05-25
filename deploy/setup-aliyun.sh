#!/bin/bash
# 阿里云 Linux / CentOS / RHEL 一键初始化（Alibaba Cloud Linux 3 适用）
set -e

APP_DIR="/opt/star-rail-web"

echo "🚀 阿里云 Linux 服务器初始化..."

if command -v yum &>/dev/null; then
  PKG="yum"
elif command -v dnf &>/dev/null; then
  PKG="dnf"
else
  echo "❌ 未找到 yum/dnf，请确认是阿里云 Linux / CentOS 系统"
  exit 1
fi

$PKG install -y curl wget git nginx

# Node.js 20
if ! command -v node &>/dev/null; then
  echo "📦 安装 Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  $PKG install -y nodejs
fi

if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

# MySQL（阿里云可改用 RDS，此处为单机版）
if ! command -v mysql &>/dev/null; then
  $PKG install -y mysql-server || $PKG install -y mariadb-server
  systemctl enable mysqld 2>/dev/null || systemctl enable mariadb 2>/dev/null || true
  systemctl start mysqld 2>/dev/null || systemctl start mariadb 2>/dev/null || true
fi

mysql -e "CREATE DATABASE IF NOT EXISTS star_rail_web DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
mysql -e "CREATE USER IF NOT EXISTS 'star_rail'@'localhost' IDENTIFIED BY 'star_rail_pass';" 2>/dev/null || true
mysql -e "GRANT ALL PRIVILEGES ON star_rail_web.* TO 'star_rail'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || true

mkdir -p "$APP_DIR/uploads" "$APP_DIR/music"
chmod 755 "$APP_DIR/uploads"

# Nginx：阿里云 Linux 使用 conf.d
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/conf.d/star-rail.conf
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
nginx -t && systemctl enable nginx && systemctl restart nginx

# 防火墙（若启用了 firewalld）
if systemctl is-active firewalld &>/dev/null; then
  firewall-cmd --permanent --add-service=http
  firewall-cmd --permanent --add-service=https
  firewall-cmd --reload
fi

echo "⚠️  请在阿里云控制台 → 安全组 中放行 80 / 443 端口"

cd "$APP_DIR/backend"
cp .env.production .env
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts 2>/dev/null || true
npm run music:sync 2>/dev/null || true
npm run build

cd "$APP_DIR/frontend"
npm ci 2>/dev/null || npm install
npm run build

cd "$APP_DIR"
pm2 delete star-rail-api 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "✅ 部署完成！访问: http://$(curl -s ifconfig.me 2>/dev/null || echo '你的公网IP')"
