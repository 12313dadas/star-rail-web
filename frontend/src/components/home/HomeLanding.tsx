import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles, Compass, Music, Users, BookOpen, Camera, MessageCircle } from 'lucide-react';
import ParticleConstellation from '../effects/ParticleConstellation';
import ScrollReveal from '../effects/ScrollReveal';
import TiltCard from '../effects/TiltCard';
import AnimatedCounter from '../effects/AnimatedCounter';
import type { FeedItem, Post } from '../../types';
import { parseImages } from '../../lib/images';

export interface SiteStats {
  posts: number;
  moments: number;
  squads: number;
  characters: number;
}

interface Props {
  nickname?: string;
  profileTo?: string;
  announcements: Post[];
  featured: FeedItem[];
  stats?: SiteStats;
}

const MODULES = [
  { to: '/posts', label: '攻略', desc: '长文与版本笔记', icon: BookOpen },
  { to: '/moments', label: '说说', desc: '动态与配图', icon: Sparkles },
  { to: '/squads', label: '阵容', desc: '配队与实战', icon: Users },
  { to: '/albums', label: '相册', desc: '影像归档', icon: Camera },
  { to: '/music', label: '音乐', desc: 'BGM 收藏', icon: Music },
  { to: '/guestbook', label: '留言', desc: '访客信号', icon: MessageCircle },
];

export default function HomeLanding({ nickname, profileTo, announcements, featured, stats }: Props) {
  const statItems = stats
    ? [
        { n: stats.posts, l: '攻略' },
        { n: stats.moments, l: '说说' },
        { n: stats.squads, l: '阵容' },
        { n: stats.characters, l: '角色' },
      ]
    : [];

  return (
    <div className="home-shell">
      {/* ══════════ HERO ══════════ */}
      <section className="home-hero">
        <ParticleConstellation particleCount={90} linkThreshold={150} />
        <div className="home-hero-inner">
          <ScrollReveal animation="fade" delay={100}>
            <p className="home-kicker">Honkai: Star Rail · Personal Terminal</p>
          </ScrollReveal>

          <ScrollReveal animation="up" delay={250}>
            <h1 className="home-hero-title">
              {nickname ? (
                <>
                  <span className="home-hero-welcome">{nickname}，欢迎登车</span>
                  星穹空间
                </>
              ) : (
                '星穹空间'
              )}
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="up" delay={400}>
            <p className="home-hero-lead">
              攻略、说说、阵容与相册在同一终端沉淀。克制布局，星轨美学，为记录而非喧哗。
            </p>
          </ScrollReveal>

          <ScrollReveal animation="up" delay={550}>
            <div className="home-hero-actions">
              <a href="#home-feed" className="home-btn home-btn--primary">
                浏览动态
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/posts" className="home-btn home-btn--ghost">
                进入攻略库
              </Link>
              {profileTo && (
                <Link to={profileTo} className="home-btn home-btn--ghost">
                  我的空间
                </Link>
              )}
            </div>
          </ScrollReveal>

          {statItems.length > 0 && (
            <ScrollReveal animation="up" delay={700}>
              <div className="home-stat-row">
                {statItems.map((s) => (
                  <div key={s.l} className="home-glass home-stat-chip">
                    <span className="home-stat-num">
                      <AnimatedCounter value={s.n} duration={1800} />
                    </span>
                    <span className="home-stat-lbl">{s.l}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>

        {/* 滚动指示器 */}
        <ScrollReveal animation="fade" delay={1000}>
          <div className="home-scroll-indicator">
            <span className="home-scroll-text">SCROLL</span>
            <div className="home-scroll-line" />
          </div>
        </ScrollReveal>
      </section>

      {/* 星轨分隔线 */}
      <div className="home-divider">
        <div className="home-divider-track" />
        <div className="home-divider-icon">
          <Compass className="w-4 h-4" />
        </div>
        <div className="home-divider-track" />
      </div>

      {/* ══════════ 内容分区 ══════════ */}
      <ScrollReveal animation="up">
        <section className="home-block">
          <div className="home-block-head">
            <div>
              <p className="home-kicker">Navigate</p>
              <h2 className="home-block-title">内容分区</h2>
            </div>
            <p className="home-block-desc">选择模块，进入对应空间</p>
          </div>
          <div className="home-bento">
            {MODULES.map((m, i) => (
              <TiltCard
                key={m.to}
                className={`home-glass home-bento-card group${i === 0 ? ' home-bento-card--wide' : ''}`}
                maxTilt={6}
                scale={1.02}
              >
                <Link to={m.to} className="block no-underline">
                  <ArrowUpRight className="home-bento-arrow" strokeWidth={1.5} />
                  <div className="home-bento-icon-wrap">
                    <m.icon className="home-bento-icon" strokeWidth={1.5} />
                  </div>
                  <h3>{m.label}</h3>
                  <p>{m.desc}</p>
                </Link>
              </TiltCard>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 星轨分隔线 */}
      <div className="home-divider">
        <div className="home-divider-track" />
        <div className="home-divider-icon">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="home-divider-track" />
      </div>

      {/* ══════════ 精选内容 ══════════ */}
      {(featured.length > 0 || announcements.length > 0) && (
        <ScrollReveal animation="up">
          <section className="home-block">
            <div className="home-block-head">
              <div>
                <p className="home-kicker">Featured</p>
                <h2 className="home-block-title">精选内容</h2>
              </div>
            </div>

            {featured.length > 0 && (
              <div className="home-featured-grid">
                {featured.map((item, i) => (
                  <ScrollReveal key={`${item.feedType}-${item.id}`} animation="up" delay={i * 100}>
                    <FeaturedCard item={item} large={i === 0} />
                  </ScrollReveal>
                ))}
              </div>
            )}

            {announcements.length > 0 && (
              <ScrollReveal animation="up" delay={200}>
                <ul className="home-announce-list">
                  {announcements.map((a, i) => (
                    <li key={a.id}>
                      <Link to={`/posts/${a.slug}`} className="home-glass home-announce-row group">
                        <span className="home-announce-tag">公告</span>
                        <span className="flex-1 truncate text-gray-200 group-hover:text-white">{a.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            )}
          </section>
        </ScrollReveal>
      )}
    </div>
  );
}

function FeaturedCard({ item, large }: { item: FeedItem; large?: boolean }) {
  const href = item.feedType === 'post' ? `/posts/${item.slug}` : `/moments/${item.id}`;
  const images = item.feedType === 'moment' ? parseImages(item.images) : [];
  const cover = item.feedType === 'post' ? item.coverImage : images[0];

  return (
    <TiltCard className={`home-glass home-featured-card group ${large ? 'home-featured-card--lg' : ''}`} maxTilt={4} scale={1.01}>
      <Link to={href} className="block no-underline">
        <div className="home-featured-media">
          {cover ? (
            <img src={cover} alt="" loading="lazy" />
          ) : (
            <div className="home-featured-placeholder" />
          )}
          <div className="home-featured-shade" />
        </div>
        <div className="home-featured-body">
          <span className="home-tag">{item.feedType === 'post' ? '攻略' : '说说'}</span>
          <h3 className="line-clamp-2">
            {item.feedType === 'post' ? item.title : item.content}
          </h3>
          {item.feedType === 'post' && item.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.excerpt}</p>
          )}
        </div>
      </Link>
    </TiltCard>
  );
}
