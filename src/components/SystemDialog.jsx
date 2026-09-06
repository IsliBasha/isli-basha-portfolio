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

export function SystemDialog({
  open,
  title = 'Message',
  message,
  onClose = () => {},
}) {
  const btnRef = useRef(null);

  // The current onClose, reachable from the focus effect below without being a
  // dependency of it. Keyed on the callback, that effect re-ran on every parent
  // render that passed a fresh closure — Minesweeper re-renders once a second
  // while its clock runs — and every re-run went through the cleanup, which
  // hands focus back to whatever held it before the dialog opened. Focus left
  // the OK button and came back once a second. Holding the callback in a ref
  // means no caller can re-arm that by passing an inline arrow.
  //
  // Synced in an effect rather than written during render: a ref write in the
  // render body is what react-hooks/refs exists to stop, and nothing reads
  // .current until a keydown, which is long after this has run.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    btnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onCloseRef.current();
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
      // A detached node keeps its .focus method, so the old typeof check
      // passed and the call moved nothing — focus fell to <body>. Reached
      // whenever the trigger goes with the dialog: ContextMenu tears down
      // its menu in the same commit, and closing a Minesweeper window
      // takes its Help item along. Nothing left in the tree here is a
      // sensible anchor — the dialog is unmounting too — so an unreachable
      // trigger simply gets no handover.
      if (prev?.isConnected) prev.focus();
    };
  }, [open]);

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
