import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { adminRequired } from '../middleware/auth.js';

const router = Router();

const trackSchema = z.object({
  title: z.string().min(1),
  artist: z.string().optional(),
  url: z.string().url(),
  cover: z.string().url().optional().nullable(),
  lyrics: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  active: z.boolean().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const tracks = await prisma.musicTrack.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', adminRequired, async (_req, res, next) => {
  try {
    const tracks = await prisma.musicTrack.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

router.post('/', adminRequired, async (req, res, next) => {
  try {
    const data = trackSchema.parse(req.body);
    const track = await prisma.musicTrack.create({ data });
    res.status(201).json(track);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', adminRequired, async (req, res, next) => {
  try {
    const data = trackSchema.partial().parse(req.body);
    const track = await prisma.musicTrack.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(track);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', adminRequired, async (req, res, next) => {
  try {
    await prisma.musicTrack.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
