import { useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView.js';
import { stackTree } from '../data/stack.js';

const TOTAL_DURATION_MS = 2000;

function usePrefersReducedMotion() {
  const [prm, setPrm] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setPrm(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return prm;
}

export function TerminalTree() {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const reducedMotion = usePrefersReducedMotion();
  const [animatedChars, setAnimatedChars] = useState(0);
  const total = stackTree.length;

  useEffect(() => {
    if (!inView || reducedMotion) return undefined;

    let rafId;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / TOTAL_DURATION_MS);
      const nextCount = Math.min(total, Math.floor(progress * total));
      setAnimatedChars(nextCount);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [inView, reducedMotion, total]);

  const visibleChars =
    inView && reducedMotion ? total : animatedChars;
  const done = visibleChars >= total;

  return (
    <pre
      ref={ref}
      className="terminal"
      aria-label="Isli's technology stack, rendered as a directory tree"
    >
      {stackTree.slice(0, visibleChars)}
      {done ? <span className="terminal__cursor" aria-hidden="true" /> : null}
    </pre>
  );
}
