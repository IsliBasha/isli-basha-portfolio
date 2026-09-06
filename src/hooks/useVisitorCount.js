import { useEffect, useState } from 'react';

const SESSION_KEY = 'portfolio_sid';

// The id a refused storage leaves us with. Held for the life of the tab so the
// counter still sees one visitor rather than a new one per mount.
let memorySessionId = null;

function newSessionId() {
  // randomUUID is only defined in a secure context: an http:// preview of this
  // build, or a LAN address someone opens the desktop on, has `crypto` but not
  // that method, and reading it there is a TypeError. The id only has to be
  // unique enough for /api/visit to de-duplicate one visit.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * The id this tab counts as. Never throws.
 *
 * Storage is asked, not trusted, the way BootSequence asks it for the boot
 * flag: Safari's private mode and a blocked third-party context both answer a
 * plain `sessionStorage.getItem` with a SecurityError, and this runs inside
 * the mount effect of the one window that is open when the desktop boots.
 * Throwing there took the whole desktop down with it — there is no boundary
 * above a hook — for a decorative hit counter.
 */
function getOrCreateSessionId() {
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
  } catch {
    /* fall through to the in-memory id */
  }

  if (memorySessionId) return memorySessionId;
  memorySessionId = newSessionId();

  try {
    window.sessionStorage.setItem(SESSION_KEY, memorySessionId);
  } catch {
    /* this tab keeps counting under memorySessionId instead */
  }
  return memorySessionId;
}

/** Test seam: the in-memory id outlives a single test, which would let a
 *  later "makes one up" assertion pass on the id an earlier test left. */
export function __resetSessionId() {
  memorySessionId = null;
}

export function useVisitorCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getOrCreateSessionId();

    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.count != null) setCount(Number(data.count));
      })
      .catch(() => {}); // counter is decorative — silent on error

    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
