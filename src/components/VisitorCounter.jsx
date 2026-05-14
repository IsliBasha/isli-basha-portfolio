import { useState } from 'react';
import { useVisitorCount } from '../hooks/useVisitorCount.js';
import { SystemDialog } from './SystemDialog.jsx';

function padCount(count) {
  return count != null ? String(count).padStart(6, '0') : '------';
}

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
