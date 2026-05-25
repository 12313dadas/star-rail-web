import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ posts: [], moments: [] });

    const [posts, moments] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true, type: true, createdAt: true,
          author: { select: { nickname: true, avatar: true } },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.moment.findMany({
        where: { content: { contains: q } },
        select: {
          id: true, content: true, images: true, createdAt: true,
          author: { select: { nickname: true, avatar: true } },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({ posts, moments, query: q });
  } catch (err) {
    next(err);
  }
});

export default router;
