import { useEffect, useRef } from 'react';
import { NokiaShell } from '../NokiaShell.jsx';

// 01 BOOT — plays once per session (the sessionStorage gate lives in NokiaApp).
// Logo blocks + name + tagline + a progress bar that fills over ~1.8s, then
// hands off to Idle. Tapping anywhere skips.
const BOOT_MS = 1800;

export function Boot({ onDone }) {
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    // Safety fallback in case the CSS animationend event is missed.
    const timer = setTimeout(finish, BOOT_MS + 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NokiaShell bare>
      <div className="nk-boot" onClick={finish} role="presentation">
        <div className="nk-boot__blocks" aria-hidden="true">
          <span className="nk-boot__block" />
          <span className="nk-boot__block" />
          <span className="nk-boot__block" />
        </div>
        <div className="nk-boot__name">ISLI</div>
        <div className="nk-boot__tag">connecting people to my work</div>
        <div className="nk-boot__bar" aria-hidden="true">
          <div className="nk-boot__fill" onAnimationEnd={finish} />
        </div>
        <span className="nk-sr-only">Loading portfolio…</span>
      </div>
    </NokiaShell>
  );
}
