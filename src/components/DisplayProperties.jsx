import { useCallback, useId, useRef, useState } from 'react';
import { useWindowStack } from '../context/windowStackContext.js';
import {
  useDisplaySettings,
  WALLPAPER_COLOURS,
} from '../hooks/useDisplaySettings.js';

const WINDOW_ID = 'display';

const TABS = [
  { id: 'background', label: 'Background' },
  { id: 'effects', label: 'Effects' },
];

// Same ids, same order as the hook's WALLPAPERS. DisplayProperties.test.jsx
// asserts the two agree, so a wallpaper added to the hook cannot quietly go
// missing from the list the user actually picks from.
const WALLPAPER_OPTIONS = [
  { id: 'clouds', label: 'Clouds' },
  { id: 'clouds-16', label: 'Clouds (16 colours)' },
  { id: 'teal', label: 'Teal' },
  { id: 'setup', label: 'Setup' },
];

// The two wallpapers that are a file. The preview screen is 70x42, so the WebP
// is the right pick over the 395 KB JPEG even before caching — and when
// "Clouds" is the live wallpaper the browser already holds it.
const SCREEN_IMAGE = {
  clouds: '/win95-clouds-bg.webp',
  'clouds-16': '/win95-clouds-16.png',
};

const SCREEN = { x: 13, y: 8, width: 70, height: 42 };

/**
 * The little monitor above the wallpaper list, drawn as a 96x72 pixel bitmap
 * rather than an icon so its bevel reads at exactly one size, like the one in
 * the real control panel.
 *
 * Decorative: the listbox beneath already names and announces the selection,
 * so a screen reader gets nothing from a second copy of it.
 */
function MonitorPreview({ wallpaper }) {
  // Two of these SVGs on one page would otherwise both define
  // #display-screen-clip, and every reference would resolve to the first.
  // useId's own format is not safe inside url(#...), so it is reduced to the
  // part that is: the unique tail.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const skyId = `display-sky-${uid}`;
  const clipId = `display-clip-${uid}`;

  // Object.hasOwn, not `SCREEN_IMAGE[wallpaper]`: a wallpaper id called
  // "constructor" would otherwise answer with a function and be truthy.
  const image = Object.hasOwn(SCREEN_IMAGE, wallpaper) ? SCREEN_IMAGE[wallpaper] : null;

  return (
    <svg
      className="display-props__monitor"
      width="96"
      height="72"
      viewBox="0 0 96 72"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WALLPAPER_COLOURS.setupTop} />
          <stop offset="100%" stopColor={WALLPAPER_COLOURS.setupBottom} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect {...SCREEN} />
        </clipPath>
      </defs>

      {/* Case. Outlined in black rather than bevelled alone: the sheet behind
          it is silver too, so an edge made only of highlight and shadow would
          leave the monitor floating in its own colour. */}
      <rect x="5" y="1" width="86" height="58" fill="#000000" />
      <rect x="6" y="2" width="84" height="56" fill="#c0c0c0" />
      <rect x="6" y="2" width="84" height="1" fill="#dfdfdf" />
      <rect x="6" y="2" width="1" height="55" fill="#dfdfdf" />
      <rect x="89" y="3" width="1" height="55" fill="#808080" />
      <rect x="7" y="57" width="83" height="1" fill="#808080" />

      {/* Screen well, bevelled in. */}
      <rect x="12" y="7" width="72" height="44" fill="#000000" />

      {image ? (
        <image
          {...SCREEN}
          href={image}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <rect
          {...SCREEN}
          fill={wallpaper === 'teal' ? WALLPAPER_COLOURS.teal : `url(#${skyId})`}
        />
      )}

      {/* Stand: neck then base, outlined for the same reason as the case. */}
      <rect x="41" y="59" width="14" height="6" fill="#000000" />
      <rect x="42" y="59" width="12" height="5" fill="#c0c0c0" />
      <rect x="30" y="64" width="36" height="6" fill="#000000" />
      <rect x="31" y="65" width="34" height="4" fill="#c0c0c0" />
      <rect x="31" y="65" width="34" height="1" fill="#dfdfdf" />
    </svg>
  );
}

/**
 * Display Properties — the control-panel property sheet behind the desktop's
 * right-click Properties item.
 *
 * Win95's three buttons are three different promises and the sheet is only
 * worth building if it keeps them: Apply writes and stays, OK writes and
 * closes, Cancel puts back whatever was last written. Selecting a wallpaper
 * previews it on the real desktop immediately — that live preview is the whole
 * reason Cancel has to exist.
 */
export function DisplayProperties() {
  const { close } = useWindowStack();
  const { settings, preview, apply, revert } = useDisplaySettings();
  const [activeTab, setActiveTab] = useState('background');
  const tabRefs = useRef([]);
  const listRef = useRef(null);

  const handleTabKeyDown = useCallback((event) => {
    const from = TABS.findIndex((tab) => tab.id === event.currentTarget.dataset.tabId);
    // Wraps: a two-page sheet where ArrowRight dead-ends on the last tab makes
    // the keyboard feel broken long before the user counts the pages.
    const next =
      event.key === 'ArrowRight'
        ? (from + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (from - 1 + TABS.length) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? TABS.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }, []);

  const handleListKeyDown = useCallback(
    (event) => {
      const from = WALLPAPER_OPTIONS.findIndex((o) => o.id === settings.wallpaper);
      const wanted =
        event.key === 'ArrowDown'
          ? from + 1
          : event.key === 'ArrowUp'
            ? from - 1
            : event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? WALLPAPER_OPTIONS.length - 1
                : null;
      if (wanted === null) return;
      event.preventDefault();
      // Clamped, not wrapped: a Win95 listbox stops at its ends, and here each
      // step repaints the desktop, so wrapping would flash the whole screen.
      const next = Math.min(Math.max(wanted, 0), WALLPAPER_OPTIONS.length - 1);
      if (next !== from) preview({ wallpaper: WALLPAPER_OPTIONS[next].id });
    },
    [preview, settings.wallpaper],
  );

  const handleOk = useCallback(() => {
    apply();
    close(WINDOW_ID);
  }, [apply, close]);

  const handleCancel = useCallback(() => {
    revert();
    close(WINDOW_ID);
  }, [revert, close]);

  /**
   * The two keys a Win95 dialog answered from anywhere inside it: Escape is
   * Cancel, Enter is the default button.
   *
   * Neither applies to a control that already does something with the key.
   * A button activates itself on Enter, and its click lands after this
   * handler has run, so an unguarded Enter on Cancel would OK the sheet and
   * then cancel a sheet that had already closed; the checkbox is a control in
   * the middle of being set, not a finished dialog.
   */
  const handleSheetKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
        return;
      }
      if (event.key !== 'Enter') return;
      if (event.target instanceof HTMLElement && event.target.closest('button, input')) {
        return;
      }
      event.preventDefault();
      handleOk();
    },
    [handleCancel, handleOk],
  );

  return (
    <div className="display-props" onKeyDown={handleSheetKeyDown}>
      <div
        className="display-props__tabs"
        role="tablist"
        aria-label="Display Properties pages"
      >
        {TABS.map((tab, i) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`display-tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={selected}
              aria-controls={`display-panel-${tab.id}`}
              // One tab stop for the whole strip: Tab reaches the selected
              // page, the arrows move between pages.
              tabIndex={selected ? 0 : -1}
              className="display-props__tab"
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={handleTabKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="display-props__sheet">
        <div
          className="display-props__panel"
          role="tabpanel"
          id="display-panel-background"
          aria-labelledby="display-tab-background"
          hidden={activeTab !== 'background'}
        >
          <MonitorPreview wallpaper={settings.wallpaper} />
          <ul
            ref={listRef}
            className="win-sunken display-props__list"
            role="listbox"
            aria-label="Wallpaper"
            tabIndex={0}
            aria-activedescendant={`display-wallpaper-${settings.wallpaper}`}
            onKeyDown={handleListKeyDown}
          >
            {WALLPAPER_OPTIONS.map((option) => (
              <li
                key={option.id}
                id={`display-wallpaper-${option.id}`}
                role="option"
                aria-selected={settings.wallpaper === option.id}
                className="display-props__option"
                onClick={() => {
                  preview({ wallpaper: option.id });
                  // The listbox is the thing with the keyboard behaviour; a
                  // click that leaves focus behind means the next arrow key
                  // goes somewhere else entirely.
                  listRef.current?.focus();
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="display-props__panel"
          role="tabpanel"
          id="display-panel-effects"
          aria-labelledby="display-tab-effects"
          hidden={activeTab !== 'effects'}
        >
          <label className="display-props__check">
            <input
              type="checkbox"
              checked={settings.chime}
              onChange={(event) => preview({ chime: event.target.checked })}
            />
            Play boot sound
          </label>
        </div>
      </div>

      <div className="display-props__actions">
        <button type="button" className="win-btn" onClick={handleOk}>
          OK
        </button>
        <button type="button" className="win-btn" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" className="win-btn" onClick={() => apply()}>
          Apply
        </button>
      </div>
    </div>
  );
}
