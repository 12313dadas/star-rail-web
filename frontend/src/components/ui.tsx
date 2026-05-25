import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import clsx from 'clsx';

export function formatTime(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
}

export function Avatar({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };
  if (src) {
    return <img src={src} alt={name} className={clsx('rounded-full object-cover', sizes[size])} />;
  }
  return (
    <div className={clsx('rounded-full bg-star-purple/30 flex items-center justify-center font-bold text-star-gold', sizes[size])}>
      {name.charAt(0)}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-star-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-white/5 animate-pulse rounded', className)} />;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-center text-gray-400 py-12">{message}</p>;
}
