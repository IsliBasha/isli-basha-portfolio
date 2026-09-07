import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MODIFIER_KEYS } from '../lib/keys.js';
import { useDialogFocus } from '../hooks/useDialogFocus.js';

// The same key BootSequence writes when the POST screens have played. Clearing
// it is what makes a restart boot rather than drop straight to the desktop.
const BOOT_SEEN_KEY = 'isli-boot-seen';

const SAFE_TO_TURN_OFF = "It's now safe to turn off your computer.";
const RESTART_BLOCKED = 'Restart blocked by the browser. Press F5 to reload.';

const MODES = [
  { id: 'shut-down', label: 'Shut down the computer?' },
  { id: 'restart', label: 'Restart the computer?' },
];

function defaultReload() {
  window.location.reload();
}

function forgetBootSeen() {
  try {
    window.sessionStorage.removeItem(BOOT_SEEN_KEY);
  } catch {
    /* storage unavailable: the boot screens simply stay skipped */
  }
}

/**
 * Shut Down Windows, and the amber screen behind it.
 *
 * `reload` is a prop because the restart path ends in a navigation, which a
 * test cannot let happen. Everything before it -- clearing the boot flag so
 * the POST sequence plays again -- is the part worth asserting on.
 *
 * Backing out with No or Escape does not restore focus here: StartMenu puts it
 * on the Start button, because the menu this dialog came from unmounted the
 * moment the dialog appeared.
 */
export function ShutDown({ open, onClose, reload = defaultReload }) {
  const [mode, setMode] = useState('shut-down');
  const [poweredOff, setPoweredOff] = useState(false);
  const [restartBlocked, setRestartBlocked] = useState(false);
  const yesRef = useRef(null);
  const screenRef = useRef(null);
  const titleId = useId();

  // Every way back to a closed dialog runs through here, which is why the
  // choice is cleared on the way out rather than on the way in: an effect that
  // reset it when `open` flipped would re-render the dialog for nothing.
  // Harmless rather than load-bearing since this chunk went lazy — StartMenu
  // renders it only while it is the open dialog, so it unmounts on the way out
  // and React throws the three pieces of state away with it.
  const dismiss = useCallback(() => {
    setMode('shut-down');
    setPoweredOff(false);
    setRestartBlocked(false);
    onClose();
  }, [onClose]);

  // Win95 put focus on Yes, not on the radio group: the dialog's whole job is
  // to be confirmed or dismissed, and the default choice is already made.
  const { dialogRef, onKeyDown } = useDialogFocus({
    open: open && !poweredOff && !restartBlocked,
    onEscape: dismiss,
    initialFocusRef: yesRef,
  });

  const restart = useCallback(() => {
    forgetBootSeen();
    try {
      reload();
    } catch {
      // A sandboxed frame or a hardened extension can refuse a scripted
      // reload. The desktop is already gone by this point, so swallowing it
      // would leave a black rectangle that answers to nothing -- say what
      // happened and name the key that still works.
      setRestartBlocked(true);
    }
  }, [reload]);

  // A refused restart from the radio path never powers the machine off, but it
  // still has to say so somewhere, so the black screen is what carries the
  // message in both cases.
  const screenShowing = open && (poweredOff || restartBlocked);

  useEffect(() => {
    if (!screenShowing) return undefined;
    screenRef.current?.focus();
    // Nothing left to wake into: reload() has already been refused once and
    // will be refused again, so every keypress would just re-clear a flag.
    if (restartBlocked) return undefined;
    const wake = (event) => {
      // Shift alone is not "press any key". Waking on it restarted the
      // machine for anyone who reached for a capital letter or tabbed away.
      if (MODIFIER_KEYS.has(event.key)) return;
      restart();
    };
    window.addEventListener('keydown', wake);
    return () => window.removeEventListener('keydown', wake);
  }, [screenShowing, restartBlocked, restart]);

  const handleYes = useCallback(() => {
    if (mode === 'restart') {
      restart();
      return;
    }
    setPoweredOff(true);
  }, [mode, restart]);

  if (!open) return null;

  if (screenShowing) {
    return (
      <div
        ref={screenRef}
        className={
          restartBlocked ? 'win95-poweroff win95-poweroff--stuck' : 'win95-poweroff'
        }
        role="alert"
        tabIndex={-1}
        onClick={restartBlocked ? undefined : restart}
      >
        <p className="win95-poweroff__text">
          {restartBlocked ? RESTART_BLOCKED : SAFE_TO_TURN_OFF}
        </p>
      </div>
    );
  }

  return (
    <div className="win-dialog-overlay" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="win-dialog win-shutdown"
        onKeyDown={onKeyDown}
      >
        <div className="win95-window__titlebar" style={{ margin: 2 }}>
          <span className="win95-window__title" id={titleId}>
            Shut Down Windows
          </span>
          <div className="win95-window__buttons" aria-hidden="true">
            <span className="win95-titlebar-btn">×</span>
          </div>
        </div>
        <div
          className="win-shutdown__options"
          role="radiogroup"
          aria-labelledby={titleId}
        >
          {MODES.map((option) => (
            <label key={option.id} className="win-shutdown__option">
              <input
                type="radio"
                name="shutdown-mode"
                value={option.id}
                checked={mode === option.id}
                onChange={() => setMode(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <div className="win-shutdown__actions">
          <button ref={yesRef} type="button" className="win-btn" onClick={handleYes}>
            Yes
          </button>
          <button type="button" className="win-btn" onClick={dismiss}>
            No
          </button>
          <button type="button" className="win-btn" disabled>
            Help
          </button>
        </div>
      </div>
    </div>
  );
}
