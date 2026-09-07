import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { DesktopGlyph } from './DesktopGlyph.jsx';
import {
  DESKTOP_ICONS,
  DESKTOP_GRID,
  __resetDesktopWarnings,
} from '../lib/pixelIcons/desktop.js';
import { PALETTE, TRANSPARENT } from '../lib/pixelIcons/palette.js';
import { UNKNOWN_COLOUR, __resetRunWarnings } from '../lib/pixelIcons/runs.js';

function svgFor(container) {
  return container.querySelector('svg');
}

function rectsFor(container) {
  return [...container.querySelectorAll('rect')];
}

/**
 * Rebuild the 32x32 character map from what was actually painted. A run that
 * is one pixel wide, one row off, or the wrong colour changes the rebuilt map,
 * which a rect count alone would not catch.
 */
function repaint(container) {
  const hexToKey = new Map(Object.entries(PALETTE).map(([key, hex]) => [hex, key]));
  const grid = Array.from({ length: DESKTOP_GRID }, () =>
    Array(DESKTOP_GRID).fill(TRANSPARENT),
  );

  for (const rect of rectsFor(container)) {
    const x = Number(rect.getAttribute('x'));
    const y = Number(rect.getAttribute('y'));
    const width = Number(rect.getAttribute('width'));
    const key = hexToKey.get(rect.getAttribute('fill'));
    for (let i = 0; i < width; i += 1) grid[y][x + i] = key;
  }
  return grid.map((row) => row.join(''));
}

describe('DesktopGlyph', () => {
  it('paints every shortcut back to its own map', () => {
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      const { container, unmount } = render(<DesktopGlyph kind={kind} />);
      expect(repaint(container), `${kind} does not round-trip`).toEqual(rows);
      unmount();
    }
  });

  // The assertion above builds its expectation out of the map, so a map
  // scrambled into a blob still matches itself and still ships green. This row
  // is cmd's caption: the navy strip, the three white marks that stand in for
  // the title, and the button at its right end.
  it('keeps the MS-DOS caption where it was drawn', () => {
    const CAPTION = '..kwgBBwwBwwwBwwwBBBBBgkkgBgdk..';
    expect(DESKTOP_ICONS.stack[9], 'the cmd caption row moved in the map').toBe(CAPTION);

    const { container } = render(<DesktopGlyph kind="stack" />);
    expect(repaint(container)[9], 'the cmd caption row moved on screen').toBe(CAPTION);
  });

  it('gives every rect a height of one row and a palette colour', () => {
    const { container } = render(<DesktopGlyph kind="mywork" />);
    const fills = new Set(Object.values(PALETTE));

    expect(rectsFor(container).length).toBeGreaterThan(0);
    for (const rect of rectsFor(container)) {
      expect(rect.getAttribute('height')).toBe('1');
      expect(fills.has(rect.getAttribute('fill'))).toBe(true);
    }
  });

  // The pin is the point: a change that stops merging runs still renders
  // correctly and would pass every other test in this file, while multiplying
  // the rect count of seven icons that are on screen from the first frame.
  // cmd is the densest of the seven — 672 painted pixels down to 212 rects.
  it('merges horizontal same-colour runs into one rect each', () => {
    const { container } = render(<DesktopGlyph kind="stack" />);
    const painted = [...DESKTOP_ICONS.stack.join('')].filter(
      (ch) => ch !== TRANSPARENT,
    ).length;

    expect(painted, 'the cmd map was redrawn; re-count its painted pixels').toBe(672);
    expect(
      rectsFor(container).length,
      'the cmd map was redrawn; re-count the merged runs and update the pin. If the map is ' +
        'untouched, run-merging stopped and every icon on the desktop just got denser',
    ).toBe(212);
  });

  it('leaves no icon painting one rect per pixel', () => {
    for (const [kind, rows] of Object.entries(DESKTOP_ICONS)) {
      const { container, unmount } = render(<DesktopGlyph kind={kind} />);
      const painted = [...rows.join('')].filter((ch) => ch !== TRANSPARENT).length;
      expect(rectsFor(container).length, `${kind} merges nothing`).toBeLessThan(painted);
      unmount();
    }
  });

  it('scales through width and height while the viewBox stays on the pixel grid', () => {
    const { container } = render(<DesktopGlyph kind="about" size={128} />);
    const svg = svgFor(container);
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${DESKTOP_GRID} ${DESKTOP_GRID}`);
    expect(svg.getAttribute('width')).toBe('128');
    expect(svg.getAttribute('height')).toBe('128');
  });

  it('defaults to the 32px the desktop slot reserves', () => {
    const { container } = render(<DesktopGlyph kind="about" />);
    expect(svgFor(container).getAttribute('width')).toBe('32');
    expect(svgFor(container).getAttribute('height')).toBe('32');
  });

  it('renders the same rect geometry at every scale', () => {
    const { container: small } = render(<DesktopGlyph kind="contact" size={32} />);
    const { container: large } = render(<DesktopGlyph kind="contact" size={96} />);
    expect(repaint(large)).toEqual(repaint(small));
  });

  it('asks the renderer not to soften the pixel edges', () => {
    const { container } = render(<DesktopGlyph kind="snake" />);
    expect(svgFor(container).getAttribute('shape-rendering')).toBe('crispEdges');
  });

  // The shortcut's own label sits directly under it and the button carries the
  // accessible name, so a second announcement would read the icon twice.
  it('is decorative and out of the tab order', () => {
    const { container } = render(<DesktopGlyph kind="resume" />);
    const svg = svgFor(container);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
  });

  // The slot around it is exactly 32px tall. An inline SVG sits on a text
  // baseline, which pushes its bottom edge past the box and shifts the label.
  it('lays out as a block so the 32px slot fits it exactly', () => {
    const { container } = render(<DesktopGlyph kind="minesweeper" />);
    expect(svgFor(container).style.display).toBe('block');
  });

  it('is wrapped in React.memo with the default shallow compare', () => {
    // DesktopIcon calls setPos on every pointermove of a drag, so without this
    // a drag rebuilds every rect of the glyph on each frame.
    expect(DesktopGlyph.$$typeof).toBe(Symbol.for('react.memo'));
    expect(DesktopGlyph.type).toBeTypeOf('function');
    expect(DesktopGlyph.compare ?? null).toBeNull();
  });
});

describe('DesktopGlyph with an unknown kind', () => {
  beforeEach(() => {
    // Both Sets outlive a single test, which would let a later "did not warn"
    // assertion pass because an earlier test already burned the name.
    __resetDesktopWarnings();
    __resetRunWarnings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Without the fallback the kind arrives as fill=undefined, SVG defaults that
  // to black, and a missing shortcut looks exactly like a deliberate dark
  // square on the desktop.
  it('draws the missing-icon ring in fuchsia rather than nothing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<DesktopGlyph kind="no-such-shortcut" />);
    const rects = rectsFor(container);

    expect(rects.length).toBeGreaterThan(0);
    for (const rect of rects) {
      expect(rect.getAttribute('fill')).toBe(UNKNOWN_COLOUR);
      expect(rect.getAttribute('fill')).not.toBe(PALETTE.k);
    }
    expect(UNKNOWN_COLOUR).toBe(PALETTE.m);
  });

  it('warns once per missing kind instead of once per render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(<DesktopGlyph kind="typo" />);
    rerender(<DesktopGlyph kind="typo" size={48} />);
    render(<DesktopGlyph kind="typo" />);

    // Filtered rather than counted: the first render of an unknown kind logs
    // twice on purpose — this line names the kind, and runs.js names the
    // character the ring is drawn in, which is what proves the fuchsia route
    // is still wired up.
    const named = warn.mock.calls.filter((call) => String(call[0]).includes('"typo"'));
    expect(named).toHaveLength(1);
    expect(named[0][0]).toContain('no shortcut artwork');
  });

  it('never throws on a missing kind, because it runs inside render', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const kind of [undefined, '', 'constructor', 'toString', '__proto__']) {
      expect(() => render(<DesktopGlyph kind={kind} />), String(kind)).not.toThrow();
    }
  });

  it('keeps the ring out of the seven, so no shortcut can resolve to it', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container: missing } = render(<DesktopGlyph kind="no-such-shortcut" />);
    const ring = repaint(missing).join('\n');

    for (const kind of Object.keys(DESKTOP_ICONS)) {
      const { container, unmount } = render(<DesktopGlyph kind={kind} />);
      expect(repaint(container).join('\n'), `${kind} fell back to the ring`).not.toBe(ring);
      unmount();
    }
  });
});
