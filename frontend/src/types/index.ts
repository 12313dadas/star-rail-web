export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string | null;
  bio?: string | null;
  role: 'USER' | 'ADMIN';
  email?: string;
}

export interface Author {
  id: number;
  nickname: string;
  avatar?: string | null;
  username?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  coverImage?: string | null;
  type: 'ARTICLE' | 'MOMENT' | 'ANNOUNCEMENT';
  published?: boolean;
  viewCount?: number;
  createdAt: string;
  author: Author;
  category?: { id: number; name: string; slug: string } | null;
  tags?: { tag: { id: number; name: string; slug: string } }[];
  _count?: { comments: number; likes: number };
}

export interface Moment {
  id: number;
  content: string;
  images?: string[] | null;
  musicUrl?: string | null;
  musicTitle?: string | null;
  createdAt: string;
  author: Author;
  _count?: { comments: number; likes: number };
}

export interface FeedItem =
  | (Post & { feedType: 'post' })
  | (Moment & { feedType: 'moment' });

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  guestName?: string | null;
  author?: Author | null;
  replies?: Comment[];
}

export interface Album {
  id: number;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  author: Author;
  photos?: Photo[];
  _count?: { photos: number };
}

export interface Photo {
  id: number;
  url: string;
  caption?: string | null;
}

export interface MusicTrack {
  id: number;
  title: string;
  artist?: string | null;
  url: string;
  cover?: string | null;
  lyrics?: string | null;
}

export interface Character {
  id: number;
  name: string;
  rarity: number;
  element: string;
  path: string;
  icon?: string | null;
  preview?: string | null;
}

export interface Squad {
  id: number;
  name: string;
  description?: string | null;
  authorId: number;
  author: Author;
  char1Id: number;
  char2Id: number;
  char3Id: number;
  char4Id: number;
  char1: Character;
  char2: Character;
  char3: Character;
  char4: Character;
  score: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestbookMessage {
  id: number;
  content: string;
  createdAt: string;
  guestName?: string | null;
  author?: Author | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total?: number;
}
