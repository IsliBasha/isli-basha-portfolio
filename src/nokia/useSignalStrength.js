import { useEffect, useState } from 'react';

const UPDATE_MS = 4000;
const MIN_BARS = 2;
const MAX_BARS = 4;
const SHIFT_CHANCE = 0.35;

// Simulates gentle real-world signal drift: mostly holds steady, and when it
// moves, shifts by exactly one bar (never a full jump) so it reads as
// natural fluctuation rather than random flicker. Never drops below 2 bars
// — a "no signal" look would read as broken, not lifelike.
export function useSignalStrength() {
  const [bars, setBars] = useState(4);

  useEffect(() => {
    const id = setInterval(() => {
      setBars((current) => {
        if (Math.random() >= SHIFT_CHANCE) return current;
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.min(MAX_BARS, Math.max(MIN_BARS, current + delta));
      });
    }, UPDATE_MS);
    return () => clearInterval(id);
  }, []);

  return bars;
}
