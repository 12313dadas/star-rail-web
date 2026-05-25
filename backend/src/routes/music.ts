import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { adminRequired } from '../middleware/auth.js';
import { syncLocalMusicToDb } from '../services/musicSync.js';
import { scanLocalTracks } from '../utils/localMusic.js';

const router = Router();

const trackSchema = z.object({
  title: z.string().min(1),
  artist: z.string().optional(),
  url: z.string().min(1),
  cover: z.string().optional().nullable(),
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

router.get('/local', async (_req, res, next) => {
  try {
    res.json(scanLocalTracks());
  } catch (err) {
    next(err);
  }
});

router.post('/sync-local', adminRequired, async (_req, res, next) => {
  try {
    const tracks = await syncLocalMusicToDb();
    res.json({ synced: tracks.length, tracks });
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
