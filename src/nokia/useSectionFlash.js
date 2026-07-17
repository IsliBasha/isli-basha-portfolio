import { useEffect, useState } from 'react';

const FLASH_MS = 80;

// True for FLASH_MS after `route` changes while `ready` — a brief
// screen-off dip on section navigation. Never fires on mount, and never
// fires before `ready` (e.g. during the boot sequence).
export function useSectionFlash(route, ready) {
  const [flashOn, setFlashOn] = useState(false);
  const [prevRoute, setPrevRoute] = useState(route);

  // Detect the route change during render (React's sanctioned "adjust state
  // while rendering" pattern) instead of in an effect, so starting the
  // flash doesn't cost an extra commit/render pass.
  if (route !== prevRoute) {
    if (ready) setFlashOn(true);
    setPrevRoute(route);
  }

  useEffect(() => {
    if (!flashOn) return undefined;
    const id = setTimeout(() => setFlashOn(false), FLASH_MS);
    return () => clearTimeout(id);
  }, [flashOn]);

  return flashOn;
}
