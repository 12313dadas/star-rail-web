import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { filterSensitiveWords } from '../utils/sensitiveWords.js';
import { parseImages } from '../utils/images.js';
import { authOptional, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

function formatMoment<T extends { images?: unknown }>(m: T) {
  return { ...m, images: parseImages(m.images) };
}

const momentSchema = z.object({
  content: z.string().min(1).max(2000),
  images: z.array(z.string()).max(9).optional(),
  musicUrl: z.string().url().optional().nullable(),
  musicTitle: z.string().optional().nullable(),
});

const userSelect = { id: true, nickname: true, avatar: true, username: true };

router.get('/', authOptional, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.moment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: userSelect },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.moment.count(),
    ]);

    res.json({ items: items.map(formatMoment), total, page, hasMore: skip + items.length < total });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const moment = await prisma.moment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        author: { select: userSelect },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!moment) return res.status(404).json({ error: '说说不存在' });
    res.json(formatMoment(moment));
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = momentSchema.parse(req.body);
    const moment = await prisma.moment.create({
      data: {
        content: filterSensitiveWords(data.content),
        images: data.images?.length ? JSON.stringify(data.images) : null,
        musicUrl: data.musicUrl,
        musicTitle: data.musicTitle,
        authorId: req.user!.id,
      },
      include: { author: { select: userSelect } },
    });
    res.status(201).json(moment);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.moment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: '说说不存在' });
    if (existing.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除' });
    }
    await prisma.moment.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
