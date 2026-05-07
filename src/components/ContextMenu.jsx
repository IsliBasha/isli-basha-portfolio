import { useEffect, useRef, useState } from 'react';
import { SystemDialog } from './SystemDialog.jsx';

const ITEMS = [
  { label: 'New Folder', key: 'new-folder' },
  { label: 'Arrange Icons By ▶', key: 'arrange' },
  { label: '---' },
  { label: 'Refresh', key: 'refresh' },
  { label: '---' },
  { label: 'Paste', key: 'paste' },
  { label: 'Paste Shortcut', key: 'paste-shortcut' },
  { label: '---' },
  { label: 'Properties', key: 'properties' },
];

function getPropertiesMessage() {
  const res = `${window.innerWidth}×${window.innerHeight}`;
  return [
    'OS    : Microsoft Windows 95 (React 19)',
    'CPU  : Intel 80486 DX/2',
    'RAM  : Sufficient',
    `RES  : ${res}`,
    'THEME: Classic',
  ].join('\n');
}

export function ContextMenu({ x, y, onClose }) {
  const menuRef = useRef(null);
  const [dialog, setDialog] = useState(null);

  const clampedX = Math.min(x, window.innerWidth - 190);
  const clampedY = Math.min(y, window.innerHeight - 280);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    window.addEventListener('pointerdown', handler);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleItem = (key) => {
    if (key === 'properties') {
      setDialog({ title: 'Desktop Properties', message: getPropertiesMessage() });
    } else {
      setDialog({ title: 'Desktop', message: 'This feature is not implemented.' });
    }
  };

  return (
    <>
      <ul
        ref={menuRef}
        className="win95-context-menu"
        style={{ left: clampedX, top: clampedY }}
        role="menu"
        aria-label="Desktop context menu"
      >
        {ITEMS.map((item, i) =>
          item.label === '---' ? (
            <li key={i} className="win95-context-menu__sep" role="separator" />
          ) : (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                className="win95-context-menu__item"
                onClick={() => handleItem(item.key)}
              >
                {item.label}
              </button>
            </li>
          ),
        )}
      </ul>
      <SystemDialog
        open={dialog !== null}
        title={dialog?.title ?? 'Desktop'}
        message={dialog?.message ?? ''}
        onClose={() => { setDialog(null); onClose(); }}
      />
    </>
  );
}
