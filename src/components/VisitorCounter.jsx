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
        <div className="visitor-led__titlebar" aria-hidden="true">
          <span>▣</span>
          <span>SiteCounter 1.0</span>
        </div>
        <div className="visitor-led__screen">
          <div className="visitor-led__label">TOTAL HITS</div>
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
        </div>
        <div className="visitor-led__statusbar" aria-hidden="true">▶ Running</div>
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
