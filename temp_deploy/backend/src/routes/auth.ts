import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../utils/jwt.js';
import { authRequired, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().min(1).max(32),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        nickname: data.nickname,
      },
      select: { id: true, username: true, nickname: true, avatar: true, role: true },
    });
    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.username }] },
    });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, username: true, email: true, nickname: true,
        avatar: true, bio: true, role: true, createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
