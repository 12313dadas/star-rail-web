import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, action }: Props) {
  return (
    <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {icon && <div className="mb-3 text-star-gold">{icon}</div>}
        <h1 className="hero-title text-3xl sm:text-4xl text-gradient-star">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-2 text-sm max-w-xl">{subtitle}</p>}
        <div className="mt-4 w-24 h-0.5 bg-gold-line rounded-full opacity-70" />
      </div>
      {action}
    </div>
  );
}
