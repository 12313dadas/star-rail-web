# 星穹铁道 · 个人内容管理平台

面向《崩坏：星穹铁道》玩家的个人网站，集攻略发布、说说动态、相册、留言板与音乐播放于一体。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + TypeScript + Tailwind CSS |
| 后端 | Node.js + Express 5 + TypeScript |
| 数据库 | MySQL 8 + Prisma ORM |
| 认证 | JWT |

## 功能模块

### 前台
- **动态流** — 瀑布流布局，无限滚动，聚合说说与攻略
- **说说** — 文字 + 最多 9 图 + 音乐，评论/点赞
- **攻略博客** — Markdown/HTML 文章，分类与标签
- **相册** — 图片懒加载 + Lightbox 预览
- **个人信息页** — 简介与时间线归档
- **留言板** — 访客可留言
- **全局搜索** — 搜索文章与说说
- **音乐播放器** — 右下角悬浮 BGM，支持 `music/` 目录本地音频
- **阵容广场** — 拖拽编队、分享阵容

### 后台（管理员）
- 文章 / 说说 CRUD
- 评论审核
- 用户角色管理
- 音乐歌单管理

## 快速开始

默认使用 **SQLite**（无需 Docker），开箱即用。生产环境可切换为 MySQL（见 `docker-compose.yml`）。

```bash
npm run install:all
```

### 2. 配置环境变量（可选）

```bash
copy backend\.env.example backend\.env
```

### 3. 初始化数据库

```bash
npm run db:push
npm run db:seed
```

> 若已安装 Docker，可运行 `npm run db:up` 启动 MySQL，并将 `backend/prisma/schema.prisma` 的 provider 改为 `mysql`，`.env` 中使用 MySQL 连接串。

### 4. 启动开发服务器

终端 1 — 后端（端口 3001）：
```bash
npm run dev:backend
```

终端 2 — 前端（端口 5173）：
```bash
npm run dev:frontend
```

访问 http://localhost:5173

### 本地 BGM 配置

将 `.mp3` / `.flac` 等音频文件放入项目根目录的 `music/` 文件夹，然后执行：

```bash
npm run music:sync
```

当前已配置：**HOYO-MiX - Da Capo.flac**。播放器会自动读取并单曲循环播放。

### 演示账号
- 用户名：`admin`
- 密码：`admin123`

## 项目结构

```
personal_web/
├── backend/          # Express API + Prisma
├── frontend/         # React 前端
├── music/            # 本地 BGM 音频（自动同步到播放器）
├── docker-compose.yml
└── README.md
```

## API 概览

| 路径 | 说明 |
|------|------|
| `/api/auth` | 注册、登录 |
| `/api/feed` | 动态流 |
| `/api/posts` | 攻略文章 |
| `/api/moments` | 说说 |
| `/api/comments` | 评论 |
| `/api/likes` | 点赞 |
| `/api/albums` | 相册 |
| `/api/guestbook` | 留言板 |
| `/api/music` | 音乐播放列表 / 本地同步 |
| `/api/squads` | 阵容广场 |
| `/api/search` | 搜索 |
| `/api/upload` | 文件上传 |

## 部署建议

1. 购买云服务器 + 域名
2. 使用 Nginx 反向代理前端静态文件与 `/api`
3. 将图片上传迁移至对象存储（阿里云 OSS / 七牛云）
4. 修改 `JWT_SECRET` 为强随机字符串
5. 开启 `COMMENT_REQUIRE_APPROVAL=true` 启用评论审核

## 本地开发（一键启动）

**双击 `启动本地开发.bat` 或 `start-dev.bat`** 即可（会自动开两个窗口：后端 + 前端）。脚本为纯英文输出，避免 Windows 控制台中文乱码。

或用命令行：

```powershell
npm run dev
```

- 前端：http://localhost:5173  
- 后端：http://localhost:3001  
- 停止服务：双击 `停止本地开发.bat`，或直接关掉两个「星穹空间」窗口  

本地改代码可即时预览，**不影响线上服务器**。

## 部署到服务器

```powershell
$env:DEPLOY_PASSWORD="你的SSH密码"
npm run deploy
# 或
npm run deploy:ps1
```

### Git 自动部署

推送到 `main` 分支后自动部署。在 GitHub → Settings → Secrets 配置 `DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_PASSWORD`。详见 `docs/DEPLOY.md`。

## 后续迭代

- [ ] 富文本/Markdown 可视化编辑器（后台写文章）
- [ ] QQ 音乐 API 集成（搜索歌曲、歌词同步）
- [ ] 阵容推荐广场
- [ ] 三月七小助手（游戏日常提醒）
