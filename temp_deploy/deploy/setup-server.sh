#!/bin/bash
set -e

echo "🚀 开始初始化服务器环境..."

# 1. 更新系统并安装依赖
apt-get update
apt-get install -y curl wget git nginx

# 2. 安装 Node.js 20
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 3. 安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 4. 安装 MySQL 8 (静默安装)
export DEBIAN_FRONTEND="noninteractive"
if ! command -v mysql &> /dev/null; then
    echo "📦 安装 MySQL..."
    apt-get install -y mysql-server
fi

# 5. 配置 MySQL
echo "⚙️ 配置 MySQL 数据库..."
systemctl start mysql
systemctl enable mysql

mysql -e "CREATE DATABASE IF NOT EXISTS star_rail_web DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'star_rail'@'localhost' IDENTIFIED BY 'star_rail_pass';"
mysql -e "GRANT ALL PRIVILEGES ON star_rail_web.* TO 'star_rail'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# 6. 设置应用目录
APP_DIR="/opt/star-rail-web"
echo "📂 设置应用目录 $APP_DIR..."
mkdir -p $APP_DIR/uploads
chmod 777 $APP_DIR/uploads

# 7. 配置 Nginx
echo "⚙️ 配置 Nginx..."
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/star-rail
ln -sf /etc/nginx/sites-available/star-rail /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
systemctl enable nginx

# 8. 安装后端依赖并初始化数据库
echo "⚙️ 初始化后端服务..."
cd $APP_DIR/backend
cp .env.production .env
npm ci --omit=dev || npm install
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts || echo "Seed failed, maybe already seeded."

# 9. 启动应用
echo "🚀 启动 PM2 进程..."
cd $APP_DIR
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "✅ 部署完成！"
echo "前端访问: http://47.103.215.35"
echo "后端状态: pm2 status"
