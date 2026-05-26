import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authOptional, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

async function likeStatus(
  req: AuthRequest,
  where: { postId?: number; momentId?: number }
) {
  const userId = req.user?.id;
  const guestId = req.headers['x-guest-id'] as string | undefined;
  const liked = userId
    ? !!(await prisma.like.findFirst({ where: { ...where, userId } }))
    : guestId
      ? !!(await prisma.like.findFirst({ where: { ...where, guestId } }))
      : false;
  const count = await prisma.like.count({ where });
  return { liked, count };
}

router.get('/post/:postId/status', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const postId = Number(req.params.postId);
    res.json(await likeStatus(req, { postId }));
  } catch (err) {
    next(err);
  }
});

router.get('/moment/:momentId/status', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const momentId = Number(req.params.momentId);
    res.json(await likeStatus(req, { momentId }));
  } catch (err) {
    next(err);
  }
});

router.post('/post/:postId', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user!.id;

    const existing = await prisma.like.findFirst({
      where: { userId, postId },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { postId } });
      return res.json({ liked: false, count });
    }

    await prisma.like.create({
      data: { userId, postId },
    });
    const count = await prisma.like.count({ where: { postId } });
    res.json({ liked: true, count });
  } catch (err) {
    next(err);
  }
});

router.post('/moment/:momentId', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const momentId = Number(req.params.momentId);
    const userId = req.user!.id;

    const existing = await prisma.like.findFirst({
      where: { userId, momentId },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { momentId } });
      return res.json({ liked: false, count });
    }

    await prisma.like.create({
      data: { userId, momentId },
    });
    const count = await prisma.like.count({ where: { momentId } });
    res.json({ liked: true, count });
  } catch (err) {
    next(err);
  }
});

router.get('/post/:postId/count', async (req, res, next) => {
  try {
    const count = await prisma.like.count({ where: { postId: Number(req.params.postId) } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

export default router;
