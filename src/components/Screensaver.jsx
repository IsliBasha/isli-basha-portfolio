import { useEffect, useRef } from 'react';

const STAR_COUNT = 280;
const FOCAL = 320;
const SPEED = 6;

function makeStar(w, h) {
  return {
    x: (Math.random() - 0.5) * w * 2,
    y: (Math.random() - 0.5) * h * 2,
    z: Math.random() * w,
    pz: 0,
  };
}

function usePrefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Screensaver({ onDismiss }) {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize, { passive: true });

    if (reducedMotion) return () => window.removeEventListener('resize', setSize);

    const ctx = canvas.getContext('2d');
    const w = () => canvas.width;
    const h = () => canvas.height;

    const stars = Array.from({ length: STAR_COUNT }, () => makeStar(w(), h()));
    stars.forEach((s) => { s.pz = s.z; });

    let rafId;

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w(), h());

      const cx = w() / 2;
      const cy = h() / 2;

      for (const star of stars) {
        star.pz = star.z;
        star.z -= SPEED;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w() * 2;
          star.y = (Math.random() - 0.5) * h() * 2;
          star.z = w();
          star.pz = star.z;
        }

        const sx = (star.x / star.z) * FOCAL + cx;
        const sy = (star.y / star.z) * FOCAL + cy;
        const px = (star.x / star.pz) * FOCAL + cx;
        const py = (star.y / star.pz) * FOCAL + cy;

        const size = Math.max(0.4, (1 - star.z / w()) * 3.5);
        const brightness = Math.floor((1 - star.z / w()) * 255);
        const alpha = Math.min(1, (1 - star.z / w()) * 1.4);

        ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', setSize);
    };
  }, [reducedMotion]);

  return (
    <div
      className="screensaver"
      onClick={onDismiss}
      onKeyDown={onDismiss}
      tabIndex={0}
      role="button"
      aria-label="Screensaver active. Click or press any key to return."
    >
      <canvas ref={canvasRef} className="screensaver__canvas" />
      {reducedMotion && (
        <p className="screensaver__static-label">
          Click to continue
        </p>
      )}
    </div>
  );
}
