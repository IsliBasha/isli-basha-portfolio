import { useEffect, useState } from 'react';
import { MODIFIER_KEYS } from '../lib/keys.js';

export function BSOD() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onTrigger = (event) => {
      if (!event.ctrlKey || !event.shiftKey) return;
      if (event.key?.toLowerCase() !== 'b') return;
      event.preventDefault();
      setVisible(true);
    };
    window.addEventListener('keydown', onTrigger);
    return () => window.removeEventListener('keydown', onTrigger);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const onDismiss = (event) => {
      if (MODIFIER_KEYS.has(event.key)) return;
      setVisible(false);
    };
    const onClick = () => setVisible(false);
    window.addEventListener('keydown', onDismiss);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onDismiss);
      window.removeEventListener('mousedown', onClick);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-label="System error"
      aria-modal="true"
      className="win95-bsod"
    >
      <div className="win95-bsod__inner">
        <div className="win95-bsod__banner">Windows</div>
        <p>
          A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +
          00010E36. The current application will be terminated.
        </p>
        <ul className="win95-bsod__list">
          <li>* Press any key to terminate the current application.</li>
          <li>
            * Press CTRL+ALT+DEL again to restart your computer. You will lose
            any unsaved information in all applications.
          </li>
        </ul>
        <p className="win95-bsod__prompt">Press any key to continue _</p>
      </div>
    </div>
  );
}
