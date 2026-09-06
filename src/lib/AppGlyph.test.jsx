import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { render } from '@testing-library/react';
import { AppGlyph } from './AppGlyph.jsx';
import { GLYPH_KINDS } from './glyphKinds.js';

const here = dirname(fileURLToPath(import.meta.url));
const glyphSource = readFileSync(resolve(here, 'AppGlyph.jsx'), 'utf8');
const desktopSource = readFileSync(resolve(here, '../DesktopApp.jsx'), 'utf8');

// The `kind` on every desktop shortcut the app mounts, read out of the JSX
// rather than kept as a second list here: AppGlyph's only caller is
// DesktopIcon, so this is the complete set of kinds anything can ask for.
const DESKTOP_ICON_KINDS = [...desktopSource.matchAll(/<DesktopIcon\s+kind="([^"]+)"/g)].map(
  (m) => m[1],
);

function renderGlyph(kind, size) {
  const { container } = render(<AppGlyph kind={kind} size={size} />);
  return container.querySelector('svg');
}

describe('AppGlyph coverage for every desktop shortcut', () => {
  it.each(GLYPH_KINDS)('draws artwork for the "%s" shortcut', (kind) => {
    const svg = renderGlyph(kind);
    expect(svg).not.toBeNull();
    expect(
      svg.querySelectorAll('rect, polyline, polygon, text').length,
    ).toBeGreaterThan(0);
  });

  it('draws exactly the kinds the desktop puts a shortcut on screen for', () => {
    // Both directions in one assertion. A kind with no shortcut is artwork
    // nothing can ask for -- `projects` sat here long after its window was
    // gone, and SiteCounter.exe's bar chart joined it the day the taskbar
    // stopped calling AppGlyph -- and a shortcut with no kind renders the
    // generic-application fallback on the desktop.
    expect(DESKTOP_ICON_KINDS.length).toBeGreaterThan(0);
    expect([...GLYPH_KINDS].sort()).toEqual([...DESKTOP_ICON_KINDS].sort());
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
