import { useCallback, useState } from 'react';

const STORAGE_KEY = 'nokia:hiscore:v1';

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
    /* quota exceeded or unavailable */
  }
}

export function useHighScore(gameId) {
  const [highScore, setHighScore] = useState(() => {
    const stored = readAll()[gameId];
    return typeof stored === 'number' ? stored : 0;
  });

  const recordScore = useCallback(
    (score) => {
      if (score <= highScore) return;
      setHighScore(score);
      const map = readAll();
      map[gameId] = score;
      writeAll(map);
    },
    [gameId, highScore],
  );

  return { highScore, recordScore };
}

export const __TEST__ = { STORAGE_KEY };
