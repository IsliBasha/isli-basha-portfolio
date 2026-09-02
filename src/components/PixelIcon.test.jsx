import { describe, it, expect, vi, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PixelIcon } from './PixelIcon.jsx';
import { ICONS, PALETTE, TRANSPARENT, ICON_SIZE } from '../lib/pixelIcons/index.js';

function svgFor(container) {
  return container.querySelector('svg');
}

function rectsFor(container) {
  return [...container.querySelectorAll('rect')];
}

/**
 * Rebuild the 16x16 character map from what was actually painted. A run that
 * is one pixel wide, one row off, or the wrong colour changes the rebuilt map,
 * which a rect count alone would not catch.
 */
function repaint(container) {
  const hexToKey = new Map(Object.entries(PALETTE).map(([key, hex]) => [hex, key]));
  const grid = Array.from({ length: ICON_SIZE }, () => Array(ICON_SIZE).fill(TRANSPARENT));

  for (const rect of rectsFor(container)) {
    const x = Number(rect.getAttribute('x'));
    const y = Number(rect.getAttribute('y'));
    const width = Number(rect.getAttribute('width'));
    const key = hexToKey.get(rect.getAttribute('fill'));
    for (let i = 0; i < width; i += 1) grid[y][x + i] = key;
  }
  return grid.map((row) => row.join(''));
}

describe('PixelIcon', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('paints exactly the map it was given', () => {
    const { container } = render(<PixelIcon id="folder" />);
    expect(repaint(container)).toEqual(ICONS.folder);
  });

  it('paints every registered icon back to its own map', () => {
    for (const [id, rows] of Object.entries(ICONS)) {
      const { container, unmount } = render(<PixelIcon id={id} />);
      expect(repaint(container), `${id} does not round-trip`).toEqual(rows);
      unmount();
    }
  });

  // 164 painted pixels merge into 52 rects. The pin is the point: a change
  // that stops merging runs still renders correctly and would pass every
  // other test in this file.
  it('merges horizontal same-colour runs into one rect each', () => {
    const { container } = render(<PixelIcon id="folder" />);
    const painted = ICONS.folder.join('').split('').filter((ch) => ch !== TRANSPARENT).length;

    expect(painted).toBe(164);
    expect(rectsFor(container)).toHaveLength(52);
  });

  it('gives every rect a height of one row and a palette colour', () => {
    const { container } = render(<PixelIcon id="wrench" />);
    const fills = new Set(Object.values(PALETTE));
    for (const rect of rectsFor(container)) {
      expect(rect.getAttribute('height')).toBe('1');
      expect(fills.has(rect.getAttribute('fill'))).toBe(true);
    }
  });

  it('scales through width and height while the viewBox stays on the pixel grid', () => {
    const { container } = render(<PixelIcon id="briefcase" size={48} />);
    const svg = svgFor(container);
    expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
    expect(svg.getAttribute('width')).toBe('48');
    expect(svg.getAttribute('height')).toBe('48');
  });

  it('defaults to 32px', () => {
    const { container } = render(<PixelIcon id="briefcase" />);
    expect(svgFor(container).getAttribute('width')).toBe('32');
  });

  it('renders the same rect geometry at every scale', () => {
    const { container: small } = render(<PixelIcon id="globe-doc" size={16} />);
    const { container: large } = render(<PixelIcon id="globe-doc" size={64} />);
    expect(repaint(large)).toEqual(repaint(small));
  });

  it('asks the renderer not to soften the pixel edges', () => {
    const { container } = render(<PixelIcon id="folder" />);
    expect(svgFor(container).getAttribute('shape-rendering')).toBe('crispEdges');
  });

  it('is decorative by default', () => {
    const { container } = render(<PixelIcon id="folder" />);
    const svg = svgFor(container);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.querySelector('title')).toBeNull();
  });

  it('becomes an image with an accessible name when given a title', () => {
    render(<PixelIcon id="folder" title="Folder" />);
    const img = screen.getByRole('img', { name: 'Folder' });
    expect(img.getAttribute('aria-hidden')).toBeNull();
  });

  it('passes a class name through for layout', () => {
    const { container } = render(<PixelIcon id="folder" className="explorer-tile-icon" />);
    expect(svgFor(container)).toHaveClass('explorer-tile-icon');
  });

  it('draws the fallback icon instead of crashing on an unknown id', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<PixelIcon id="not-registered" />);
    expect(repaint(container)).toEqual(ICONS['generic-exe']);
  });
});

describe('PixelIcon memoisation', () => {
  // The run cache already computes each icon's rects once per process, so
  // counting run computations proves nothing about React. What memo buys is
  // the ~40 rect elements per icon that would otherwise be rebuilt on every
  // parent render — 25 tiles plus 6 sidebar entries on every search keystroke.
  it('is wrapped in React.memo with the default shallow compare', () => {
    expect(PixelIcon.$$typeof).toBe(Symbol.for('react.memo'));
    expect(PixelIcon.type).toBeTypeOf('function');
    expect(PixelIcon.compare ?? null).toBeNull();
  });

  it('leaves the painted rects untouched when the parent re-renders', async () => {
    function Parent() {
      const [query, setQuery] = useState('');
      return (
        <div>
          <input aria-label="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <PixelIcon id="folder" size={32} />
        </div>
      );
    }

    const user = userEvent.setup();
    const { container } = render(<Parent />);
    const before = rectsFor(container);

    await user.type(screen.getByLabelText('search'), 'rust');

    const after = rectsFor(container);
    expect(after).toHaveLength(before.length);
    // Same DOM nodes, in the same order: nothing was rebuilt or reordered.
    after.forEach((rect, i) => expect(rect).toBe(before[i]));
  });
});

describe('PixelIcon with a damaged map', () => {
  const BAD_ID = 'test-only-damaged-map';

  afterEach(() => {
    delete ICONS[BAD_ID];
  });

  // isValidMap keeps this out of the registry, so the only way to exercise the
  // guard is to register a bad map here. Without the guard the character
  // arrives as fill=undefined, SVG defaults it to black, and a broken pixel
  // looks exactly like an intentional outline.
  it('paints an unregistered palette character in fuchsia rather than black', () => {
    const rows = Array(ICON_SIZE).fill('.'.repeat(ICON_SIZE));
    rows[4] = `${'?'.repeat(3)}${'.'.repeat(ICON_SIZE - 3)}`;
    ICONS[BAD_ID] = rows;

    const { container } = render(<PixelIcon id={BAD_ID} />);
    const rects = rectsFor(container);

    expect(rects).toHaveLength(1);
    expect(rects[0].getAttribute('fill')).toBe(PALETTE.m);
    expect(rects[0].getAttribute('fill')).not.toBe('#000000');
    expect(rects[0].getAttribute('width')).toBe('3');
  });
});
