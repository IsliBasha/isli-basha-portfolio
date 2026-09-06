// Tiny Web Audio synth for a 90s startup chime.
// Pure synthesis — no asset files. Autoplay-blocked silently.

const BOOT_NOTES = [
  { freq: 392.0, start: 0.00, dur: 0.45 }, // G4
  { freq: 587.33, start: 0.18, dur: 0.45 }, // D5
  { freq: 783.99, start: 0.36, dur: 0.55 }, // G5
  { freq: 1046.5, start: 0.55, dur: 0.7 },  // C6
];

const ATTACK = 0.02;
const RELEASE_TAIL = 0.25;

// Set from the taskbar's tray speaker. Absent means audible: a first-time
// visitor should hear the machine start up, and only someone who has said
// otherwise gets silence.
export const CHIME_MUTE_KEY = 'isli-chime-muted';

// What the visitor chose when storage would not take it. Null means storage
// is the authority; anything else is a session-only answer standing in for a
// write that was refused.
let mutedFallback = null;

/** True when the visitor has switched the boot sound off. */
export function isChimeMuted() {
  // The session copy wins while it exists: it is only set when a write was
  // refused, so storage cannot be holding anything newer than it.
  if (mutedFallback !== null) return mutedFallback;
  try {
    return window.localStorage.getItem(CHIME_MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

// Everyone currently rendering the mute state. localStorage fires no event in
// the tab that wrote it, so without this the tray reads the key once at mount
// and then shows whatever it showed at boot for the rest of the session.
const muteListeners = new Set();

function announceMuteChange() {
  for (const listener of muteListeners) listener();
}

// A second copy of the desktop in another tab. `key` is null when a whole
// storage area is cleared, which changes this preference too.
function onStorageChanged(event) {
  if (event.key === null || event.key === CHIME_MUTE_KEY) announceMuteChange();
}

/**
 * Watch the mute preference. Returns the unsubscribe, shaped for
 * useSyncExternalStore.
 *
 * The cross-tab listener is attached only while somebody is watching, so a
 * page that never renders the tray -- the static export, a test -- carries no
 * window listener at all.
 */
export function subscribeChimeMuted(onChange) {
  const isFirst = muteListeners.size === 0;
  muteListeners.add(onChange);
  if (isFirst && typeof window !== 'undefined') {
    window.addEventListener('storage', onStorageChanged);
  }
  return () => {
    muteListeners.delete(onChange);
    if (muteListeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorageChanged);
    }
  };
}

/**
 * Persist the mute state, for both writers: the taskbar tray's speaker and
 * Display Properties' Boot sound checkbox. Storage failing costs the
 * preference at the next visit, not the page and not the toggle: the choice is
 * kept in memory for this session, so subscribers re-reading isChimeMuted()
 * see it.
 *
 * Returns whether storage actually kept it, which is what lets the Display
 * Properties sheet tell the visitor their settings will not survive a reload.
 */
export function setChimeMuted(muted) {
  let stored;
  try {
    if (muted) window.localStorage.setItem(CHIME_MUTE_KEY, '1');
    else window.localStorage.removeItem(CHIME_MUTE_KEY);
    // Storage now holds the answer, so drop any stand-in from an earlier
    // refusal rather than letting it outrank a real write.
    mutedFallback = null;
    stored = true;
  } catch {
    // Private mode or a full quota. Remember the choice here instead: the tray
    // renders isChimeMuted(), so without this the speaker would re-read the
    // stale stored value and look like a dead button.
    mutedFallback = muted;
    stored = false;
  }
  announceMuteChange();
  return stored;
}

function nowOrNull() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
}

function scheduleNote(ctx, master, { freq, start, dur }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const t0 = ctx.currentTime + start;
  const tAttackEnd = t0 + ATTACK;
  const tReleaseStart = t0 + dur;
  const tEnd = tReleaseStart + RELEASE_TAIL;

  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.22, tAttackEnd);
  gain.gain.setValueAtTime(0.22, tReleaseStart);
  gain.gain.exponentialRampToValueAtTime(0.0001, tEnd);

  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(tEnd + 0.05);
}

export async function playBootChime() {
  if (isChimeMuted()) return false;
  const ctx = nowOrNull();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (ctx.state !== 'running') {
      ctx.close();
      return false;
    }
  } catch {
    return false;
  }

  const master = ctx.createGain();
  master.gain.value = 0.6;
  master.connect(ctx.destination);

  for (const note of BOOT_NOTES) {
    scheduleNote(ctx, master, note);
  }

  const totalLength =
    Math.max(...BOOT_NOTES.map((n) => n.start + n.dur)) + RELEASE_TAIL + 0.1;

  setTimeout(() => {
    try {
      ctx.close();
    } catch {
      /* already closed */
    }
  }, totalLength * 1000);

  return true;
}
