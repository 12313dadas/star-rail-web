import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ExpressIntro from './ExpressIntro';

const INTRO_KEY = 'star_rail_intro_played';

export default function ExpressIntroGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const shouldPlay =
      (location.state as { playIntro?: boolean })?.playIntro === true ||
      sessionStorage.getItem('play_intro') === '1';

    if (shouldPlay && user) {
      sessionStorage.removeItem('play_intro');
      setShowIntro(true);
      window.history.replaceState({}, document.title);
    }
    setReady(true);
  }, [location.state, user]);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    setShowIntro(false);
  }, []);

  if (!ready) return null;

  return (
    <>
      {showIntro && <ExpressIntro onComplete={handleComplete} nickname={user?.nickname} />}
      <div className={showIntro ? 'opacity-0' : 'opacity-100 animate-fade-in transition-opacity duration-700'}>
        {children}
      </div>
    </>
  );
}

export function triggerIntroAfterLogin() {
  sessionStorage.setItem('play_intro', '1');
}
