import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { sanitizeContent, slugify } from '../utils/sanitize.js';
import { adminRequired, authOptional, authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  type: z.enum(['ARTICLE', 'ANNOUNCEMENT']).default('ARTICLE'),
  published: z.boolean().default(false),
  categoryId: z.number().optional().nullable(),
  tagIds: z.array(z.number()).optional(),
});

const userSelect = { id: true, nickname: true, avatar: true, username: true };

router.get('/', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const tagId = req.query.tagId ? Number(req.query.tagId) : undefined;
    const isAdmin = req.user?.role === 'ADMIN';

    const where = {
      ...(type ? { type: type as 'ARTICLE' | 'ANNOUNCEMENT' } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
      ...(!isAdmin ? { published: true } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: userSelect },
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ items, total, page, hasMore: skip + items.length < total });
  } catch (err) {
    next(err);
  }
});

router.get('/meta/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.get('/meta/tags', async (_req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.post('/meta/categories', adminRequired, async (req, res, next) => {
  try {
    const { name, description } = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }).parse(req.body);
    const category = await prisma.category.create({
      data: { name, slug: slugify(name), description },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

router.post('/meta/tags', adminRequired, async (req, res, next) => {
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    const tag = await prisma.tag.create({ data: { name, slug: slugify(name) } });
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', authOptional, async (req: AuthRequest, res, next) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        author: { select: userSelect },
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!post || (!post.published && !isAdmin)) {
      return res.status(404).json({ error: '文章不存在' });
    }
    await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = postSchema.parse(req.body);
    let slug = slugify(data.title);
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: sanitizeContent(data.content),
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        type: data.type,
        published: data.published,
        categoryId: data.categoryId,
        authorId: req.user!.userId,
        tags: data.tagIds?.length
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: { author: { select: userSelect }, category: true, tags: { include: { tag: true } } },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = postSchema.partial().parse(req.body);
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: '文章不存在' });
    if (existing.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权修改' });
    }

    if (data.tagIds) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        content: data.content ? sanitizeContent(data.content) : undefined,
        tags: data.tagIds
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: { author: { select: userSelect }, category: true, tags: { include: { tag: true } } },
    });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: '文章不存在' });
    if (existing.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除' });
    }
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
