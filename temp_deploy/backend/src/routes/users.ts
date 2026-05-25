import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { adminRequired, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', adminRequired, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, nickname: true,
        avatar: true, role: true, createdAt: true,
        _count: { select: { posts: true, moments: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/role', adminRequired, async (req, res, next) => {
  try {
    const role = z.enum(['USER', 'ADMIN']).parse(req.body.role);
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role },
      select: { id: true, username: true, nickname: true, role: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      nickname: z.string().min(1).max(32).optional(),
      bio: z.string().max(500).optional(),
      avatar: z.string().url().optional().nullable(),
    });
    const data = schema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: { id: true, username: true, nickname: true, avatar: true, bio: true, role: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true, username: true, nickname: true, avatar: true, bio: true, createdAt: true,
        _count: { select: { posts: true, moments: true } },
      },
    });
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/timeline', async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [posts, moments] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId, published: true },
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, type: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.moment.findMany({
        where: { authorId: userId },
        select: { id: true, content: true, images: true, musicTitle: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const timeline = [
      ...posts.map((p) => ({ ...p, itemType: 'post' as const })),
      ...moments.map((m) => ({ ...m, itemType: 'moment' as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(skip, skip + limit);

    res.json({ items: timeline, page, hasMore: timeline.length === limit });
  } catch (err) {
    next(err);
  }
});

export default router;
