import { useEffect } from 'react';
import { NokiaShell } from '../NokiaShell.jsx';

// 3 MESSAGES → delivery confirmation. Shown after a successful send. Because
// the composer captures no reply-to address, the copy promises delivery, not a
// reply. OK softkey (or Enter / Esc, or the auto-return timer) returns to menu.
const AUTO_RETURN_MS = 3500;

export function Delivery({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, AUTO_RETURN_MS);
    const onKey = (event) => {
      if (['Enter', 'Escape', 'Backspace'].includes(event.key)) {
        event.preventDefault();
        onDone();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  return (
    <NokiaShell
      centerKey={{ label: 'OK', action: onDone }}
      className="nk-screen--delivery"
    >
      <div className="nk-delivery" role="status">
        <div className="nk-envelope" aria-hidden="true">
          <span className="nk-envelope__flap" />
        </div>
        <div className="nk-delivery__msg">Message sent</div>
        <div className="nk-delivery__sub">Thanks for the note.</div>
      </div>
    </NokiaShell>
  );
}
