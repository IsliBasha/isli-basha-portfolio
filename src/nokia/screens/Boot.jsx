import { useEffect, useRef, useState } from 'react';
import { NokiaShell } from '../NokiaShell.jsx';

// 01 BOOT — plays once per session (the sessionStorage gate lives in
// NokiaApp). A two-hands "connecting" homage: 3 dithered keyframes step in
// whole pixels (no tweening) as fingertips meet, the tagline reveals, then a
// brief white flash hands off to Idle. Tapping anywhere skips. Original
// artwork/tagline, no Nokia branding — see handoff/IMPLEMENTATION.md.
const FRAMES = ['/nokia/boot-pixel-f1.png', '/nokia/boot-pixel-f2.png', '/nokia/boot-pixel-f3.png'];
const FRAME_2_MS = 800;
const FRAME_3_MS = 1400;
const TAGLINE_MS = 1400;
const FLASH_MS = 2200;
const BOOT_MS = 2350;

export function Boot({ onDone }) {
  const doneRef = useRef(false);
  const [frame, setFrame] = useState(0);
  const [taglineIn, setTaglineIn] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setFrame(1), FRAME_2_MS),
      setTimeout(() => setFrame(2), FRAME_3_MS),
      setTimeout(() => setTaglineIn(true), TAGLINE_MS),
      setTimeout(() => setFlashOn(true), FLASH_MS),
      // Safety fallback in case a tap-to-skip doesn't land first.
      setTimeout(finish, BOOT_MS),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NokiaShell bare>
      <div className="nk-boot" onClick={finish} role="presentation">
        <img className="nk-boot__hands" src={FRAMES[frame]} alt="" />
        <div className={`nk-boot__tagline ${taglineIn ? 'nk-boot__tagline--in' : ''}`}>
          CONNECTING TO
          <br />
          MY PORTFOLIO
        </div>
        {flashOn && <div className="nk-boot__flash" aria-hidden="true" />}
        <span className="nk-sr-only">Loading portfolio…</span>
      </div>
    </NokiaShell>
  );
}
