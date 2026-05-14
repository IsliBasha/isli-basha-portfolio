import { useState } from 'react';
import { useVisitorCount } from '../hooks/useVisitorCount.js';
import { SystemDialog } from './SystemDialog.jsx';

function formatCount(count) {
  if (count == null) return '---,---';
  const s = String(count).padStart(6, '0');
  return `${s.slice(0, 3)},${s.slice(3)}`;
}

export function VisitorCounterLed() {
  const count = useVisitorCount();
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <div
        className="visitor-win"
        role="complementary"
        aria-label="Site visitor count"
      >
        <div className="visitor-win__titlebar">
          <span className="visitor-win__icon" aria-hidden="true">▣</span>
          <span className="visitor-win__title-text">SiteCounter</span>
          <div className="visitor-win__btns" aria-hidden="true">
            <span className="visitor-win__ctrl">_</span>
            <span className="visitor-win__ctrl">×</span>
          </div>
        </div>

        <div className="explorer-menubar" aria-hidden="true">
          {['File', 'View', 'Help'].map((m) => (
            <button key={m} type="button" className="explorer-menu-item" tabIndex={-1}>
              {m}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="visitor-win__body"
          onClick={() => count != null && setDialog(true)}
          aria-label={`${count ?? 'loading'} site visits — click for details`}
        >
          <div className="visitor-win__panel">
            <span className="visitor-win__label">SITE VISITS</span>
            <span className="visitor-win__count" aria-live="polite">
              {formatCount(count)}
            </span>
          </div>
        </button>

        <div className="visitor-win__status" aria-hidden="true">
          <span className="visitor-win__status-dot" />
          Online
        </div>
      </div>

      <SystemDialog
        open={dialog}
        title="SiteCounter"
        message={`You are visitor number ${count?.toLocaleString()}!`}
        onClose={() => setDialog(false)}
      />
    </>
  );
}
