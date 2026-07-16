import { useEffect, useState } from 'react';
import { NokiaShell, StatusHeader } from '../NokiaShell.jsx';

// 03 MENU — numbered list 1-6. Focused row inverts (ink fill, LCD text, ►).
// Tap opens; digits 1-6 open directly; arrows move the highlight; Enter =
// left softkey (Select); Escape / Backspace = Back.
const MENU_ITEMS = [
  { n: 1, label: 'About', route: '/about' },
  { n: 2, label: 'My Work', route: '/work' },
  { n: 3, label: 'Messages', route: '/messages' },
  { n: 4, label: 'Resume', route: '/resume' },
  { n: 5, label: 'Counter', route: '/counter' },
  { n: 6, label: 'Games', route: '/games' },
];

export function Menu({ time, onSelect, onBack }) {
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocus((f) => (f + 1) % MENU_ITEMS.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocus((f) => (f - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onSelect(MENU_ITEMS[focus].route);
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      } else if (/^[1-6]$/.test(event.key)) {
        event.preventDefault();
        onSelect(MENU_ITEMS[Number(event.key) - 1].route);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, onSelect, onBack]);

  return (
    <NokiaShell
      header={<StatusHeader time={time} />}
      leftKey={{ label: 'Select', action: () => onSelect(MENU_ITEMS[focus].route) }}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--menu"
    >
      <div className="nk-menu-title">— Menu —</div>
      <ul className="nk-menu-list" role="menu" aria-label="Main menu">
        {MENU_ITEMS.map((item, i) => (
          <li
            key={item.n}
            role="menuitem"
            tabIndex={-1}
            aria-current={i === focus ? true : undefined}
            className={`nk-menu-item ${i === focus ? 'nk-menu-item--focused' : ''}`}
            onMouseEnter={() => setFocus(i)}
            onClick={() => onSelect(item.route)}
          >
            <span className="nk-menu-item__label">
              {item.n} {item.label}
            </span>
            <span className="nk-menu-item__glyph" aria-hidden="true">
              ►
            </span>
          </li>
        ))}
      </ul>
    </NokiaShell>
  );
}
