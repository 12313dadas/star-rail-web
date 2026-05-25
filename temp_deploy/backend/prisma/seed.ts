import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@star-rail.local',
      password,
      nickname: '开拓者',
      bio: '欢迎来到我的星穹铁道个人空间！这里分享攻略、说说和游戏日常。',
      role: 'ADMIN',
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'gong-lve' },
    update: {},
    create: { name: '攻略', slug: 'gong-lve', description: '游戏深度攻略' },
  });

  const tag = await prisma.tag.upsert({
    where: { slug: 'xuan-heng' },
    update: {},
    create: { name: '忘却之庭', slug: 'xuan-heng' },
  });

  await prisma.post.upsert({
    where: { slug: 'welcome-to-star-rail' },
    update: {},
    create: {
      title: '欢迎来到星穹铁道个人站',
      slug: 'welcome-to-star-rail',
      content: `<h2>站点上线啦</h2><p>这是一个专为<strong>崩坏：星穹铁道</strong>玩家打造的内容平台，你可以在这里阅读攻略、浏览说说、欣赏相册，还能在留言板留下足迹。</p><h3>功能一览</h3><ul><li>动态流：聚合说说与攻略</li><li>攻略博客：Markdown 富文本支持</li><li>相册：游戏截图与二创</li><li>音乐播放器：网站 BGM</li></ul>`,
      excerpt: '站点正式上线，一起来探索星穹世界吧！',
      type: 'ANNOUNCEMENT',
      published: true,
      authorId: admin.id,
      categoryId: category.id,
      tags: { create: [{ tagId: tag.id }] },
    },
  });

  await prisma.moment.create({
    data: {
      content: '今天的忘却之庭又刷新了！分享一张截图～',
      images: null,
      authorId: admin.id,
    },
  });

  await prisma.musicTrack.create({
    data: {
      title: '星间旅行',
      artist: 'HOYO-MiX',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      sortOrder: 0,
      active: true,
    },
  });

  console.log('✅ Seed completed. Admin: admin / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
