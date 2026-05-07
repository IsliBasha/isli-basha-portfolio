import { useEffect, useState } from 'react';
import { playBootChime } from '../lib/bootChime.js';

const STORAGE_KEY = 'isli-boot-seen';

const PHASE_DURATIONS = {
  bios: 1200,
  memcheck: 1800,
  splash: 1500,
};

const TOTAL_RAM = 524288; // KB — 512 MB, era-appropriate stretch
const RAM_TICKS = 24;

function shouldSkipUpFront() {
  if (typeof window === 'undefined') return true;

  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) === '1') return true;
  } catch {
    /* sessionStorage unavailable — proceed normally */
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  return false;
}

function markBootSeen() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* fail silently */
  }
}

export function BootSequence() {
  const [phase, setPhase] = useState(() =>
    shouldSkipUpFront() ? 'done' : 'bios',
  );
  const [memKb, setMemKb] = useState(0);

  useEffect(() => {
    if (phase !== 'bios') return undefined;
    playBootChime();
    const t = setTimeout(() => setPhase('memcheck'), PHASE_DURATIONS.bios);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'memcheck') return undefined;
    const step = PHASE_DURATIONS.memcheck / RAM_TICKS;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setMemKb(Math.round((TOTAL_RAM * i) / RAM_TICKS));
      if (i >= RAM_TICKS) clearInterval(interval);
    }, step);
    const t = setTimeout(() => setPhase('splash'), PHASE_DURATIONS.memcheck);
    return () => {
      clearInterval(interval);
      clearTimeout(t);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'splash') return undefined;
    const t = setTimeout(() => setPhase('done'), PHASE_DURATIONS.splash);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') {
      markBootSeen();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') return undefined;
    const skip = (event) => {
      if (
        event.type === 'click' ||
        event.key === 'Escape' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        setPhase('done');
      }
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`boot-overlay boot-overlay--${phase}`}
      role="dialog"
      aria-label="System boot"
      onClick={() => setPhase('done')}
    >
      {phase === 'bios' ? <BiosScreen /> : null}
      {phase === 'memcheck' ? <MemCheckScreen memKb={memKb} /> : null}
      {phase === 'splash' ? <SplashScreen /> : null}
      <button
        type="button"
        className="boot-skip"
        onClick={(e) => {
          e.stopPropagation();
          setPhase('done');
        }}
        aria-label="Skip boot animation"
      >
        Press ESC to skip
      </button>
    </div>
  );
}

function BiosScreen() {
  return (
    <pre className="boot-bios">
{`AMI BIOS (C) 1995 American Megatrends Inc.,
ISLI-BIOS Rev. 1.04 — released 04/25/1995

CPU: Intel Pentium(R) 90 MHz
Press DEL to enter SETUP, ESC to skip POST.

Detecting IDE Master ........... ISLI HDD-300
Detecting IDE Slave  ........... CD-ROM 4x
Detecting Floppy A:  ........... 1.44 MB
Detecting USB        ........... none

System BIOS shadowed
Video BIOS shadowed
Initializing portfolio ROM...
`}
    </pre>
  );
}

function MemCheckScreen({ memKb }) {
  const padded = String(memKb).padStart(7, '0');
  return (
    <pre className="boot-bios">
{`AMI BIOS (C) 1995 American Megatrends Inc.,

Memory Test: ${padded}K OK
`}
    </pre>
  );
}

function SplashScreen() {
  return (
    <div className="boot-splash">
      <div className="boot-splash__cloud" aria-hidden="true">
        <span className="boot-splash__pane boot-splash__pane--r" />
        <span className="boot-splash__pane boot-splash__pane--g" />
        <span className="boot-splash__pane boot-splash__pane--b" />
        <span className="boot-splash__pane boot-splash__pane--y" />
      </div>
      <p className="boot-splash__tag">Starting Windows 95...</p>
      <div className="boot-splash__bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
