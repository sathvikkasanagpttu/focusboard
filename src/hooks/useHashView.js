import { useState, useEffect, useCallback } from 'react';

const VALID_VIEWS = ['dashboard', 'tasks', 'calendar', 'analytics', 'settings'];

function getHashView() {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  return VALID_VIEWS.includes(hash) ? hash : 'dashboard';
}

/**
 * Custom hook to synchronize view routing with URL hash.
 * Enables browser back/forward, direct linking, and refresh persistence.
 */
export function useHashView(defaultView = 'dashboard') {
  const [activeView, setActiveViewState] = useState(() => getHashView() || defaultView);

  useEffect(() => {
    const handleHashChange = () => {
      const view = getHashView();
      setActiveViewState(view);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActiveView = useCallback((view) => {
    const target = VALID_VIEWS.includes(view) ? view : 'dashboard';
    if (window.location.hash !== `#${target}`) {
      window.location.hash = `#${target}`;
    }
    setActiveViewState(target);
  }, []);

  return [activeView, setActiveView];
}
