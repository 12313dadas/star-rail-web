import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { filterSensitiveWords } from '../utils/sensitiveWords.js';
import { adminRequired, authOptional, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  targetType: z.enum(['POST', 'MOMENT', 'GUESTBOOK']),
  postId: z.number().optional(),
  momentId: z.number().optional(),
  parentId: z.number().optional(),
  guestName: z.string().max(32).optional(),
  guestEmail: z.string().email().optional(),
});

const requireApproval = () => process.env.COMMENT_REQUIRE_APPROVAL === 'true';

router.get('/', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const postId = req.query.postId ? Number(req.query.postId) : undefined;
    const momentId = req.query.momentId ? Number(req.query.momentId) : undefined;
    const isAdmin = req.user?.role === 'ADMIN';

    const comments = await prisma.comment.findMany({
      where: {
        ...(postId ? { postId } : {}),
        ...(momentId ? { momentId } : {}),
        parentId: null,
        ...(!isAdmin ? { approved: true } : {}),
      },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
        replies: {
          where: !isAdmin ? { approved: true } : {},
          include: { author: { select: { id: true, nickname: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

router.post('/', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const data = commentSchema.parse(req.body);
    const approved = !requireApproval();

  const comment = await prisma.comment.create({
      data: {
        content: filterSensitiveWords(data.content),
        targetType: data.targetType,
        postId: data.postId,
        momentId: data.momentId,
        parentId: data.parentId,
        authorId: req.user?.id,
        guestName: req.user ? undefined : data.guestName,
        guestEmail: req.user ? undefined : data.guestEmail,
        approved,
      },
      include: { author: { select: { id: true, nickname: true, avatar: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/approve', adminRequired, async (req, res, next) => {
  try {
    const comment = await prisma.comment.update({
      where: { id: Number(req.params.id) },
      data: { approved: true },
    });
    res.json(comment);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: '评论不存在' });
    if (comment.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除' });
    }
    await prisma.comment.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/pending', adminRequired, async (_req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { approved: false },
      include: {
        author: { select: { id: true, nickname: true } },
        post: { select: { id: true, title: true } },
        moment: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

export default router;
