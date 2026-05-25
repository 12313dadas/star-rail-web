import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const squadSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  char1Id: z.number(),
  char2Id: z.number(),
  char3Id: z.number(),
  char4Id: z.number(),
});

const userSelect = { id: true, nickname: true, avatar: true, username: true };
const charInclude = { id: true, name: true, rarity: true, element: true, path: true, icon: true };

// 获取所有角色
router.get('/characters', async (_req, res, next) => {
  try {
    const characters = await prisma.character.findMany({
      orderBy: [
        { rarity: 'desc' },
        { name: 'asc' }
      ],
    });
    res.json(characters);
  } catch (err) {
    next(err);
  }
});

// 获取阵容列表
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.squad.findMany({
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
      prisma.squad.count(),
    ]);

    res.json({ items, total, page, hasMore: skip + items.length < total });
  } catch (err) {
    next(err);
  }
});

// 提交新阵容
router.post('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = squadSchema.parse(req.body);
    const squad = await prisma.squad.create({
      data: {
        ...data,
        authorId: req.user!.id,
      },
      include: {
        author: { select: userSelect },
        char1: { select: charInclude },
        char2: { select: charInclude },
        char3: { select: charInclude },
        char4: { select: charInclude },
      },
    });
    res.status(201).json(squad);
  } catch (err) {
    next(err);
  }
});

// 获取阵容详情
router.get('/:id', async (req, res, next) => {
  try {
    const squad = await prisma.squad.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        author: { select: userSelect },
        char1: { select: charInclude },
        char2: { select: charInclude },
        char3: { select: charInclude },
        char4: { select: charInclude },
      },
    });

    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    // 更新浏览量
    await prisma.squad.update({
      where: { id: squad.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(squad);
  } catch (err) {
    next(err);
  }
});

export default router;
