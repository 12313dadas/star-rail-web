/**
 * 远程执行服务器更新命令（不打包上传，仅重启/迁移）
 * 环境变量同 deploy-remote.mjs
 */
import { Client } from 'ssh2';

const HOST = process.env.DEPLOY_HOST || '47.103.215.35';
const USER = process.env.DEPLOY_USER || 'root';
const PASSWORD = process.env.DEPLOY_PASSWORD;
const APP_DIR = process.env.DEPLOY_APP_DIR || '/opt/star-rail-web';

if (!PASSWORD && !process.env.DEPLOY_USE_KEY) {
  console.error('请设置 DEPLOY_PASSWORD 或 DEPLOY_USE_KEY=1');
  process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`bash ${APP_DIR}/deploy/update.sh`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end());
    stream.on('data', (d) => process.stdout.write(d));
    stream.stderr.on('data', (d) => process.stderr.write(d));
  });
}).connect({
  host: HOST,
  port: Number(process.env.DEPLOY_PORT || 22),
  username: USER,
  ...(PASSWORD ? { password: PASSWORD } : {}),
});
