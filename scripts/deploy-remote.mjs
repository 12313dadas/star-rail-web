/**
 * 从本地一键同步代码到服务器并执行更新
 *
 * 用法（PowerShell，不要写进代码仓库）：
 *   $env:DEPLOY_HOST="47.103.215.35"
 *   $env:DEPLOY_USER="root"
 *   $env:DEPLOY_PASSWORD="你的密码"
 *   node scripts/deploy-remote.mjs
 *
 * 更推荐：配置 SSH 密钥后无需密码
 *   ssh-copy-id root@47.103.215.35
 */
import { Client } from 'ssh2';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const HOST = process.env.DEPLOY_HOST || '47.103.215.35';
const USER = process.env.DEPLOY_USER || 'root';
const PASSWORD = process.env.DEPLOY_PASSWORD;
const PORT = Number(process.env.DEPLOY_PORT || 22);
const APP_DIR = process.env.DEPLOY_APP_DIR || '/opt/star-rail-web';

if (!PASSWORD && !process.env.DEPLOY_USE_KEY) {
  console.error('请设置环境变量 DEPLOY_PASSWORD，或配置 DEPLOY_USE_KEY=1 使用 SSH 密钥');
  process.exit(1);
}

const EXCLUDE = [
  'node_modules', '.git', 'frontend/dist', 'backend/dist',
  'backend/prisma/dev.db', 'backend/prisma/dev.db-journal',
  '.env', 'temp_deploy', '*.log',
];

function createTarball() {
  const tarPath = path.join(ROOT, '.deploy-bundle.tar.gz');
  const excludeArgs = EXCLUDE.flatMap((e) => ['--exclude', e]);
  console.log('📦 打包项目...');
  execSync(
    ['tar', '-czf', tarPath, ...excludeArgs, '-C', ROOT, '.'].join(' '),
    { stdio: 'inherit', shell: true }
  );
  return tarPath;
}

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const opts = {
      host: HOST,
      port: PORT,
      username: USER,
      ...(PASSWORD ? { password: PASSWORD } : {}),
    };
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.connect(opts);
  });
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d) => { out += d; process.stdout.write(d); });
      stream.stderr.on('data', (d) => process.stderr.write(d));
      stream.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`exit ${code}`))));
    });
  });
}

function uploadSftp(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const rs = fs.createReadStream(localPath);
      const ws = sftp.createWriteStream(remotePath);
      ws.on('close', resolve);
      ws.on('error', reject);
      rs.pipe(ws);
    });
  });
}

async function main() {
  const tarPath = createTarball();
  const conn = await connect();
  console.log(`✅ 已连接 ${HOST}`);

  await exec(conn, `mkdir -p ${APP_DIR}`);
  console.log('📤 上传代码包...');
  await uploadSftp(conn, tarPath, '/tmp/star-rail-deploy.tar.gz');
  await exec(conn, `
    cd ${APP_DIR} && tar -xzf /tmp/star-rail-deploy.tar.gz && rm -f /tmp/star-rail-deploy.tar.gz
    sed -i 's/\\r$//' deploy/*.sh 2>/dev/null || sed -i '' 's/\\r$//' deploy/*.sh 2>/dev/null || true
    chmod +x deploy/update.sh deploy/setup-aliyun.sh 2>/dev/null || true
    bash deploy/update.sh
  `);

  fs.unlinkSync(tarPath);
  conn.end();
  console.log(`\n🎉 部署完成！访问 http://${HOST}`);
}

main().catch((e) => {
  console.error('部署失败:', e.message);
  process.exit(1);
});
