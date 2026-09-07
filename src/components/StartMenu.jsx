import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { PixelIcon } from './PixelIcon.jsx';
import { SystemDialog } from './SystemDialog.jsx';
import { RunDialog } from './RunDialog.jsx';
import { ShutDown } from './ShutDown.jsx';
import { useWindowStack } from '../context/windowStackContext.js';
import { clearWindowPositions } from '../hooks/useWindowPosition.js';

/**
 * The Start menu tree. `target` is a WindowStack id; `action` is something the
 * shell does itself. Labels are what Windows 95 actually put on these entries,
 * which is why the casing is inconsistent: the OS group names are title case
 * and the shortcuts keep the filenames they point at.
 *
 * `display` is defined by the Display Properties order. Until that lands the
 * id resolves to no window and picking it does nothing — see openWindow().
 */
const START_MENU = [
  {
    label: 'Programs',
    icon: 'programs',
    items: [
      {
        label: 'Accessories',
        icon: 'folder',
        items: [
          { label: 'Notepad', icon: 'notepad', target: 'about' },
          { label: 'MS-DOS Prompt', icon: 'dos', target: 'stack' },
          { label: 'SiteCounter.exe', icon: 'stats', target: 'stats' },
        ],
      },
      {
        label: 'Games',
        icon: 'folder',
        items: [
          { label: 'minesweeper.exe', icon: 'mine', target: 'minesweeper' },
          { label: 'snake.exe', icon: 'snake', target: 'snake' },
        ],
      },
      { label: 'contact.exe', icon: 'mail', target: 'contact' },
      { label: 'my work', icon: 'folder-open', target: 'mywork' },
    ],
  },
  {
    label: 'Documents',
    icon: 'folder-docs',
    items: [
      { label: 'about.txt', icon: 'notepad', target: 'about' },
      { label: 'resume.pdf', icon: 'pdf', target: 'resume' },
    ],
  },
  {
    label: 'Settings',
    icon: 'display',
    items: [
      { label: 'Display Properties…', icon: 'display', target: 'display' },
      { label: 'Reset desktop', icon: 'wrench', action: 'reset-desktop' },
    ],
  },
  { label: 'Find…', icon: 'find', action: 'find' },
  { label: 'Help', icon: 'help', action: 'help' },
  { label: 'Run…', icon: 'run', action: 'run' },
  { separator: true },
  { label: 'Shut Down…', icon: 'shutdown', action: 'shut-down' },
];

// Long enough that dragging the pointer diagonally across Programs on the way
// to Documents does not flash the Programs fly-out open behind it.
const HOVER_INTENT_MS = 150;
// Kept in sync by hand with `.win95-taskbar { height: 34px }` in win95.css.
// Reading it back as a custom property would cost a getComputedStyle per
// fly-out and still need this number as the fallback, since the test
// environment loads no CSS at all.
const TASKBAR_HEIGHT = 34;
const VIEWPORT_MARGIN = 4;

const MYWORK_ID = 'mywork';
// MyWorkExplorer styles inline and gives the field no class or id, so it
// carries a marker attribute instead: keying off the accessible name would
// make a copy edit in the explorer silently break Find.
const MYWORK_SEARCH_SELECTOR = '[data-start-find-target]';

const HELP_MESSAGE = (
  <>
    sys95 version 4.00.950
    <br />
    Fast, minimal, useful things.
  </>
);

function defaultReload() {
  window.location.reload();
}

/**
 * One level of the menu: a vertical list of items, plus whichever fly-out it
 * currently has open.
 *
 * There is no roving tabindex here and no tabindex map: every item is a real
 * button, so the browser already tracks which one is current, and the arrow
 * keys and hover both just call focus() on the next one. One source of truth
 * for "which item is current", and a screen reader reads the same one.
 */
function MenuPanel({ items, label, level, focusSignal, onActivate, onCloseLevel }) {
  // One piece of state, because "which fly-out is open" and "was it opened by
  // a key, and how many times" have to change together or the child focuses
  // itself on a hover it should have ignored.
  const [submenu, setSubmenu] = useState({ index: null, signal: 0 });
  const itemRefs = useRef([]);
  const panelRef = useRef(null);
  const hoverTimer = useRef(0);

  useEffect(() => {
    const timer = hoverTimer;
    return () => clearTimeout(timer.current);
  }, []);

  // Sign carries direction: a positive signal means "focus the first item",
  // negative "the last", and the magnitude only exists to make a repeat of the
  // same key a new value the effect will act on.
  useEffect(() => {
    if (!focusSignal) return;
    const buttons = itemRefs.current.filter(Boolean);
    const target = focusSignal > 0 ? buttons[0] : buttons[buttons.length - 1];
    target?.focus();
  }, [focusSignal]);

  // A fly-out is placed by CSS at the parent item's top-right corner, which
  // walks it off screen near the right edge or near the bottom for a long
  // list. Measuring after mount and nudging with a translate keeps the panel
  // on the compositor: no width, no left, no reflow of the menu behind it.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || level === 0) return;
    el.style.transform = 'none';
    const rect = el.getBoundingClientRect();
    const maxRight = window.innerWidth - VIEWPORT_MARGIN;
    const maxBottom = window.innerHeight - TASKBAR_HEIGHT - VIEWPORT_MARGIN;
    const dx = rect.right > maxRight ? Math.round(maxRight - rect.right) : 0;
    const rawDy = rect.bottom > maxBottom ? Math.round(maxBottom - rect.bottom) : 0;
    // A panel taller than the space it has would otherwise be dragged up until
    // its first item sat above the top of the screen, unreachable. Stop at the
    // margin and let the fly-out's own max-height scroll the overflow.
    const dy = Math.max(rawDy, VIEWPORT_MARGIN - rect.top);
    el.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : 'none';
  }, [level]);

  const openSubmenu = useCallback((index, byKeyboard) => {
    setSubmenu((prev) => ({
      index,
      signal: byKeyboard ? Math.abs(prev.signal) + 1 : 0,
    }));
  }, []);

  const activate = useCallback(
    (index, item) => {
      if (item.items) {
        openSubmenu(index, true);
        return;
      }
      onActivate(item);
    },
    [onActivate, openSubmenu],
  );

  // A panel that can never hold a fly-out is safe to cap and scroll. One that
  // can must not: `overflow-y: auto` computes `overflow-x` to `auto` as well,
  // and the child hangs off the parent's right edge by design -- capping the
  // parent clips the child out of the page entirely, not just out of view.
  const canNest = items.some((item) => item.items);

  const focusables = items.reduce(
    (acc, item, i) => (item.separator ? acc : [...acc, i]),
    [],
  );

  const stepFocus = (index, direction) => {
    const at = focusables.indexOf(index);
    const next =
      focusables[(at + direction + focusables.length) % focusables.length];
    itemRefs.current[next]?.focus();
  };

  const handleKeyDown = (event, index, item) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        stepFocus(index, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        stepFocus(index, -1);
        break;
      case 'ArrowRight':
        if (!item.items) break;
        event.preventDefault();
        openSubmenu(index, true);
        break;
      case 'ArrowLeft':
        // Nothing to close at the root: the menu bar is the taskbar itself.
        if (level === 0) break;
        event.preventDefault();
        onCloseLevel();
        break;
      case 'Escape':
        event.preventDefault();
        onCloseLevel();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(index, item);
        break;
      default:
        break;
    }
  };

  const handlePointerEnter = (index, item) => {
    // Hover moves focus, as APG asks of a menu and as Win95 did. Without it,
    // sweeping onto a sibling row while a keyboard-opened fly-out is showing
    // unmounts that fly-out with focus still inside it: the browser drops
    // focus on <body> and no arrow key reaches the menu again.
    itemRefs.current[index]?.focus();
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      openSubmenu(item.items ? index : null, false);
    }, HOVER_INTENT_MS);
  };

  // A pointer that crossed Programs on its way to the clock has left the menu
  // by the time the intent timer fires. Without this the fly-out opens under
  // no pointer at all, and stays until something else is clicked.
  const handlePointerLeave = () => {
    clearTimeout(hoverTimer.current);
  };

  return (
    <ul
      ref={panelRef}
      className={[
        level === 0 ? 'win95-start-menu__list' : 'win95-start-menu__flyout',
        canNest ? '' : 'win95-start-menu__panel--scrolls',
      ]
        .filter(Boolean)
        .join(' ')}
      role="menu"
      aria-label={label}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <li
              key={`sep-${index}`}
              role="separator"
              className="win95-start-menu__sep"
            />
          );
        }
        const isOpen = submenu.index === index;
        return (
          <li key={item.label} role="none" className="win95-start-menu__row">
            <button
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              className="win95-start-menu__item"
              aria-haspopup={item.items ? 'menu' : undefined}
              aria-expanded={item.items ? isOpen : undefined}
              onClick={() => activate(index, item)}
              onKeyDown={(event) => handleKeyDown(event, index, item)}
              onMouseEnter={() => handlePointerEnter(index, item)}
              onMouseLeave={handlePointerLeave}
            >
              <PixelIcon id={item.icon} size={16} />
              <span className="win95-start-menu__label">{item.label}</span>
              {item.items ? (
                <span className="win95-start-menu__arrow" aria-hidden="true">
                  ▸
                </span>
              ) : null}
            </button>
            {item.items && isOpen ? (
              <MenuPanel
                items={item.items}
                label={item.label}
                level={level + 1}
                focusSignal={submenu.signal}
                onActivate={onActivate}
                onCloseLevel={() => {
                  setSubmenu({ index: null, signal: 0 });
                  itemRefs.current[index]?.focus();
                }}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The Start menu and everything it can launch.
 *
 * Mounted whether or not the menu is showing: picking Run… closes the menu and
 * opens a dialog, so the dialogs cannot live inside the part that unmounts.
 * They are portalled to the body because the taskbar is a stacking context at
 * z-index 9000 — a dialog rendered inside it can never rise above the windows
 * it covers, however large its own z-index.
 *
 * `reload` is injected so a test can watch the restart path without navigating
 * the test runner.
 */
export function StartMenu({
  open,
  onClose,
  startButtonRef,
  focusSignal = 0,
  reload = defaultReload,
}) {
  const { bringToFront } = useWindowStack();
  const [dialog, setDialog] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      const inMenu = rootRef.current?.contains(event.target);
      const onButton = startButtonRef?.current?.contains(event.target);
      if (!inMenu && !onButton) onClose('outside');
    };
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [open, onClose, startButtonRef]);

  /**
   * Launch a window and put focus in it. `onFrame` runs in the same frame,
   * once the window has focus, for a caller that wants somewhere more specific
   * inside it.
   *
   * The frame is not a flourish. bringToFront is a state update, and every
   * window on this desktop except the visitor counter starts closed, so on the
   * first launch the element does not exist until React commits: looking it up
   * in this tick found nothing and left focus on <body> every single time.
   */
  const openWindow = useCallback(
    (id, onFrame) => {
      bringToFront(id);
      window.requestAnimationFrame(() => {
        // An id no Window claims — `display` before its order lands — has
        // nothing to focus. bringToFront ignores such an id outright, so
        // there is nothing to undo here either.
        const node = document.getElementById(id);
        if (!node) return;
        // Optional call: jsdom has no scrollIntoView, and on desktop the
        // viewport is locked anyway. It earns its keep on mobile, where the
        // desktop is a scrolling stack of windows.
        node.scrollIntoView?.({ block: 'center' });
        node.focus({ preventScroll: true });
        onFrame?.();
      });
    },
    [bringToFront],
  );

  const handleActivate = useCallback(
    (item) => {
      onClose('select');
      if (item.target) {
        openWindow(item.target);
        return;
      }
      switch (item.action) {
        case 'find':
          // Find is the explorer with the cursor already in the search box.
          // Same frame as the window's own focus, so the two never race.
          openWindow(MYWORK_ID, () => {
            document.querySelector(MYWORK_SEARCH_SELECTOR)?.focus();
          });
          break;
        case 'help':
          setDialog('help');
          break;
        case 'run':
          setDialog('run');
          break;
        case 'shut-down':
          setDialog('shut-down');
          break;
        case 'reset-desktop':
          clearWindowPositions();
          reload();
          break;
        default:
          break;
      }
    },
    [onClose, openWindow, reload],
  );

  // The menu unmounted in the same commit that mounted the dialog, so by the
  // time anything could have saved the previously focused element the browser
  // had already parked focus on <body> -- restoring it was a no-op that read
  // like a fix. The Start button is the one thing still on screen that the
  // trip started from, so that is where focus goes back to.
  const closeDialog = useCallback(() => {
    setDialog(null);
    startButtonRef?.current?.focus();
  }, [startButtonRef]);

  return (
    <>
      {open ? (
        <div
          ref={rootRef}
          className="win95-start-menu"
          onKeyDown={(event) => {
            // The items close their own level and preventDefault on the way,
            // so this only fires when focus is somewhere in the panel that is
            // not an item. Escape has to shut the menu from anywhere in it.
            if (event.key !== 'Escape' || event.defaultPrevented) return;
            event.preventDefault();
            onClose('escape');
          }}
        >
          <div className="win95-start-menu__stripe">sys95</div>
          <MenuPanel
            items={START_MENU}
            label="Start menu"
            level={0}
            focusSignal={focusSignal}
            onActivate={handleActivate}
            onCloseLevel={() => onClose('escape')}
          />
        </div>
      ) : null}
      {createPortal(
        <>
          <SystemDialog
            open={dialog === 'help'}
            title="About sys95"
            message={HELP_MESSAGE}
            onClose={closeDialog}
          />
          <RunDialog
            open={dialog === 'run'}
            onClose={closeDialog}
            onOpenWindow={openWindow}
          />
          <ShutDown
            open={dialog === 'shut-down'}
            onClose={closeDialog}
            reload={reload}
          />
        </>,
        document.body,
      )}
    </>
  );
}
