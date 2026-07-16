import { useEffect } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { bio } from '../../data/bio.js';

// 1 ABOUT — hand-crafted 1-bit portrait + bio, all pulled from data/bio.js.
// PORTRAIT is a draft pixel bust: '#' = lit ink pixel, space = unlit LCD.
// Right softkey Back; Esc / Backspace also go Back. Content scrolls natively.
const PORTRAIT = [
  '   #####   ',
  '  #     #  ',
  ' #       # ',
  ' #  # #  # ',
  ' #       # ',
  ' #   #   # ',
  ' #       # ',
  ' #  ###  # ',
  '  #     #  ',
  '   #####   ',
  '    ###    ',
  '  #######  ',
  ' ######### ',
];

// Short, honest skills line (all present in data/stack.js).
const SKILLS = 'Python · Rust · TypeScript · Kotlin · React · FastAPI';

export function About({ onBack }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <NokiaShell
      header={<SectionHeader title="1 About" />}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--about"
    >
      <div
        className="nk-portrait"
        role="img"
        aria-label={`Pixel portrait of ${bio.name}`}
        style={{ '--nk-portrait-cols': PORTRAIT[0].length }}
      >
        {PORTRAIT.flatMap((row, y) =>
          [...row].map((cell, x) => (
            <span
              key={`${y}-${x}`}
              aria-hidden="true"
              className={`nk-portrait__px ${cell === '#' ? 'is-on' : ''}`}
            />
          )),
        )}
      </div>

      <div className="nk-about__name">{bio.name}</div>
      <div className="nk-about__title">
        {bio.title} · {bio.employer}
      </div>

      <div className="nk-body nk-about__bio">
        {bio.paragraphs.map((para, i) => (
          <p key={i} className="nk-about__para">
            {para}
          </p>
        ))}
      </div>

      <div className="nk-about__skills">&gt; {SKILLS}</div>
      <div className="nk-scroll-hint" aria-hidden="true">
        ▼
      </div>
    </NokiaShell>
  );
}
