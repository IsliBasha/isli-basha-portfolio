import { useEffect, useRef, useState } from 'react';

const hasIO =
  typeof window !== 'undefined' &&
  typeof window.IntersectionObserver !== 'undefined';

export function useInView({ threshold = 0.5, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => !hasIO);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasIO) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, inView];
}
