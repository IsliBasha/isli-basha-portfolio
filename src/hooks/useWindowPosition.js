import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'win95:positions:v1';

function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota exceeded or unavailable — fail silently */
  }
}

function readEntry(id) {
  const map = readAll();
  const stored = map[id];
  if (!stored || typeof stored !== 'object') return null;
  return stored;
}

export function useWindowPosition(id, { enabled = true } = {}) {
  const [offset, setOffset] = useState(() => {
    if (!enabled) return { x: 0, y: 0 };
    const stored = readEntry(id);
    if (
      stored &&
      typeof stored.x === 'number' &&
      typeof stored.y === 'number'
    ) {
      return { x: stored.x, y: stored.y };
    }
    return { x: 0, y: 0 };
  });

  const [size, setSize] = useState(() => {
    if (!enabled) return null;
    const stored = readEntry(id);
    if (
      stored &&
      typeof stored.width === 'number' &&
      typeof stored.height === 'number'
    ) {
      return { width: stored.width, height: stored.height };
    }
    return null;
  });

  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const persist = useCallback(
    (patch) => {
      if (!enabledRef.current) return;
      const map = readAll();
      map[id] = { ...(map[id] ?? {}), ...patch };
      writeAll(map);
    },
    [id],
  );

  const savePosition = useCallback(
    (next) => {
      setOffset(next);
      persist({ x: next.x, y: next.y });
    },
    [persist],
  );

  const saveSize = useCallback(
    (next) => {
      setSize(next);
      persist({ width: next.width, height: next.height });
    },
    [persist],
  );

  return { offset, size, savePosition, saveSize, setOffset, setSize };
}

export function clearWindowPositions() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* fail silently */
  }
}

export const __TEST__ = { STORAGE_KEY };
