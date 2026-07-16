import { useSyncExternalStore } from 'react';

// The Nokia mobile port takes over at viewport widths <= 768px; the Win95
// desktop renders above that. We subscribe to a matchMedia store (not UA
// sniffing) via useSyncExternalStore, which re-reads whenever the breakpoint
// is crossed — that also covers orientation changes, which fire the same event.
export const MOBILE_QUERY = '(max-width: 768px)';

function hasMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function subscribe(onChange) {
  if (!hasMatchMedia()) return () => {};
  const mql = window.matchMedia(MOBILE_QUERY);
  if (mql.addEventListener) {
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }
  // Safari < 14 fallback.
  mql.addListener(onChange);
  return () => mql.removeListener(onChange);
}

function getSnapshot() {
  return hasMatchMedia() ? window.matchMedia(MOBILE_QUERY).matches : false;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
