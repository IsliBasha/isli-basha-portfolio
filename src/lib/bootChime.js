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
