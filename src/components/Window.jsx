import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowStack } from '../context/windowStackContext.js';
import { useWindowPosition } from '../hooks/useWindowPosition.js';
import { computeResize } from '../lib/resizeWindow.js';

const DESKTOP_MIN_WIDTH = 1024;
const TASKBAR_H = 34;
const TITLEBAR_VISIBLE_PX = 40;
const MIN_VISIBLE_PX = 80;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export function Window({
  id,
  title,
  icon = null,
  className = '',
  bootDelayMs = 0,
  children,
  contentClassName = '',
}) {
  const isDesktop = useIsDesktop();
  const {
    bringToFront,
    getZ,
    hide,
    close,
    toggleMaximize,
    registerTitle,
    isHidden,
    isClosed,
    isMaximized,
  } = useWindowStack();

  useEffect(() => {
    registerTitle?.(id, title);
  }, [registerTitle, id, title]);
  const containerRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);
  const { offset, size, savePosition, saveSize, setOffset, setSize } =
    useWindowPosition(id, {
      enabled: isDesktop,
    });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const hidden = isHidden(id);
  const closed = isClosed(id);
  const maximized = isMaximized(id);

  const handlePointerDown = useCallback(
    (event) => {
      if (!isDesktop) return;
      if (event.button !== 0) return;
      if (maximized) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragState.current = {
        grabX: event.clientX - rect.left,
        grabY: event.clientY - rect.top,
        anchorLeft: rect.left - offset.x,
        anchorTop: rect.top - offset.y,
        width: rect.width,
        height: rect.height,
        pointerId: event.pointerId,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      bringToFront(id);
    },
    [isDesktop, maximized, offset.x, offset.y, bringToFront, id],
  );

  const handlePointerMove = useCallback(
    (event) => {
      const s = dragState.current;
      if (!s) return;

      const desiredLeft = event.clientX - s.grabX;
      const desiredTop = event.clientY - s.grabY;

      const vw = window.innerWidth;
      const vh = window.innerHeight - TASKBAR_H;
      const minLeft = MIN_VISIBLE_PX - s.width;
      const maxLeft = vw - MIN_VISIBLE_PX;
      const minTop = 0;
      const maxTop = Math.max(minTop, vh - TITLEBAR_VISIBLE_PX);

      const clampedLeft = Math.min(maxLeft, Math.max(minLeft, desiredLeft));
      const clampedTop = Math.min(maxTop, Math.max(minTop, desiredTop));

      setOffset({
        x: clampedLeft - s.anchorLeft,
        y: clampedTop - s.anchorTop,
      });
    },
    [setOffset],
  );

  const endDrag = useCallback(
    (event) => {
      const s = dragState.current;
      if (!s) return;
      try {
        event.currentTarget.releasePointerCapture(s.pointerId);
      } catch {
        /* ignore — pointer may already be released */
      }
      dragState.current = null;
      setDragging(false);
      if (isDesktop) {
        savePosition({ x: offset.x, y: offset.y });
      }
    },
    [isDesktop, savePosition, offset.x, offset.y],
  );

  const handleResizeDown = useCallback(
    (event, edge) => {
      if (!isDesktop) return;
      if (event.button !== 0) return;
      if (maximized) return;
      const el = containerRef.current;
      if (!el) return;
      event.stopPropagation();
      const rect = el.getBoundingClientRect();
      resizeState.current = {
        edge,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        pointerId: event.pointerId,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setResizing(true);
      bringToFront(id);
    },
    [isDesktop, maximized, bringToFront, id],
  );

  const handleResizeMove = useCallback(
    (event) => {
      const s = resizeState.current;
      if (!s) return;
      const next = computeResize({
        edge: s.edge,
        startWidth: s.startWidth,
        startHeight: s.startHeight,
        deltaX: event.clientX - s.startX,
        deltaY: event.clientY - s.startY,
      });
      setSize(next);
    },
    [setSize],
  );

  const endResize = useCallback(
    (event) => {
      const s = resizeState.current;
      if (!s) return;
      try {
        event.currentTarget.releasePointerCapture(s.pointerId);
      } catch {
        /* ignore */
      }
      resizeState.current = null;
      setResizing(false);
      if (isDesktop && size) {
        saveSize(size);
      }
    },
    [isDesktop, saveSize, size],
  );

  const handleFocus = useCallback(() => {
    bringToFront(id);
  }, [bringToFront, id]);

  const handleMinimize = useCallback(
    (event) => {
      event.stopPropagation();
      hide(id, title);
    },
    [hide, id, title],
  );

  const handleMaximize = useCallback(
    (event) => {
      event.stopPropagation();
      toggleMaximize(id);
    },
    [toggleMaximize, id],
  );

  const handleClose = useCallback(
    (event) => {
      event.stopPropagation();
      close(id);
    },
    [close, id],
  );

  const stopPointer = useCallback((event) => {
    event.stopPropagation();
  }, []);

  if (hidden || closed) return null;

  const z = getZ(id);

  const style = {
    '--drag-x': maximized ? '0px' : `${offset.x}px`,
    '--drag-y': maximized ? '0px' : `${offset.y}px`,
    '--tilt': maximized ? '0deg' : undefined,
    zIndex: z,
    animationDelay: `${bootDelayMs}ms`,
  };

  if (isDesktop && !maximized && size) {
    style.width = `${size.width}px`;
    style.height = `${size.height}px`;
  }

  const classes = [
    'win95-window',
    'win-boot-in',
    isDesktop && !maximized ? 'win95-window--draggable' : '',
    dragging ? 'win95-window--dragging' : '',
    resizing ? 'win95-window--resizing' : '',
    maximized ? 'win95-window--maximized' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      id={id}
      ref={containerRef}
      role="region"
      aria-label={title}
      tabIndex={-1}
      onMouseDown={handleFocus}
      onFocus={handleFocus}
      className={classes}
      style={style}
    >
      <div
        className="win95-window__titlebar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {icon ? <span className="win95-window__title-icon">{icon}</span> : null}
        <span className="win95-window__title">{title}</span>
        <div className="win95-window__buttons">
          <button
            type="button"
            className="win95-titlebar-btn"
            aria-label={`Minimize ${title}`}
            title="Minimize"
            onPointerDown={stopPointer}
            onClick={handleMinimize}
          >
            _
          </button>
          <button
            type="button"
            className="win95-titlebar-btn"
            aria-label={
              maximized ? `Restore ${title}` : `Maximize ${title}`
            }
            aria-pressed={maximized}
            title={maximized ? 'Restore' : 'Maximize'}
            onPointerDown={stopPointer}
            onClick={handleMaximize}
          >
            {maximized ? '❐' : '□'}
          </button>
          <button
            type="button"
            className="win95-titlebar-btn win95-titlebar-btn--close"
            aria-label={`Close ${title}`}
            title="Close"
            onPointerDown={stopPointer}
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      </div>
      <div className={`win95-window__content ${contentClassName}`}>
        {children}
      </div>
      {!maximized ? (
        <>
          <span
            className="win95-window__resize win95-window__resize--right"
            data-resize="right"
            aria-hidden="true"
            onPointerDown={(e) => handleResizeDown(e, 'right')}
            onPointerMove={handleResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
          <span
            className="win95-window__resize win95-window__resize--bottom"
            data-resize="bottom"
            aria-hidden="true"
            onPointerDown={(e) => handleResizeDown(e, 'bottom')}
            onPointerMove={handleResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
          <span
            className="win95-window__resize win95-window__resize--corner"
            data-resize="corner"
            aria-hidden="true"
            onPointerDown={(e) => handleResizeDown(e, 'corner')}
            onPointerMove={handleResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        </>
      ) : null}
    </section>
  );
}
