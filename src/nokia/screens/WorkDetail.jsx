import { useEffect } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { projects } from '../../data/projects.js';

// 2 MY WORK detail — one project per page. Left / Right (or Up / Down) arrows
// page through projects, wrapping at the ends. Left softkey Visit opens the
// repo; Esc / Backspace / right softkey go Back. The screenshot frame is a
// 1-bit hatch placeholder until Phase 4 renders real dithered captures.
export function WorkDetail({ index, onPage, onBack }) {
  const total = projects.length;
  const safeIndex = ((index % total) + total) % total;
  const project = projects[safeIndex];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        onPage((safeIndex + 1) % total);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        onPage((safeIndex - 1 + total) % total);
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [safeIndex, total, onPage, onBack]);

  const visit = () =>
    window.open(project.href, '_blank', 'noopener,noreferrer');

  return (
    <NokiaShell
      header={
        <SectionHeader title="2 My Work" context={`${safeIndex + 1}/${total}`} />
      }
      leftKey={{ label: 'Visit', action: visit }}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--work-detail"
    >
      <div className="nk-detail__title">{project.name}</div>
      <div className="nk-detail__meta">
        {project.stack[0]} · {project.tag}
      </div>

      <div className="nk-detail__frame" aria-hidden="true">
        <span className="nk-detail__frame-label">{project.iconType}</span>
      </div>

      <p className="nk-body nk-detail__desc">{project.description}</p>

      <div className="nk-detail__stack">&gt; {project.stack.join(' · ')}</div>

      <div className="nk-detail__pager" aria-hidden="true">
        ◄ {safeIndex + 1} / {total} ►
      </div>
    </NokiaShell>
  );
}
