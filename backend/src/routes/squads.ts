import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authRequired, type AuthRequest } from '../middleware/auth.js';
import { uploadVideo, getUploadUrl } from '../middleware/upload.js';
import {
  mapCharacterForClient,
  readCachedAvatarMeta,
  resolveAvatarBuffer,
} from '../services/characterAssets.js';

const router = Router();

const squadSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  scenario: z.string().max(120).optional().nullable(),
  tags: z.string().max(300).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  videoTitle: z.string().max(200).optional().nullable(),
  char1Id: z.number(),
  char2Id: z.number(),
  char3Id: z.number(),
  char4Id: z.number(),
});

const userSelect = { id: true, nickname: true, avatar: true, username: true };
const charInclude = {
  id: true,
  gameId: true,
  name: true,
  rarity: true,
  element: true,
  path: true,
  region: true,
  icon: true,
  preview: true,
};

/** 立绘代理：服务器拉取并缓存，避免浏览器直连 GitHub 失败 */
router.get('/avatar/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    if (!/^\d{4}$/.test(gameId)) {
      return res.status(400).json({ error: '无效角色 ID' });
    }

    const resolved = await resolveAvatarBuffer(gameId);
    if (!resolved) {
      return res.status(404).json({ error: '立绘不可用' });
    }

    res.setHeader('Content-Type', resolved.kind === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    const kind = readCachedAvatarMeta(gameId);
    if (kind) res.setHeader('X-Avatar-Kind', kind);
    res.send(resolved.buf);
  } catch (err) {
    next(err);
  }
});

router.get('/characters', async (req, res, next) => {
  try {
    const element = req.query.element as string | undefined;
    const path = req.query.path as string | undefined;
    const region = req.query.region as string | undefined;
    const rarity = req.query.rarity ? Number(req.query.rarity) : undefined;
    const q = (req.query.q as string | undefined)?.trim();

    const characters = await prisma.character.findMany({
      where: {
        ...(element ? { element } : {}),
        ...(path ? { path } : {}),
        ...(region ? { region } : {}),
        ...(rarity ? { rarity } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { element: { contains: q } },
                { path: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ rarity: 'desc' }, { name: 'asc' }],
    });
    res.json(characters.map(mapCharacterForClient));
  } catch (err) {
    next(err);
  }
});

router.post('/upload-video', authRequired, uploadVideo.single('video'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: '未上传视频' });
  res.json({ url: getUploadUrl(file.filename), filename: file.filename });
});

router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const q = (req.query.q as string | undefined)?.trim();

    const where = q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
            { scenario: { contains: q } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.squad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: userSelect },
          char1: { select: charInclude },
          char2: { select: charInclude },
          char3: { select: charInclude },
          char4: { select: charInclude },
        },
      }),
      prisma.squad.count({ where }),
    ]);

    res.json({
      items: items.map((s) => ({
        ...s,
        char1: mapCharacterForClient(s.char1),
        char2: mapCharacterForClient(s.char2),
        char3: mapCharacterForClient(s.char3),
        char4: mapCharacterForClient(s.char4),
      })),
      total,
      page,
      hasMore: skip + items.length < total,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = squadSchema.parse(req.body);
    const ids = [data.char1Id, data.char2Id, data.char3Id, data.char4Id];
    if (new Set(ids).size !== 4) {
      return res.status(400).json({ error: '四名角色不能重复' });
    }

    const squad = await prisma.squad.create({
      data: { ...data, authorId: req.user!.id },
      include: {
        author: { select: userSelect },
        char1: { select: charInclude },
        char2: { select: charInclude },
        char3: { select: charInclude },
        char4: { select: charInclude },
      },
    });
    res.status(201).json({
      ...squad,
      char1: mapCharacterForClient(squad.char1),
      char2: mapCharacterForClient(squad.char2),
      char3: mapCharacterForClient(squad.char3),
      char4: mapCharacterForClient(squad.char4),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const squad = await prisma.squad.findUnique({
      where: { id },
      include: {
        author: { select: userSelect },
        char1: { select: charInclude },
        char2: { select: charInclude },
        char3: { select: charInclude },
        char4: { select: charInclude },
      },
    });

    if (!squad) return res.status(404).json({ error: '阵容不存在' });

    await prisma.squad.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      ...squad,
      viewCount: squad.viewCount + 1,
      char1: mapCharacterForClient(squad.char1),
      char2: mapCharacterForClient(squad.char2),
      char3: mapCharacterForClient(squad.char3),
      char4: mapCharacterForClient(squad.char4),
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/video', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const squad = await prisma.squad.findUnique({ where: { id } });
    if (!squad) return res.status(404).json({ error: '阵容不存在' });
    if (squad.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权修改' });
    }

    const body = z
      .object({
        videoUrl: z.string().min(1).max(500),
        videoTitle: z.string().max(200).optional().nullable(),
      })
      .parse(req.body);

    const updated = await prisma.squad.update({
      where: { id },
      data: body,
      include: {
        author: { select: userSelect },
        char1: { select: charInclude },
        char2: { select: charInclude },
        char3: { select: charInclude },
        char4: { select: charInclude },
      },
    });
    res.json({
      ...updated,
      char1: mapCharacterForClient(updated.char1),
      char2: mapCharacterForClient(updated.char2),
      char3: mapCharacterForClient(updated.char3),
      char4: mapCharacterForClient(updated.char4),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
