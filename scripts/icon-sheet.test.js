import { describe, it, expect } from 'vitest';
import { renderSheet, iconRuns, wrapId, escapeText } from './icon-sheet.js';
import { PALETTE, ICON_SIZE } from '../src/lib/pixelIcons/palette.js';
import system from '../src/lib/pixelIcons/system.js';
import games from '../src/lib/pixelIcons/games.js';
import projectIcons from '../src/lib/pixelIcons/projects.js';

// The order renderSheet walks its default registries in. Every id on the sheet
// comes from here, so the label assertions below can be exact rather than a
// substring search that would pass on a half-drawn sheet.
const REGISTERED_IDS = [
  ...Object.keys(system),
  ...Object.keys(games),
  ...Object.keys(projectIcons),
];

/** Every `<text class="label">` body, in document order. */
function labelLines(svg) {
  return [...svg.matchAll(/<text[^>]*class="label"[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
}

function blankMap() {
  return Array(ICON_SIZE).fill('.'.repeat(ICON_SIZE));
}

describe('iconRuns', () => {
  it('merges neighbouring pixels of one colour into a single rect', () => {
    expect(iconRuns(['kkkk............'])).toEqual([
      { x: 0, y: 0, width: 4, fill: PALETTE.k },
    ]);
  });

  it('breaks a run at a transparent pixel and emits no rect for it', () => {
    expect(iconRuns(['kk..kk..........'])).toEqual([
      { x: 0, y: 0, width: 2, fill: PALETTE.k },
      { x: 4, y: 0, width: 2, fill: PALETTE.k },
    ]);
  });

  it('breaks a run where the colour changes', () => {
    expect(iconRuns(['kkww............'])).toEqual([
      { x: 0, y: 0, width: 2, fill: PALETTE.k },
      { x: 2, y: 0, width: 2, fill: PALETTE.w },
    ]);
  });

  it('carries the row index, so two rows never merge into one rect', () => {
    const runs = iconRuns(['k...............', '..w.............']);
    expect(runs.map((run) => [run.x, run.y])).toEqual([
      [0, 0],
      [2, 1],
    ]);
  });

  // Without the fallback a typo'd character reaches the SVG as
  // fill="undefined", which renderers paint black — the sheet grows an outline
  // pixel nobody drew and the reviewer blames the drawing.
  it('paints a character that is not a palette key in the unknown colour', () => {
    expect(iconRuns(['z...............'])[0].fill).toBe(PALETTE.m);
  });
});

describe('wrapId', () => {
  // Silently dropping characters would relabel an icon, which on a contact
  // sheet is worse than an ugly line break: the reviewer approves the wrong id.
  it('never drops a character from any registered id', () => {
    for (const id of REGISTERED_IDS) {
      expect(wrapId(id).join(''), `${id} came back changed`).toBe(id);
    }
  });

  it('keeps every id inside the three lines the label band is tall', () => {
    for (const id of REGISTERED_IDS) {
      expect(wrapId(id).length, `${id} wrapped to too many lines`).toBeLessThanOrEqual(3);
    }
  });

  it('splits on the last hyphen that fits, not the first', () => {
    // 'ab-cd-efghijklmnop' has hyphens at 2 and 5, both inside the window.
    expect(wrapId('ab-cd-efghijklmnop')[0]).toBe('ab-cd-');
  });

  it('breaks mid-word when there is no hyphen to break on', () => {
    expect(wrapId('abcdefghijklmnopqrstuvwxyz')).toEqual([
      'abcdefghijkl',
      'mnopqrstuvwx',
      'yz',
    ]);
  });

  it('leaves a short id on one line', () => {
    expect(wrapId('folder')).toEqual(['folder']);
  });
});

describe('escapeText', () => {
  it('escapes the three characters that would otherwise close a tag', () => {
    expect(escapeText('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });

  // The ampersand has to go first, or the & of an escape written a moment
  // earlier gets escaped again into &amp;lt;.
  it('escapes an ampersand once, never re-escaping its own output', () => {
    expect(escapeText('<')).toBe('&lt;');
    expect(escapeText('&lt;')).toBe('&amp;lt;');
  });
});

describe('renderSheet', () => {
  it('labels every registered icon exactly once, in registry order', () => {
    const lines = labelLines(renderSheet());
    let cursor = 0;
    for (const id of REGISTERED_IDS) {
      const wrapped = wrapId(id);
      expect(lines.slice(cursor, cursor + wrapped.length), `label for ${id}`).toEqual(wrapped);
      cursor += wrapped.length;
    }
    expect(cursor, 'the sheet carries label lines no registered icon claims').toBe(lines.length);
  });

  // A scratch registry rather than an edit to projects.js: the registries are
  // module singletons every other test in the suite reads.
  it('paints an unregistered character in the unknown colour, never fill="undefined"', () => {
    const rows = blankMap();
    rows[0] = 'z'.repeat(ICON_SIZE);
    const svg = renderSheet([['scratch', { 'scratch-icon': rows }]]);
    expect(svg).toContain(`fill="${PALETTE.m}"`);
    expect(svg).not.toContain('fill="undefined"');
  });

  it('says so in the sheet when a section has no icons yet', () => {
    expect(renderSheet([['games', {}]])).toContain('no icons registered yet');
  });
});
