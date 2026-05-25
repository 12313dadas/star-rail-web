import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const albumSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  coverImage: z.string().optional().nullable(),
});

const photoSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
  sortOrder: z.number().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const albums = await prisma.album.findMany({
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(albums);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const album = await prisma.album.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        author: { select: { id: true, nickname: true, avatar: true } },
        photos: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!album) return res.status(404).json({ error: '相册不存在' });
    res.json(album);
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = albumSchema.parse(req.body);
    const album = await prisma.album.create({
      data: { ...data, authorId: req.user!.id },
    });
    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/photos', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const albumId = Number(req.params.id);
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) return res.status(404).json({ error: '相册不存在' });
    if (album.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权操作' });
    }

    const photos = z.array(photoSchema).parse(req.body.photos);
    const created = await prisma.$transaction(
      photos.map((p, i) =>
        prisma.photo.create({
          data: { url: p.url, caption: p.caption, sortOrder: p.sortOrder ?? i, albumId },
        })
      )
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) return res.status(404).json({ error: '相册不存在' });
    if (album.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除' });
    }
    await prisma.album.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
