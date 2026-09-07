import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'isli-display';

// The one store for the boot chime, written by this sheet and by the taskbar
// tray and by nothing else. '1' is muted; the key's absence is "plays", so
// there is no second falsy spelling for a reader to get wrong.
//
// It is a separate key rather than a field of the settings object because the
// two writers save at different moments: a sheet that has been open since
// before the tray muted the chime would otherwise put the mute back as a side
// effect of saving a wallpaper.
const CHIME_MUTED_KEY = 'isli-chime-muted';
const CHIME_MUTED_VALUE = '1';

/** The four wallpapers the Background page offers, in list order. */
export const WALLPAPERS = ['clouds', 'clouds-16', 'teal', 'setup'];

/**
 * The flat colours two of those wallpapers are made of.
 *
 * Exported because the monitor preview has to paint the same swatch the
 * desktop will; wallpapers.test.js checks these against index.css so a colour
 * cannot be changed in one place and not the other.
 */
export const WALLPAPER_COLOURS = Object.freeze({
  teal: '#008080',
  setupTop: '#0000a8',
  setupBottom: '#000050',
});

export const DEFAULT_SETTINGS = Object.freeze({
  wallpaper: 'clouds',
  chime: true,
});

// index.css paints the clouds with no attribute at all, so the default state
// leaves <html> exactly as the document was served. Anything else would put a
// data-wallpaper="clouds" on every first visit for no visual difference.
const DEFAULT_WALLPAPER = DEFAULT_SETTINGS.wallpaper;

/**
 * A console line in dev only, the way src/lib/pixelIcons/index.js reports an
 * unknown icon id. In production a hand-edited settings blob is the visitor's
 * business, not something to narrate to their console.
 */
function warnInDev(message) {
  if (import.meta.env.DEV) console.warn(`[display] ${message}`);
}

function normaliseWallpaper(value) {
  return WALLPAPERS.includes(value) ? value : DEFAULT_WALLPAPER;
}

/**
 * Is the boot chime muted?
 *
 * Storage that throws on access — Safari's private mode, a blocked
 * third-party context — answers "not muted": a browser refusing to tell us
 * should not silently turn a sound off.
 */
export function readChimeMuted() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(CHIME_MUTED_KEY) === CHIME_MUTED_VALUE;
  } catch {
    return false;
  }
}

/** Mute or unmute. Absent means on, so unmuting removes the key. */
export function writeChimeMuted(muted) {
  if (typeof window === 'undefined') return false;
  try {
    if (muted) window.localStorage.setItem(CHIME_MUTED_KEY, CHIME_MUTED_VALUE);
    else window.localStorage.removeItem(CHIME_MUTED_KEY);
    return true;
  } catch {
    warnInDev('storage refused the boot sound setting; it will not survive a reload');
    return false;
  }
}

/**
 * The saved wallpaper id, or the default.
 *
 * Validated rather than merely read: `localStorage` is user-writable, and an
 * id that is not in WALLPAPERS would reach `dataset.wallpaper` and match no
 * rule at all, leaving the desktop on whatever the attribute happened to be.
 */
function readStoredWallpaper() {
  if (typeof window === 'undefined') return DEFAULT_WALLPAPER;

  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage itself refused. Nobody wrote anything wrong, so there is
    // nothing to report — the browser simply will not answer.
    return DEFAULT_WALLPAPER;
  }
  if (raw === null) return DEFAULT_WALLPAPER;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    warnInDev(`ignoring unparseable ${STORAGE_KEY} and using the default wallpaper`);
    return DEFAULT_WALLPAPER;
  }

  const wallpaper = parsed?.wallpaper;
  if (wallpaper === undefined) return DEFAULT_WALLPAPER;
  if (!WALLPAPERS.includes(wallpaper)) {
    warnInDev(`ignoring unknown wallpaper "${wallpaper}"`);
    return DEFAULT_WALLPAPER;
  }
  return wallpaper;
}

/**
 * The persisted settings.
 *
 * The chime comes from its own key on every read, never from the settings
 * blob: an older build stored a `chime` field there, and it is ignored.
 */
export function readStoredSettings() {
  return { wallpaper: readStoredWallpaper(), chime: !readChimeMuted() };
}

/**
 * Persist the wallpaper, reporting whether it survived.
 *
 * The chime is deliberately absent from what is written here — see
 * CHIME_MUTED_KEY. A legacy `chime` field left by an older build is dropped
 * by the first save.
 */
function writeStoredSettings(settings) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wallpaper: settings.wallpaper }),
    );
    return true;
  } catch {
    // Quota exhausted or storage unavailable: the choice still applies to
    // this session, it just will not survive a reload. Losing a wallpaper is
    // not worth throwing out of a click handler.
    warnInDev('storage refused the wallpaper; it will not survive a reload');
    return false;
  }
}

/** Put the wallpaper on <html>, where index.css's variant rules look for it. */
export function applyWallpaper(wallpaper) {
  if (typeof document === 'undefined') return;
  // Guards its own input: this is exported, and an unknown id written onto
  // the attribute matches no rule and blanks the desktop.
  const safe = normaliseWallpaper(wallpaper);
  const root = document.documentElement;
  if (safe === DEFAULT_WALLPAPER) root.removeAttribute('data-wallpaper');
  else root.dataset.wallpaper = safe;
}

/**
 * Paint the stored wallpaper at start-up.
 *
 * The hook below only runs while the Display Properties window is open, so
 * without this a reload would show the clouds until the user opened the sheet
 * again. Called from main.jsx before the first render, so the desktop never
 * paints the default wallpaper and then swaps it.
 */
export function applyStoredWallpaper() {
  applyWallpaper(readStoredSettings().wallpaper);
}

/**
 * The Display Properties sheet's model.
 *
 * The wallpaper is held twice: `draft` is what the desktop is currently
 * showing and what the list highlights, `persisted` is the last thing saved.
 * Win95's Apply/OK/Cancel triad is exactly the difference between them —
 * Cancel is only meaningful because previewing does not save.
 *
 * The chime is held differently, as `null` until the checkbox is touched,
 * because its store has a second writer. Reading the key every render is what
 * lets the tray mute the chime while this window is open without the sheet
 * showing "on" and writing that back on OK.
 */
export function useDisplaySettings() {
  const [persistedWallpaper, setPersistedWallpaper] = useState(readStoredWallpaper);
  const [draftWallpaper, setDraftWallpaper] = useState(persistedWallpaper);
  const [chimeDraft, setChimeDraft] = useState(null);

  const chime = chimeDraft ?? !readChimeMuted();

  useEffect(() => {
    applyWallpaper(draftWallpaper);
  }, [draftWallpaper]);

  // A preview must not outlive the sheet. Window unmounts this tree on
  // minimise as well as on the close box, and neither of those is Cancel, so
  // without this the desktop would keep a wallpaper nothing has saved and
  // nothing can now put back.
  useEffect(() => () => applyWallpaper(readStoredSettings().wallpaper), []);

  /** Show `next` on the desktop without saving it. */
  const preview = useCallback((next) => {
    if (next && 'wallpaper' in next) setDraftWallpaper(normaliseWallpaper(next.wallpaper));
    if (typeof next?.chime === 'boolean') setChimeDraft(next.chime);
  }, []);

  /**
   * Save `next` (or the current draft, with no argument) and keep showing it.
   *
   * Reports whether storage kept it. The sheet closes either way: a dialog
   * that refuses to go away because the disk is full is worse than one that
   * forgets a wallpaper.
   */
  const apply = useCallback(
    (next) => {
      const wallpaper =
        next && 'wallpaper' in next
          ? normaliseWallpaper(next.wallpaper)
          : draftWallpaper;
      const nextChime = typeof next?.chime === 'boolean' ? next.chime : chimeDraft;

      let saved = writeStoredSettings({ wallpaper });
      // Only when the checkbox was actually moved. Saving a wallpaper is not
      // a statement about the chime, and writing one anyway is how a mute set
      // from the tray gets quietly undone.
      if (nextChime !== null && !writeChimeMuted(!nextChime)) saved = false;

      setPersistedWallpaper(wallpaper);
      setDraftWallpaper(wallpaper);
      setChimeDraft(null);
      return saved;
    },
    [draftWallpaper, chimeDraft],
  );

  /** Throw the preview away and go back to what is saved. */
  const revert = useCallback(() => {
    setDraftWallpaper(persistedWallpaper);
    setChimeDraft(null);
  }, [persistedWallpaper]);

  const settings = useMemo(
    () => ({ wallpaper: draftWallpaper, chime }),
    [draftWallpaper, chime],
  );

  return { settings, preview, apply, revert };
}
