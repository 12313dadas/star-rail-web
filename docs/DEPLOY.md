# 部署与开发工作流

## 推荐做法：本地开发 → 确认后部署

| 环境 | 用途 | 地址 |
|------|------|------|
| **本地** | 日常开发、调试、试功能 | http://localhost:5173 |
| **服务器** | 正式对外访问 | http://47.103.215.35 |

**不要在服务器上直接改代码。** 本地改好、测试通过，再一键部署到服务器。这样：

- 本地挂了不影响线上访客
- 可以随便试错、回滚
- 数据库、上传文件与线上隔离

---

## 三种「本地开发 + 服务器更新」的方式

### 方式 A：手动部署（最简单，推荐新手）

```powershell
# 1. 本地开发测试
npm run dev:backend
npm run dev:frontend

# 2. 满意后，一键部署到服务器（需先设置密码，不要提交到 Git）
$env:DEPLOY_PASSWORD="你的SSH密码"
node scripts/deploy-remote.mjs
```

脚本会：打包代码 → 上传到 `/opt/star-rail-web` → 构建前后端 → 重启 PM2。

### 方式 B：Git 自动部署（已配置，推荐）

项目已包含 `.github/workflows/deploy.yml`。将代码 push 到 `main` 分支后，GitHub Actions 会自动 SSH 到服务器执行更新。

**首次配置 GitHub Secrets：**

| Secret | 值 |
|--------|-----|
| `DEPLOY_HOST` | `47.103.215.35` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_PASSWORD` | 你的 SSH 密码 |

### 方式 C：Git 推送 + 服务器手动拉取

1. 代码推到 GitHub/Gitee 私有仓库
2. 服务器 `/opt/star-rail-web` 里 `git clone` 一次
3. 以后本地 `git push`，服务器执行：

```bash
bash /opt/star-rail-web/deploy/update.sh
```

可配合 GitHub Actions：每次 push 到 `main` 自动 SSH 到服务器跑 `update.sh`。

### 方式 C：实时同步（开发期「准实时」）

适合你想**本地保存文件后，几秒内服务器也更新**的场景：

| 工具 | 说明 |
|------|------|
| **Cursor / VS Code Remote SSH** | 直接连服务器编辑（适合小改，不推荐当主开发环境） |
| **Mutagen / rsync 监听** | 本地保存 → 自动 rsync 到服务器 → 服务器 `pm2 restart` |
| **npm run dev 仅本地** | 前端热更新只在本地；服务器仍用方式 A/B 部署构建产物 |

没有真正的「本地 dev server 热更新同时映射到公网 IP」——那是两个不同环境。常见做法是：

- **本地**：`vite` 热更新，改完即看
- **服务器**：部署 **build 后的静态文件 + PM2 后端**，更新需重新 build（约 1～2 分钟）

---

## 阿里云 Linux 首次部署

SSH 登录服务器后：

```bash
# 若已有代码在 /opt/star-rail-web
cd /opt/star-rail-web
chmod +x deploy/setup-aliyun.sh
bash deploy/setup-aliyun.sh
```

**阿里云控制台还需检查：**

1. **安全组** → 入方向放行 **80**、**443**（以及 22 SSH）
2. 系统防火墙若开了 firewalld，脚本会尝试放行 http

---

## 日常更新（服务器上已有项目）

```bash
bash /opt/star-rail-web/deploy/update.sh
```

或在 Windows 本地：

```powershell
$env:DEPLOY_PASSWORD="你的密码"
node scripts/deploy-remote.mjs
```

---

## 音乐文件同步

把 `.flac` / `.mp3` 放进项目 `music/` 目录，部署时会一并上传。更新后自动执行：

```bash
npm run music:sync
```

---

## 安全提醒

- **切勿**把 SSH 密码写进代码或提交 Git（已删除旧的 `check-server.mjs` 明文密码）
- 建议改用 **SSH 密钥登录**，并修改 root 密码
- 在聊天里发过的密码建议尽快在阿里云控制台改掉

---

## 环境变量（部署脚本）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DEPLOY_HOST` | 47.103.215.35 | 服务器 IP |
| `DEPLOY_USER` | root | SSH 用户 |
| `DEPLOY_PASSWORD` | （必填或改用密钥） | SSH 密码 |
| `DEPLOY_USE_KEY` | - | 设为 `1` 时使用本机 SSH 密钥 |
| `DEPLOY_APP_DIR` | /opt/star-rail-web | 服务器项目路径 |
