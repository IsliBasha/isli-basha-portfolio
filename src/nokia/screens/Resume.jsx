import { useEffect } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { resume } from '../../data/resume.js';

// 4 RESUME — Experience + Education from data/resume.js. Each entry leads with
// its org (the "> " line), with role / period / location dimmed beneath. Left
// softkey Download opens the same /resume.pdf the desktop serves; Enter also
// downloads; Esc / Backspace / right softkey go Back.
function downloadPdf() {
  const link = document.createElement('a');
  link.href = resume.pdf;
  link.download = 'isli-basha-resume.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function EntryList({ heading, entries }) {
  return (
    <>
      <div className="nk-resume__heading">{heading}</div>
      {entries.map((entry) => (
        <div key={`${entry.org}-${entry.period}`} className="nk-resume__entry">
          <div className="nk-resume__org">&gt; {entry.org}</div>
          <div className="nk-resume__role">{entry.role}</div>
          <div className="nk-resume__meta">
            {entry.period} · {entry.location}
          </div>
        </div>
      ))}
    </>
  );
}

export function Resume({ onBack }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        downloadPdf();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <NokiaShell
      header={<SectionHeader title="4 Resume" />}
      leftKey={{ label: 'Download', action: downloadPdf }}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--resume"
    >
      <EntryList heading="— Experience —" entries={resume.experience} />
      <EntryList heading="— Education —" entries={resume.education} />

      <a className="nk-resume__pdf" href={resume.pdf} download>
        [ Download PDF ]
      </a>
    </NokiaShell>
  );
}
