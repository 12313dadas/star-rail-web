import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err instanceof Error && err.name === 'ZodError') {
    return res.status(400).json({ error: '请求参数无效', details: err.message });
  }
  if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2002') {
    return res.status(409).json({ error: '数据已存在' });
  }
  res.status(500).json({ error: '服务器内部错误' });
}
