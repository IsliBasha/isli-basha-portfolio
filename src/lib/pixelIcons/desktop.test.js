import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import {
  DESKTOP_ICONS,
  DESKTOP_GRID,
  getDesktopIcon,
  validateDesktopIcons,
  __resetDesktopWarnings,
} from './desktop.js';
import { PALETTE, TRANSPARENT } from './palette.js';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, '../..');
const desktopSource = readFileSync(resolve(srcRoot, 'DesktopApp.jsx'), 'utf8');

// The `kind` on every shortcut the app mounts, read out of the JSX rather than
// kept as a second list here. That only stands in for "every kind anything can
// ask for" while two things hold, and both are asserted in the block below
// rather than asserted in this comment: DesktopIcon is DesktopGlyph's only
// caller, and this pattern can read every <DesktopIcon> in the file.
const SHORTCUT_MATCHES = [...desktopSource.matchAll(/<DesktopIcon\s+kind="([^"]+)"/g)];
const SHORTCUT_KINDS = SHORTCUT_MATCHES.map((m) => m[1]);

/** Every source .jsx under src/, test files aside. */
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return full.endsWith('.jsx') && !full.endsWith('.test.jsx') ? [full] : [];
  });
}

describe('the scrape this file rests on', () => {
  // The premise of the coverage test below, which is only complete because one
  // component draws every shortcut glyph. A second caller anywhere in src/
  // could pass a kind no map covers: the suite would stay green and the
  // desktop would paint the fuchsia missing-icon ring in production, where the
  // dev-only warning that names it does not run.
  it('renders DesktopGlyph from DesktopIcon.jsx and nowhere else', () => {
    const callers = sourceFiles(srcRoot)
      .filter((file) => readFileSync(file, 'utf8').includes('<DesktopGlyph'))
      .map((file) => relative(srcRoot, file))
      .sort();

    expect(
      callers,
      'a second component draws DesktopGlyph, so DesktopApp\'s shortcut list is no longer ' +
        'every kind that can reach a map',
    ).toEqual(['components/DesktopIcon.jsx']);
  });

  // The pattern above reads `kind` only as the first attribute, only in double
  // quotes, only as a literal. `<DesktopIcon label="..." kind="...">`,
  // `kind='...'` and `kind={name}` all parse to nothing, and a shortcut the
  // scrape cannot see is a shortcut the coverage test quietly stops covering.
  it('parses a kind out of every <DesktopIcon> DesktopApp mounts', () => {
    const mounted = desktopSource.match(/<DesktopIcon\b/g) ?? [];

    expect(
      SHORTCUT_MATCHES.length,
      `${mounted.length} <DesktopIcon> mounted, ${SHORTCUT_MATCHES.length} with a kind this ` +
        'file can read — the difference is covered by nothing',
    ).toBe(mounted.length);
  });
});

const BLANK_ROW = TRANSPARENT.repeat(DESKTOP_GRID);
const BLANK_MAP = Array.from({ length: DESKTOP_GRID }, () => BLANK_ROW);

/** The seven with one entry swapped for something broken. */
function damaged(name, rows) {
  return { ...DESKTOP_ICONS, [name]: rows };
}

describe('desktop shortcut maps', () => {
  it('draws seven sound maps', () => {
    expect(validateDesktopIcons()).toEqual([]);
    expect(Object.keys(DESKTOP_ICONS)).toHaveLength(7);
  });

  it('draws exactly the kinds the desktop puts a shortcut on screen for', () => {
    // Both directions in one assertion. A map with no shortcut is artwork
    // nothing can ask for, and a shortcut with no map draws the missing-icon
    // ring in fuchsia on the desktop.
    expect(SHORTCUT_KINDS.length).toBeGreaterThan(0);
    expect([...Object.keys(DESKTOP_ICONS)].sort()).toEqual([...SHORTCUT_KINDS].sort());
  });

  // Asserted here as well as inside the validator: a validator that quietly
  // stopped checking would take these guarantees with it, and the failure-mode
  // block below is what proves it has not.
  it('registers only well-formed 32x32 maps', () => {
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      expect(rows, `${kind} is not an array`).toBeInstanceOf(Array);
      expect(rows, `${kind} is not ${DESKTOP_GRID} rows`).toHaveLength(DESKTOP_GRID);
      rows.forEach((row, y) => {
        expect(typeof row, `${kind} row ${y} is not a string`).toBe('string');
        expect(row.length, `${kind} row ${y} is the wrong width`).toBe(DESKTOP_GRID);
        for (const ch of row) {
          expect(
            ch === TRANSPARENT || Object.hasOwn(PALETTE, ch),
            `${kind} row ${y} uses "${ch}", which is not a palette key`,
          ).toBe(true);
        }
      });
    }
  });

  // Distinct keys are not distinct pictures. A map pasted from the icon above
  // it keeps its own key, so the count above never sees it, and two shortcuts
  // sit on the desktop wearing the same drawing.
  it('gives every shortcut its own drawing, not just its own key', () => {
    const seen = new Map();
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      const drawing = rows.join('\n');
      expect(seen.has(drawing), `${kind} is pixel-for-pixel ${seen.get(drawing)}`).toBe(false);
      seen.set(drawing, kind);
    }
  });

  it('uses at least three colours per icon, so nothing ships as a silhouette', () => {
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      const used = new Set([...rows.join('')].filter((ch) => ch !== TRANSPARENT));
      expect(used.size, `${kind} uses only ${[...used].join('')}`).toBeGreaterThanOrEqual(3);
    }
  });

  // Fuchsia is the damage marker: runs.js paints PALETTE.m for any character
  // that is not a palette key, and that only reads as "something is broken"
  // for as long as nothing draws with it on purpose.
  it('leaves the fuchsia sentinel unused so an unknown character stands out', () => {
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      expect(rows.join(''), `${kind} draws with the damage sentinel "m"`).not.toContain('m');
    }
  });

  it('inherits nothing from Object.prototype', () => {
    expect(Object.getPrototypeOf(DESKTOP_ICONS)).toBeNull();
    expect(DESKTOP_ICONS.toString).toBeUndefined();
  });

  // Freezing the registry alone only stops a name being repointed. Rewriting a
  // row in place is the edit somebody would actually make, and DesktopGlyph
  // caches each map's rects on the map object — so whether it ever reached the
  // screen would depend on which render got there first, and the stale rects
  // would be served for the rest of the session either way.
  it('is frozen down to the rows, not just at the registry', () => {
    expect(Object.isFrozen(DESKTOP_ICONS)).toBe(true);
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      expect(Object.isFrozen(rows), `${kind}'s rows can be rewritten in place`).toBe(true);
    }

    const before = DESKTOP_ICONS.about[5];
    expect(() => {
      DESKTOP_ICONS.about[5] = 'k'.repeat(DESKTOP_GRID);
    }).toThrow(TypeError);
    expect(DESKTOP_ICONS.about[5]).toBe(before);
  });
});

describe('validateDesktopIcons', () => {
  it('names the map whose row count drifted, and the one whose row is ragged', () => {
    expect(validateDesktopIcons(damaged('about', DESKTOP_ICONS.about.slice(0, -1)))).toContain(
      `about is ${DESKTOP_GRID - 1} rows, expected ${DESKTOP_GRID}`,
    );

    const ragged = [...DESKTOP_ICONS.snake];
    ragged[3] = ragged[3].slice(0, -1);
    expect(validateDesktopIcons(damaged('snake', ragged))).toContain(
      `snake row 3 is ${DESKTOP_GRID - 1} chars, expected ${DESKTOP_GRID}`,
    );
  });

  // A stray comma in a seven-entry object literal leaves a hole. The validator
  // has to name it like any other drift — a TypeError out of the check that
  // exists to report drift tells the reader nothing about which icon broke.
  it('reports a map that is not an array instead of throwing', () => {
    for (const [label, rows] of [
      ['undefined', undefined],
      ['a bare string', 'not a map'],
      ['a number', 32],
    ]) {
      const icons = damaged('mywork', rows);
      expect(() => validateDesktopIcons(icons), label).not.toThrow();
      expect(validateDesktopIcons(icons), label).toContain('mywork is not an array of rows');
    }
  });

  // The same stray comma one level down leaves a hole in a map's rows, and a
  // row that came back a number reaches row.length. A forEach skips the hole
  // without a word and throws on the number — both have to come back named.
  it('reports a hole and a non-string row inside a map', () => {
    const holed = [...DESKTOP_ICONS.contact];
    delete holed[5];
    expect(() => validateDesktopIcons(damaged('contact', holed)), 'a hole').not.toThrow();
    expect(validateDesktopIcons(damaged('contact', holed)), 'a hole').toContain(
      'contact row 5 is not a string',
    );

    const numeric = [...DESKTOP_ICONS.resume];
    numeric[7] = DESKTOP_GRID;
    expect(() => validateDesktopIcons(damaged('resume', numeric)), 'a number').not.toThrow();
    expect(validateDesktopIcons(damaged('resume', numeric)), 'a number').toContain(
      'resume row 7 is not a string',
    );
  });

  it('names a character that is not a palette key', () => {
    const typo = [...DESKTOP_ICONS.stack];
    typo[4] = 'z'.repeat(DESKTOP_GRID);
    expect(validateDesktopIcons(damaged('stack', typo))).toContain(
      'stack row 4 uses "z", which is not a palette key',
    );
  });

  it('catches a map pasted over another one', () => {
    expect(validateDesktopIcons(damaged('resume', DESKTOP_ICONS.about))).toContain(
      'about and resume are drawn identically',
    );
  });

  it('catches an icon emptied out, and one left as a silhouette', () => {
    const blanked = validateDesktopIcons(damaged('minesweeper', BLANK_MAP));
    expect(blanked.some((p) => p.startsWith('minesweeper paints'))).toBe(true);
    expect(blanked.some((p) => p.startsWith('minesweeper uses only'))).toBe(true);

    const flat = Array.from({ length: DESKTOP_GRID }, () => 'k'.repeat(DESKTOP_GRID));
    const silhouette = validateDesktopIcons(damaged('mywork', flat));
    expect(silhouette).toContain('mywork uses only 1 colours, expected at least 3');
  });

  it('catches an icon drawn with the damage sentinel', () => {
    const sentinel = [...DESKTOP_ICONS.snake];
    sentinel[10] = 'm'.repeat(DESKTOP_GRID);
    expect(validateDesktopIcons(damaged('snake', sentinel))).toContain(
      'snake draws with "m", which runs.js reserves for damage',
    );
  });

  it('says so when the registry is empty rather than reporting nothing wrong', () => {
    expect(validateDesktopIcons({})).toEqual(['no desktop icons are registered']);
  });

  it('reports a registry that is not an object at all', () => {
    expect(() => validateDesktopIcons(null)).not.toThrow();
    expect(validateDesktopIcons(null)).toEqual(['the icon registry is null, not an object']);
    expect(validateDesktopIcons(undefined), 'the default argument was bypassed').toEqual([]);
    expect(validateDesktopIcons('about')).toEqual([
      'the icon registry is string, not an object',
    ]);
  });
});

describe('getDesktopIcon', () => {
  beforeEach(() => {
    // The warned Set outlives a test, and a name already burned takes the
    // console.warn line below with it.
    __resetDesktopWarnings();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers with the map registered under a kind', () => {
    expect(getDesktopIcon('mywork')).toBe(DESKTOP_ICONS.mywork);
  });

  // It runs inside render, so a throw here costs the desktop rather than one
  // wrong icon. A Symbol is the case that gets past a reader: it survives
  // Object.hasOwn and it survives the warned Set, and only dies on
  // interpolation into the dev warning — the one line in the function that
  // converts the kind to a string at all.
  it('never throws, for any kind at all, and always answers with a map', () => {
    for (const kind of [undefined, null, '', 0, {}, Symbol('mywork'), 'no-such-shortcut']) {
      const label = typeof kind === 'symbol' ? 'Symbol()' : String(kind);
      expect(() => getDesktopIcon(kind), label).not.toThrow();
      expect(getDesktopIcon(kind), label).toHaveLength(DESKTOP_GRID);
    }
  });

  it('names the kind it has no artwork for, once', () => {
    getDesktopIcon('typo');
    getDesktopIcon('typo');

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn.mock.calls[0][0]).toContain('"typo"');
  });
});
