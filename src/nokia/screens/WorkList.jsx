import { useEffect, useState } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { projects } from '../../data/projects.js';

// 2 MY WORK — scrollable project list. Focused row inverts (ink fill). Header
// shows n/total. Left softkey Open (focused project); digits 1-9 jump the
// highlight; arrows move it; Enter opens; Esc / Backspace go Back.
export function WorkList({ initialFocus = 0, onOpen, onBack }) {
  const [focus, setFocus] = useState(() =>
    Math.min(Math.max(initialFocus, 0), projects.length - 1),
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocus((f) => (f + 1) % projects.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocus((f) => (f - 1 + projects.length) % projects.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onOpen(focus);
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      } else if (/^[1-9]$/.test(event.key)) {
        const idx = Number(event.key) - 1;
        if (idx < projects.length) {
          event.preventDefault();
          setFocus(idx);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, onOpen, onBack]);

  return (
    <NokiaShell
      header={
        <SectionHeader
          title="2 My Work"
          context={`${focus + 1}/${projects.length}`}
        />
      }
      leftKey={{ label: 'Open', action: () => onOpen(focus) }}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--work"
    >
      <ul className="nk-work-list" role="menu" aria-label="Projects">
        {projects.map((project, i) => (
          <li
            key={project.id}
            role="menuitem"
            tabIndex={-1}
            aria-current={i === focus ? true : undefined}
            className={`nk-work-item ${i === focus ? 'nk-work-item--focused' : ''}`}
            onMouseEnter={() => setFocus(i)}
            onClick={() => onOpen(i)}
          >
            <span className="nk-work-item__name">{project.name}</span>
            <span className="nk-work-item__meta">
              {project.stack[0]} · {project.tag}
            </span>
          </li>
        ))}
      </ul>
    </NokiaShell>
  );
}
