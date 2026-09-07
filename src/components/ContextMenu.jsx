import { useEffect, useRef, useState } from 'react';
import { SystemDialog } from './SystemDialog.jsx';
import { useWindowStack } from '../context/windowStackContext.js';

const ITEMS = [
  { label: 'New Folder', key: 'new-folder' },
  // `submenu` draws the right-pointing marker as a CSS triangle. It used to
  // be a literal U+25B6, which a colour-emoji font renders as an anti-aliased
  // pictograph -- the one thing this desktop's chrome must never contain.
  { label: 'Arrange Icons By', key: 'arrange', submenu: true },
  { label: '---' },
  { label: 'Refresh', key: 'refresh' },
  { label: '---' },
  { label: 'Paste', key: 'paste' },
  { label: 'Paste Shortcut', key: 'paste-shortcut' },
  { label: '---' },
  { label: 'Properties', key: 'properties' },
];

export function ContextMenu({ x, y, onClose }) {
  const menuRef = useRef(null);
  const { bringToFront } = useWindowStack();
  const [notImplemented, setNotImplemented] = useState(false);

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
      // The desktop's Properties is the Display Properties sheet, exactly as it
      // was in Win95 -- not a dialog reciting the machine's specs.
      bringToFront('display', { focus: true });
      onClose();
      return;
    }
    setNotImplemented(true);
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
                className={
                  item.submenu
                    ? 'win95-context-menu__item win95-context-menu__item--submenu'
                    : 'win95-context-menu__item'
                }
                onClick={() => handleItem(item.key)}
              >
                {item.label}
              </button>
            </li>
          ),
        )}
      </ul>
      <SystemDialog
        open={notImplemented}
        title="Desktop"
        message="This feature is not implemented."
        onClose={() => { setNotImplemented(false); onClose(); }}
      />
    </>
  );
}
