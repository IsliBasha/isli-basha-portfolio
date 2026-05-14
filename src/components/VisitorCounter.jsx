import { useState } from 'react';
import { useVisitorCount } from '../hooks/useVisitorCount.js';
import { SystemDialog } from './SystemDialog.jsx';

function formatCount(count) {
  if (count == null) return '---,---';
  const s = String(count).padStart(6, '0');
  return `${s.slice(0, 3)},${s.slice(3)}`;
}

export function VisitorCounterContent() {
  const count = useVisitorCount();
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <div className="explorer-menubar" role="menubar">
        {['File', 'View', 'Help'].map((item) => (
          <button
            key={item}
            type="button"
            className="explorer-menu-item"
            role="menuitem"
          >
            {item}
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

      <div className="explorer-statusbar">Online</div>

      <SystemDialog
        open={dialog}
        title="SiteCounter"
        message={`You are visitor number ${count?.toLocaleString()}!`}
        onClose={() => setDialog(false)}
      />
    </>
  );
}
