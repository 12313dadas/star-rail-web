/**
 * 从本地或 GitHub Actions 一键部署到服务器
 *
 * 环境变量:
 *   DEPLOY_HOST, DEPLOY_USER, DEPLOY_PASSWORD (必填其一: 密码或 DEPLOY_USE_KEY=1)
 *   DEPLOY_APP_DIR (默认 /opt/star-rail-web)
 */
import { Client } from 'ssh2';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const HOST = (process.env.DEPLOY_HOST || '47.103.215.35').trim();
const USER = (process.env.DEPLOY_USER || 'root').trim();
const PASSWORD = process.env.DEPLOY_PASSWORD?.trim();
const PORT = Number(process.env.DEPLOY_PORT || 22);
const APP_DIR = (process.env.DEPLOY_APP_DIR || '/opt/star-rail-web').trim();

if (!PASSWORD && !process.env.DEPLOY_USE_KEY) {
  console.error('❌ 缺少 DEPLOY_PASSWORD');
  console.error('   请在 GitHub → Settings → Secrets → Actions 中添加 DEPLOY_PASSWORD');
  process.exit(1);
}

const EXCLUDE = [
  'node_modules',
  '.git',
  '.github',
  'frontend/dist',
  'backend/dist',
  'backend/node_modules',
  'frontend/node_modules',
  'backend/prisma/dev.db',
  'backend/prisma/dev.db-journal',
  '.env',
  '.env.local',
  'temp_deploy',
  '.deploy-bundle.tar.gz',
  '*.log',
];

function createTarball() {
  const tarPath = path.join(ROOT, '.deploy-bundle.tar.gz');
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

  const args = ['-czf', tarPath];
  for (const pattern of EXCLUDE) {
    args.push('--exclude', pattern);
  }
  args.push('-C', ROOT, '.');

  console.log('📦 打包项目...');
  const result = spawnSync('tar', args, { encoding: 'utf8' });

  // Linux tar 在文件变化时会返回 1，但包通常仍可用
  if (result.status !== 0 && result.status !== 1) {
    console.error(result.stderr || result.stdout);
    throw new Error(`tar 打包失败 (exit ${result.status})`);
  }

  if (!fs.existsSync(tarPath)) {
    throw new Error('tar 未生成打包文件');
  }

  const sizeMB = (fs.statSync(tarPath).size / 1024 / 1024).toFixed(2);
  console.log(`✅ 打包完成 (${sizeMB} MB)`);
  return tarPath;
}

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', (err) => reject(new Error(`SSH 连接失败: ${err.message}`)));
    conn.connect({
      host: HOST,
      port: PORT,
      username: USER,
      password: PASSWORD,
      readyTimeout: 30000,
      tryKeyboard: true,
    });
  });
}

function exec(conn, cmd, label = '') {
  return new Promise((resolve, reject) => {
    if (label) console.log(`▶ ${label}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stderr = '';
      stream.on('data', (d) => process.stdout.write(d));
      stream.stderr.on('data', (d) => {
        stderr += d;
        process.stderr.write(d);
      });
      stream.on('close', (code) => {
        if (code === 0) resolve('');
        else reject(new Error(`${label || '远程命令'} 失败 (exit ${code})\n${stderr}`));
      });
    });
  });
}

function uploadSftp(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const rs = fs.createReadStream(localPath);
      const ws = sftp.createWriteStream(remotePath);
      let transferred = 0;
      const total = fs.statSync(localPath).size;
      rs.on('data', (chunk) => {
        transferred += chunk.length;
        if (transferred % (5 * 1024 * 1024) < chunk.length) {
          console.log(`   上传进度 ${Math.round((transferred / total) * 100)}%`);
        }
      });
      ws.on('close', resolve);
      ws.on('error', reject);
      rs.on('error', reject);
      rs.pipe(ws);
    });
  });
}

async function main() {
  console.log(`🎯 目标: ${USER}@${HOST}:${APP_DIR}`);

  const tarPath = createTarball();
  const conn = await connect();
  console.log(`✅ SSH 已连接`);

  await exec(conn, `mkdir -p ${APP_DIR}`, '创建目录');

  console.log('📤 上传代码包...');
  await uploadSftp(conn, tarPath, '/tmp/star-rail-deploy.tar.gz');

  const remoteScript = [
    `cd ${APP_DIR}`,
    'tar -xzf /tmp/star-rail-deploy.tar.gz',
    'rm -f /tmp/star-rail-deploy.tar.gz',
    "sed -i 's/\\r$//' deploy/*.sh 2>/dev/null || true",
    'chmod +x deploy/update.sh deploy/setup-aliyun.sh 2>/dev/null || true',
    'bash deploy/update.sh',
  ].join(' && ');

  await exec(conn, remoteScript, '远程构建并重启');

  fs.unlinkSync(tarPath);
  conn.end();
  console.log(`\n🎉 部署完成！http://${HOST}`);
}

main().catch((e) => {
  console.error('\n❌ 部署失败:', e.message);
  process.exit(1);
});
