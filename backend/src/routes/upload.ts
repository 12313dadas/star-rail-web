import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { upload, getUploadUrl } from '../middleware/upload.js';

const router = Router();

router.post('/', authRequired, upload.array('files', 9), (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    return res.status(400).json({ error: '未上传文件' });
  }
  const urls = files.map((f) => getUploadUrl(f.filename));
  res.json({ urls });
});

export default router;
