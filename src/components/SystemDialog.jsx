import { useEffect, useRef } from 'react';

function InfoGlyph() {
  return (
    <svg
      className="win-dialog__icon"
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" fill="#ffffff" stroke="#000000" />
      <rect x="14" y="8" width="4" height="4" fill="#000080" />
      <rect x="13" y="14" width="6" height="2" fill="#000080" />
      <rect x="14" y="14" width="4" height="10" fill="#000080" />
    </svg>
  );
}

export function SystemDialog({ open, title = 'Message', message, onClose }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    btnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        // Trap focus on the single OK button
        e.preventDefault();
        btnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="win-dialog-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="win-dialog-title"
        aria-describedby="win-dialog-msg"
        className="win-dialog"
      >
        <div className="win95-window__titlebar" style={{ margin: 2 }}>
          <span className="win95-window__title" id="win-dialog-title">
            {title}
          </span>
          <div className="win95-window__buttons" aria-hidden="true">
            <span className="win95-titlebar-btn">×</span>
          </div>
        </div>
        <div className="win-dialog__body">
          <InfoGlyph />
          <p id="win-dialog-msg">{message}</p>
        </div>
        <div className="win-dialog__actions">
          <button
            ref={btnRef}
            type="button"
            className="win-btn"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
