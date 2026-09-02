import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowStack } from '../context/windowStackContext.js';
import { useIconPosition } from '../hooks/useIconPosition.js';
import { AppGlyph } from '../lib/AppGlyph.jsx';

const DESKTOP_MIN_WIDTH = 1024;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}


export function DesktopIcon({ kind, label, target, href, defaultPos = { x: 16, y: 16 } }) {
  const { bringToFront } = useWindowStack();
  const isDesktop = useIsDesktop();
  const { pos, setPos, savePosition } = useIconPosition(kind, defaultPos, {
    enabled: isDesktop,
  });

  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const handlePointerDown = useCallback(
    (e) => {
      if (!isDesktop) return;
      if (e.button !== 0) return;
      if (href) return;
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX - pos.x,
        startY: e.clientY - pos.y,
        pointerId: e.pointerId,
        lastPos: pos,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [isDesktop, href, pos],
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragRef.current) return;
      const next = {
        x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragRef.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - 114, e.clientY - dragRef.current.startY)),
      };
      dragRef.current.moved = true;
      dragRef.current.lastPos = next;
      setPos(next);
    },
    [setPos],
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (!dragRef.current) return;
      const { moved, pointerId, lastPos } = dragRef.current;
      try {
        e.currentTarget.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
      dragRef.current = null;
      if (moved) {
        savePosition(lastPos);
        suppressClickRef.current = true;
      }
    },
    [savePosition],
  );

  const handleClick = useCallback(
    (e) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      if (href) return;
      e.preventDefault();
      if (!target) return;
      bringToFront(target);
      const node = document.getElementById(target);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        node.focus({ preventScroll: true });
      }
    },
    [bringToFront, target, href],
  );

  const Tag = href ? 'a' : 'button';
  const extra = href ? { href, rel: 'noopener' } : { type: 'button' };

  const style = isDesktop
    ? { position: 'absolute', left: pos.x, top: pos.y }
    : undefined;

  return (
    <Tag
      {...extra}
      className="win95-desktop-icon"
      aria-label={label}
      style={style}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className="win95-desktop-icon__glyph">
        <AppGlyph kind={kind} />
      </span>
      <span className="win95-desktop-icon__label">{label}</span>
    </Tag>
  );
}
