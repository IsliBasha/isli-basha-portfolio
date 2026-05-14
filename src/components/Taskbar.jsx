import { useCallback, useEffect, useRef, useState } from 'react';
import { useClock } from '../hooks/useClock.js';
import { useWindowStack } from '../context/windowStackContext.js';
import { clearWindowPositions } from '../hooks/useWindowPosition.js';
import { AppGlyph } from '../lib/AppGlyph.jsx';

const MENU_ITEMS = [
  { id: 'about', label: 'About', icon: 'info' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'stack', label: 'Stack', icon: 'term' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
];

function StartIcon() {
  return (
    <svg
      className="win95-start-btn__icon"
      viewBox="0 0 16 15"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Win95 waving-flag perspective — left column leans slightly */}
      <polygon points="1,0 7,0 7,6 0,7"    fill="#bf1700" /> {/* brick red   */}
      <polygon points="8,0 14,0 14,6 8,6"   fill="#1e7800" /> {/* forest green */}
      <polygon points="0,8 7,7 7,13 0,13"   fill="#1040c0" /> {/* deep blue   */}
      <polygon points="8,8 14,8 14,14 8,14" fill="#cc9800" /> {/* amber yellow */}
      {/* 1-px cream divider cross */}
      <rect x="7"  y="0" width="1" height="14" fill="#c0b890" />
      <rect x="0"  y="7" width="7" height="1"  fill="#c0b890" />
      <rect x="8"  y="7" width="6" height="1"  fill="#c0b890" />
      {/* 1-px drop shadow at bottom-right for depth */}
      <rect x="1"  y="14" width="13" height="1" fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

function MenuGlyph({ kind }) {
  if (kind === 'info') {
    return (
      <svg viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="2" y="2" width="14" height="14" fill="#ffffff" stroke="#000000" />
        <rect x="8" y="5" width="2" height="2" fill="#000080" />
        <rect x="7" y="8" width="4" height="1" fill="#000080" />
        <rect x="8" y="9" width="2" height="4" fill="#000080" />
      </svg>
    );
  }
  if (kind === 'folder') {
    return (
      <svg viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="1" y="5" width="16" height="11" fill="#f4c430" stroke="#000000" />
        <rect x="1" y="3" width="7" height="3" fill="#f4c430" stroke="#000000" />
      </svg>
    );
  }
  if (kind === 'term') {
    return (
      <svg viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="1" y="2" width="16" height="13" fill="#0c0c0c" stroke="#000000" />
        <text x="3" y="11" fontFamily="monospace" fontSize="7" fill="#33ff33">
          &gt;_
        </text>
      </svg>
    );
  }
  if (kind === 'reset') {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true">
        <path
          d="M9 3 a6 6 0 1 1 -5.5 8.5"
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <polygon points="9,1 13,4 9,5" fill="#1a1a2e" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="1" y="4" width="16" height="10" fill="#ffffff" stroke="#000000" />
      <polyline
        points="1,4 9,11 17,4"
        fill="none"
        stroke="#000000"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Taskbar() {
  const [open, setOpen] = useState(false);
  const time = useClock();
  const ref = useRef(null);
  const btnRef = useRef(null);
  const { bringToFront, hide, openWindows } = useWindowStack();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target) && !btnRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = useCallback(
    (id) => {
      setOpen(false);
      bringToFront(id);
      const node = document.getElementById(id);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        node.focus({ preventScroll: true });
      }
    },
    [bringToFront],
  );

  const handleTaskClick = useCallback(
    (entry) => {
      if (entry.hidden) {
        bringToFront(entry.id);
        return;
      }
      if (entry.active) {
        hide(entry.id, entry.title);
        return;
      }
      bringToFront(entry.id);
    },
    [bringToFront, hide],
  );

  const handleResetDesktop = useCallback(() => {
    setOpen(false);
    clearWindowPositions();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  return (
    <nav className="win95-taskbar" role="navigation" aria-label="Taskbar">
      <button
        ref={btnRef}
        type="button"
        className="win-btn win95-start-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-pressed={open}
        onClick={() => setOpen((v) => !v)}
      >
        <StartIcon />
        <span>Start</span>
      </button>
      {open ? (
        <div
          ref={ref}
          className="win95-start-menu"
          role="menu"
          aria-label="Start menu"
        >
          <div className="win95-start-menu__stripe">sys95</div>
          <ul className="win95-start-menu__list">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  className="win95-start-menu__item"
                  onClick={() => handleSelect(item.id)}
                >
                  <MenuGlyph kind={item.icon} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li role="separator" className="win95-start-menu__sep" />
            <li>
              <button
                type="button"
                role="menuitem"
                className="win95-start-menu__item"
                onClick={handleResetDesktop}
              >
                <MenuGlyph kind="reset" />
                <span>Reset desktop</span>
              </button>
            </li>
          </ul>
        </div>
      ) : null}
      <ul className="win95-taskbar__tasks" aria-label="Open windows">
        {openWindows.map((entry) => {
          const cls = [
            'win-btn',
            'win95-taskbar__task',
            entry.active && !entry.hidden ? 'win95-taskbar__task--active' : '',
            entry.hidden ? 'win95-taskbar__task--hidden' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={entry.id}>
              <button
                type="button"
                className={cls}
                aria-pressed={entry.active && !entry.hidden}
                onClick={() => handleTaskClick(entry)}
              >
                <span className="win95-taskbar__task-icon" aria-hidden="true">
                  <AppGlyph kind={entry.id} size={16} />
                </span>
                <span className="win95-taskbar__task-label">{entry.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div
        className="win95-taskbar__clock"
        aria-label={`Current time ${time}`}
      >
        {time}
      </div>
    </nav>
  );
}
