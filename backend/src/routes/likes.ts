import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authOptional, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/post/:postId', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const guestId = req.headers['x-guest-id'] as string | undefined;
    const userId = req.user?.id;

    const existing = await prisma.like.findFirst({
      where: userId ? { userId, postId } : { guestId, postId },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }

    await prisma.like.create({
      data: { userId, guestId: userId ? undefined : guestId, postId },
    });
    res.json({ liked: true });
  } catch (err) {
    next(err);
  }
});

router.post('/moment/:momentId', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const momentId = Number(req.params.momentId);
    const guestId = req.headers['x-guest-id'] as string | undefined;
    const userId = req.user?.id;

    const existing = await prisma.like.findFirst({
      where: userId ? { userId, momentId } : { guestId, momentId },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }

    await prisma.like.create({
      data: { userId, guestId: userId ? undefined : guestId, momentId },
    });
    res.json({ liked: true });
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
