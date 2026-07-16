import { useEffect } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { useVisitorCount } from '../../hooks/useVisitorCount.js';

// 5 COUNTER — a 5-cell inverted odometer of the shared visitor tally. Reuses
// useVisitorCount (same /api/visit the desktop hits), so both worlds count the
// same session once. While the count loads, the cells show a dim placeholder.
const CELLS = 5;

export function Counter({ onBack }) {
  const count = useVisitorCount();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const digits =
    count == null ? null : String(count).padStart(CELLS, '0').slice(-CELLS);

  return (
    <NokiaShell
      header={<SectionHeader title="5 Counter" />}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--counter"
    >
      <div className="nk-counter">
        <div
          className="nk-odometer"
          role="img"
          aria-label={
            count == null
              ? 'Loading visitor count'
              : `You are visitor number ${count}`
          }
        >
          {Array.from({ length: CELLS }).map((_, i) => (
            <span key={i} className="nk-odometer__cell">
              {digits ? digits[i] : '·'}
            </span>
          ))}
        </div>
        <div className="nk-counter__caption">
          {count == null ? 'counting…' : `you are caller no. ${count}`}
        </div>
      </div>
    </NokiaShell>
  );
}
