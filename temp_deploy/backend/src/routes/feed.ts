import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { parseImages } from '../utils/images.js';

const router = Router();

function formatMoment<T extends { images?: unknown }>(m: T) {
  return { ...m, images: parseImages(m.images) };
}

router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [posts, moments, announcements] = await Promise.all([
      prisma.post.findMany({
        where: { published: true, type: 'ARTICLE' },
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true, type: true, createdAt: true,
          author: { select: { id: true, nickname: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.moment.findMany({
        select: {
          id: true, content: true, images: true, musicUrl: true, musicTitle: true, createdAt: true,
          author: { select: { id: true, nickname: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.post.findMany({
        where: { published: true, type: 'ANNOUNCEMENT' },
        select: {
          id: true, title: true, slug: true, excerpt: true, type: true, createdAt: true,
          author: { select: { id: true, nickname: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const feed = [
      ...posts.map((p) => ({ ...p, feedType: 'post' as const })),
      ...moments.map((m) => ({ ...formatMoment(m), feedType: 'moment' as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(skip, skip + limit);

    res.json({
      items: feed,
      announcements,
      page,
      hasMore: feed.length === limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
