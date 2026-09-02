import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { render } from '@testing-library/react';
import { AppGlyph } from './AppGlyph.jsx';
import { GLYPH_KINDS } from './glyphKinds.js';

const here = dirname(fileURLToPath(import.meta.url));
const glyphSource = readFileSync(resolve(here, 'AppGlyph.jsx'), 'utf8');

// The ids DesktopApp mounts windows for. Each one is passed to AppGlyph twice:
// once as the desktop icon's `kind`, once as the window's 16px title icon. A
// kind with no artwork used to render nothing at all, leaving a 16px hole and
// a stray titlebar gap that reads as a layout bug rather than a missing icon.
const WINDOW_IDS = [
  'about',
  'stack',
  'contact',
  'stats',
  'resume',
  'minesweeper',
  'snake',
  'mywork',
];

function renderGlyph(kind, size) {
  const { container } = render(<AppGlyph kind={kind} size={size} />);
  return container.querySelector('svg');
}

describe('AppGlyph coverage for every mounted window', () => {
  it.each(WINDOW_IDS)('draws artwork for the "%s" window', (kind) => {
    const svg = renderGlyph(kind);
    expect(svg).not.toBeNull();
    expect(
      svg.querySelectorAll('rect, polyline, polygon, text').length,
    ).toBeGreaterThan(0);
  });

  it('lists every window id as a handled kind', () => {
    for (const id of WINDOW_IDS) {
      expect(GLYPH_KINDS).toContain(id);
    }
  });

  it('honours the 16px title-icon size', () => {
    const svg = renderGlyph('about', 16);
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });
});

describe('AppGlyph unknown kind', () => {
  it('falls back to a generic application glyph instead of nothing', () => {
    const svg = renderGlyph('no-such-app', 16);
    expect(svg).not.toBeNull();
    expect(svg.querySelectorAll('rect').length).toBeGreaterThan(0);
  });

  it('keeps the fallback out of the handled-kind list', () => {
    expect(GLYPH_KINDS).not.toContain('no-such-app');
  });

  it('keeps GLYPH_KINDS in step with the branches AppGlyph actually has', () => {
    // GLYPH_KINDS lives in its own module (Fast Refresh forbids mixing a
    // component and a constant export), so nothing stops the two drifting.
    // Read the branches back out of the source instead of trusting the list.
    const branches = [...glyphSource.matchAll(/kind === '([^']+)'/g)].map(
      (m) => m[1],
    );
    expect(branches.length).toBeGreaterThan(0);
    expect([...branches].sort()).toEqual([...GLYPH_KINDS].sort());
  });

  it('gives every handled kind its own artwork, not the fallback', () => {
    // A fallback that also answered for real kinds would hide a typo forever.
    const fallback = renderGlyph('no-such-app').innerHTML;
    for (const kind of GLYPH_KINDS) {
      expect(renderGlyph(kind).innerHTML).not.toBe(fallback);
    }
  });
});
