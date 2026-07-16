import { useCallback, useEffect, useState } from 'react';

// A tiny hash router for the Nokia state machine. The phone UI is a single-page
// state machine (boot -> idle -> menu -> section); each section is a hash route
// (#/about, #/work/1, ...) so deep links and the browser Back button work.
// Back always pops one level via history.back().

function normalize(to) {
  const raw = to.startsWith('#') ? to.slice(1) : to;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return path === '' ? '/' : path;
}

function currentRoute() {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' ? '/' : normalize(hash);
}

export function useHashRoute() {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Push a new route onto history (adds a Back stack entry).
  const navigate = useCallback((to) => {
    const path = normalize(to);
    if (currentRoute() !== path) {
      window.location.hash = `#${path}`;
    }
    setRoute(path); // optimistic — hashchange will reconcile
  }, []);

  // Replace the current route without adding a history entry (used by boot).
  const replace = useCallback((to) => {
    const path = normalize(to);
    window.history.replaceState(null, '', `#${path}`);
    setRoute(path);
  }, []);

  // Pop one level. Softkey "Back": section -> menu -> idle.
  const back = useCallback(() => {
    window.history.back();
  }, []);

  return { route, navigate, replace, back };
}
