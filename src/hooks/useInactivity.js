import { useEffect } from 'react';

const EVENTS = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'];

export function useInactivity(delayMs, onInactive) {
  useEffect(() => {
    let timer = setTimeout(onInactive, delayMs);

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onInactive, delayMs);
    };

    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [delayMs, onInactive]);
}
