import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { filterSensitiveWords } from '../utils/sensitiveWords.js';
import { adminRequired, authOptional, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const messageSchema = z.object({
  content: z.string().min(1).max(500),
  guestName: z.string().max(32).optional(),
});

router.get('/', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const messages = await prisma.guestbookMessage.findMany({
      where: isAdmin ? {} : { approved: true },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.post('/', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const data = messageSchema.parse(req.body);
    const message = await prisma.guestbookMessage.create({
      data: {
        content: filterSensitiveWords(data.content),
        authorId: req.user?.userId,
        guestName: req.user ? undefined : data.guestName,
      },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/approve', adminRequired, async (req, res, next) => {
  try {
    const message = await prisma.guestbookMessage.update({
      where: { id: Number(req.params.id) },
      data: { approved: true },
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const message = await prisma.guestbookMessage.findUnique({ where: { id } });
    if (!message) return res.status(404).json({ error: '留言不存在' });
    if (message.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除' });
    }
    await prisma.guestbookMessage.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
