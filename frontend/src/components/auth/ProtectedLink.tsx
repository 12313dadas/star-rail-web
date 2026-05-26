import type { ReactNode, MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthGate, isProtectedPath } from '../../contexts/AuthGateContext';

interface Props extends Omit<LinkProps, 'to'> {
  to: string;
  children: ReactNode;
  className?: string;
}

export default function ProtectedLink({ to, children, className, onClick, ...rest }: Props) {
  const { user } = useAuth();
  const { openAuth } = useAuthGate();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!user && isProtectedPath(to)) {
      e.preventDefault();
      openAuth();
      return;
    }
    onClick?.(e);
  };

  return (
    <Link to={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
