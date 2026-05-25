import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import momentRoutes from './routes/moments.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
import albumRoutes from './routes/albums.js';
import guestbookRoutes from './routes/guestbook.js';
import musicRoutes from './routes/music.js';
import squadRoutes from './routes/squads.js';
import searchRoutes from './routes/search.js';
import feedRoutes from './routes/feed.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const musicDir = process.env.MUSIC_DIR
  ? path.resolve(process.env.MUSIC_DIR)
  : path.resolve(process.cwd(), '..', 'music');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.resolve(uploadDir)));
app.use('/music', express.static(musicDir, {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.flac')) res.setHeader('Content-Type', 'audio/flac');
  },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Star Rail Personal Web API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/guestbook', guestbookRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/squads', squadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

export default app;
