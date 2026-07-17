import { useEffect, useState } from 'react';

export const SMEAR_MS = 150;

// Returns the index that just lost focus, still fading its "ghost" for
// SMEAR_MS (apply a smear class to that row while it's set), or null.
export function useSmear(focusIndex) {
  const [smearIndex, setSmearIndex] = useState(null);
  const [prevFocus, setPrevFocus] = useState(focusIndex);

  // Detect the focus change during render (same pattern as useSectionFlash)
  // instead of in an effect, so starting the smear doesn't cost an extra
  // commit/render pass.
  if (focusIndex !== prevFocus) {
    setSmearIndex(prevFocus);
    setPrevFocus(focusIndex);
  }

  useEffect(() => {
    if (smearIndex === null) return undefined;
    const id = setTimeout(() => setSmearIndex(null), SMEAR_MS);
    return () => clearTimeout(id);
  }, [smearIndex]);

  return smearIndex;
}
