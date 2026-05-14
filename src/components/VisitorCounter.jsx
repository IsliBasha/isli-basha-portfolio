import { useState } from 'react';
import { useVisitorCount } from '../hooks/useVisitorCount.js';
import { SystemDialog } from './SystemDialog.jsx';

function padCount(count) {
  return count != null ? String(count).padStart(6, '0') : '------';
}

// ─────────────────────────────────────────────
// Variant A — Geocities LED widget on the desktop
// ─────────────────────────────────────────────
export function VisitorCounterLed() {
  const count = useVisitorCount();
  const [dialog, setDialog] = useState(false);
  const digits = padCount(count);

  return (
    <>
      <button
        type="button"
        className="visitor-led"
        aria-label={`Visitor counter: ${count ?? 'loading'}`}
        onClick={() => count != null && setDialog(true)}
      >
        <div className="visitor-led__label">VISITORS</div>
        <div className="visitor-led__display" aria-hidden="true">
          {digits.split('').map((d, i) => (
            <span
              key={i}
              className={`visitor-led__digit${d === '-' ? ' visitor-led__digit--off' : ''}`}
            >
              {d}
            </span>
          ))}
        </div>
      </button>

      {dialog && (
        <SystemDialog
          open={dialog}
          title="Visitor Counter"
          message={`You are visitor number ${count.toLocaleString()}!`}
          onClose={() => setDialog(false)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Variant B — Compact tray chip (goes in taskbar)
// ─────────────────────────────────────────────
export function VisitorCounterTray() {
  const count = useVisitorCount();

  return (
    <div
      className="visitor-tray"
      aria-label={`Visitor count: ${count ?? 'loading'}`}
      title={`${count ?? '…'} visitors`}
    >
      <span className="visitor-tray__eye" aria-hidden="true">👁</span>
      <span className="visitor-tray__count">
        {count != null ? count.toLocaleString() : '…'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Variant C — "Stats" Start-menu entry + dialog
// ─────────────────────────────────────────────
export function VisitorCounterStats() {
  const count = useVisitorCount();
  const [open, setOpen] = useState(false);

  const uptime = (() => {
    const start = new Date('2025-05-01');
    const days = Math.floor((Date.now() - start) / 86_400_000);
    return `${days} days`;
  })();

  return (
    <>
      <li>
        <button
          type="button"
          role="menuitem"
          className="win95-start-menu__item"
          onClick={() => setOpen(true)}
        >
          <StatsMiniIcon />
          <span>Stats</span>
        </button>
      </li>

      {open && (
        <div
          className="visitor-stats-backdrop"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="visitor-stats-dialog win-bevel-out"
            role="dialog"
            aria-label="Site statistics"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="win95-window__titlebar">
              <span className="win95-window__title">System Properties</span>
              <button
                type="button"
                className="win95-window__btn win95-window__btn--close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="visitor-stats-body">
              <div className="visitor-stats-row">
                <span className="visitor-stats-label">OS</span>
                <span>Windows 95 / React 19</span>
              </div>
              <div className="visitor-stats-row">
                <span className="visitor-stats-label">Uptime</span>
                <span>{uptime}</span>
              </div>
              <div className="visitor-stats-row visitor-stats-row--highlight">
                <span className="visitor-stats-label">Visitors</span>
                <span>{count != null ? count.toLocaleString() : '…'}</span>
              </div>
            </div>

            <div className="visitor-stats-footer">
              <button
                type="button"
                className="win-btn"
                onClick={() => setOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatsMiniIcon() {
  return (
    <svg viewBox="0 0 18 18" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="14" height="14" fill="#c0c0c0" stroke="#000" />
      <rect x="4" y="10" width="2" height="4" fill="#000080" />
      <rect x="8" y="7" width="2" height="7" fill="#000080" />
      <rect x="12" y="4" width="2" height="10" fill="#000080" />
    </svg>
  );
}
