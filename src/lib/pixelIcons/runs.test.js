import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { pixelRuns, UNKNOWN_COLOUR, __resetRunWarnings } from './runs.js';
import { PALETTE } from './palette.js';

describe('pixelRuns', () => {
  beforeEach(() => {
    // The warned-character Set outlives a test, so a later "warns once"
    // assertion would count zero because an earlier test already burned it.
    __resetRunWarnings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // restoreAllMocks does not undo stubEnv, and an assertion that throws part
    // way through a test never reaches a cleanup line inside it: unstubbing
    // here is what stops one failure leaving DEV false for the rest of the file.
    vi.unstubAllEnvs();
  });

  it('merges a run of one colour into a single rect', () => {
    expect(pixelRuns(['rrrr'])).toEqual([
      { x: 0, y: 0, width: 4, fill: PALETTE.r },
    ]);
  });

  it('breaks a run where the colour changes', () => {
    expect(pixelRuns(['rrbb'])).toEqual([
      { x: 0, y: 0, width: 2, fill: PALETTE.r },
      { x: 2, y: 0, width: 2, fill: PALETTE.b },
    ]);
  });

  // The transparent marker is a gap, not a colour: two runs of the same key
  // either side of it have to stay two rects or the gap is painted over.
  it('breaks a run at a transparent pixel and paints nothing for it', () => {
    expect(pixelRuns(['rr.rr'])).toEqual([
      { x: 0, y: 0, width: 2, fill: PALETTE.r },
      { x: 3, y: 0, width: 2, fill: PALETTE.r },
    ]);
  });

  it('emits no rects for a fully transparent map', () => {
    expect(pixelRuns(['....', '....'])).toEqual([]);
  });

  // The boot flag is 48x28. Nothing in here may assume the 16x16 icon grid,
  // and rows of different lengths must not shear the rows below them.
  it('handles a non-square map and ragged rows on their own terms', () => {
    expect(pixelRuns(['rrrrrrr', 'bb', '', 'yyy'])).toEqual([
      { x: 0, y: 0, width: 7, fill: PALETTE.r },
      { x: 0, y: 1, width: 2, fill: PALETTE.b },
      { x: 0, y: 3, width: 3, fill: PALETTE.y },
    ]);
  });

  it('keeps every rect one row tall and on its own row index', () => {
    const runs = pixelRuns(['r.', '.b', 'k.']);
    expect(runs.map((run) => run.y)).toEqual([0, 1, 2]);
    expect(runs.every((run) => run.width >= 1)).toBe(true);
  });

  // Without the guard an unregistered character reaches the SVG as
  // fill=undefined, SVG defaults it to black, and a broken pixel is
  // indistinguishable from an intentional outline.
  it('paints an unregistered character in fuchsia rather than black', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const [run] = pixelRuns(['???']);
    expect(run.fill).toBe(UNKNOWN_COLOUR);
    expect(UNKNOWN_COLOUR).toBe(PALETTE.m);
    expect(run.fill).not.toBe(PALETTE.k);
  });

  // Fuchsia is a signal to whoever is looking at the picture. The maps are
  // hand-typed constants, and the pixel a typo lands on is the one nobody is
  // looking at — hence a line in dev as well.
  it('warns once per unknown character, not once per row it appears on', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    pixelRuns(['??', '..?', '?']);
    pixelRuns(['?']);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"?"');
    expect(warn.mock.calls[0][0]).toContain(UNKNOWN_COLOUR);
  });

  it('warns separately for a second unknown character', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    pixelRuns(['?', '$']);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  // Fuchsia in a shipped icon is a bug an author can see. A console line in a
  // visitor's browser is one they cannot do anything about.
  it('says nothing outside dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('DEV', false);

    const [run] = pixelRuns(['?']);

    expect(run.fill).toBe(UNKNOWN_COLOUR);
    expect(warn).not.toHaveBeenCalled();
  });

  it('never answers a lookup from the palette prototype chain', () => {
    // 'v' is not a palette key; on a plain object `{}.valueOf` is a function,
    // and a `palette[ch] ?? fallback` lookup would hand that to fill=.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const inherited = Object.create({ v: 'inherited' });
    inherited.r = PALETTE.r;
    const [run] = pixelRuns(['v'], inherited, PALETTE.m);
    expect(run.fill).toBe(PALETTE.m);
  });

  it('takes an alternative palette and fallback colour', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(pixelRuns(['ab'], { a: '#111111' }, '#999999')).toEqual([
      { x: 0, y: 0, width: 1, fill: '#111111' },
      { x: 1, y: 0, width: 1, fill: '#999999' },
    ]);
  });
});
