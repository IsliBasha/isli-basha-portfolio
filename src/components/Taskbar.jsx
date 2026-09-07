import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { useClock } from '../hooks/useClock.js';
import { useWindowStack } from '../context/windowStackContext.js';
import { PixelIcon } from './PixelIcon.jsx';
import { StartMenu } from './StartMenu.jsx';
import { WINDOW_ICONS } from '../lib/windowIcons.js';
import {
  isChimeMuted,
  setChimeMuted,
  subscribeChimeMuted,
} from '../lib/bootChime.js';

/**
 * The notification area: the boot-sound toggle and the clock, in one sunken
 * well at the right-hand end of the taskbar.
 */
function SystemTray() {
  const time = useClock();
  // Subscribed rather than copied into state: localStorage is the one that
  // knows, and it can change from another tab or from Display Properties.
  // A local copy would show the speaker the visitor last clicked here, which
  // is not the same thing as whether the next boot makes a sound.
  // Audible is the server answer: nobody has said otherwise.
  const muted = useSyncExternalStore(
    subscribeChimeMuted,
    isChimeMuted,
    () => false,
  );

  const toggle = useCallback(() => {
    setChimeMuted(!isChimeMuted());
  }, []);

  return (
    <div className="win95-tray">
      <button
        type="button"
        className="win95-tray__btn"
        aria-label={`Boot sound: ${muted ? 'off' : 'on'}`}
        aria-pressed={!muted}
        onClick={toggle}
      >
        <PixelIcon id={muted ? 'speaker-muted' : 'speaker'} size={16} />
      </button>
      <div className="win95-tray__clock" aria-label={`Current time ${time}`}>
        {time}
      </div>
    </div>
  );
}

/**
 * `reload` is threaded through to the Start menu because Reset desktop ends in
 * one, and a test that clicks it cannot be allowed to navigate the runner.
 * Undefined in the app, which is what leaves StartMenu's own default in place.
 */
export function Taskbar({ reload }) {
  const [open, setOpen] = useState(false);
  // Signed nonce handed to the Start menu: > 0 focuses its first item, < 0 its
  // last. Arrowing out of the Start button is the only way into the menu from
  // the keyboard, and the button cannot reach the items itself.
  const [focusSignal, setFocusSignal] = useState(0);
  const btnRef = useRef(null);
  const { bringToFront, hide, openWindows } = useWindowStack();

  const closeMenu = useCallback((reason) => {
    setOpen(false);
    setFocusSignal(0);
    if (reason === 'escape') btnRef.current?.focus();
  }, []);

  const enterMenu = useCallback((direction) => {
    setOpen(true);
    setFocusSignal((previous) => (Math.abs(previous) + 1) * direction);
  }, []);

  const handleStartKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        enterMenu(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        enterMenu(-1);
        return;
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        closeMenu('escape');
      }
    },
    [closeMenu, enterMenu, open],
  );

  const handleTaskClick = useCallback(
    (entry) => {
      if (entry.hidden) {
        bringToFront(entry.id, { focus: true });
        return;
      }
      if (entry.active) {
        hide(entry.id, entry.title);
        return;
      }
      bringToFront(entry.id, { focus: true });
    },
    [bringToFront, hide],
  );

  return (
    <nav className="win95-taskbar" role="navigation" aria-label="Taskbar">
      <button
        ref={btnRef}
        type="button"
        className="win-btn win95-start-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-pressed={open}
        onClick={() => {
          setFocusSignal(0);
          setOpen((wasOpen) => !wasOpen);
        }}
        onKeyDown={handleStartKeyDown}
      >
        {/* The boot splash's flag on the 16-grid, from the one registry the
            tray and the task list already draw from. The class holds it at
            16px — one screen pixel per map pixel, so nothing is resampled
            away. The 14px box the hand-drawn polygons used lost three rows of
            the drawing. Whole pixels cost the button 2px of width, which
            pushes the label and the task list right by the same. */}
        <PixelIcon
          id="start-flag"
          size={16}
          className="win95-start-btn__icon"
        />
        <span>Start</span>
      </button>
      <StartMenu
        open={open}
        onClose={closeMenu}
        startButtonRef={btnRef}
        focusSignal={focusSignal}
        reload={reload}
      />
      <ul className="win95-taskbar__tasks" aria-label="Open windows">
        {openWindows.map((entry) => {
          const cls = [
            'win-btn',
            'win95-taskbar__task',
            entry.active && !entry.hidden ? 'win95-taskbar__task--active' : '',
            entry.hidden ? 'win95-taskbar__task--hidden' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={entry.id}>
              <button
                type="button"
                className={cls}
                aria-pressed={entry.active && !entry.hidden}
                onClick={() => handleTaskClick(entry)}
              >
                {/* The same 16-unit icon the window's own titlebar draws, from
                    the one map both read. The 32-unit AppGlyph that used to be
                    here was scaled to half, so every 1px rule in it landed on
                    a half-pixel — and Display Properties, which AppGlyph has
                    no artwork for, got the generic-application fallback. */}
                <span className="win95-taskbar__task-icon" aria-hidden="true">
                  <PixelIcon id={WINDOW_ICONS[entry.id]} size={16} />
                </span>
                <span className="win95-taskbar__task-label">{entry.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <SystemTray />
    </nav>
  );
}
