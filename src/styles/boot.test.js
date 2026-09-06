import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { FLAG_WIDTH, FLAG_HEIGHT } from '../lib/bootFlagFrames.js';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, 'boot.css'), 'utf8');

// The one number that lives only in the stylesheet. The grid comes from the
// frame data, so widening the flag there without rescaling here fails.
const CSS_PIXEL = 5;

// Three frames share one cycle, so the picture changes 3/cycle. WCAG 2.3.1
// draws the line at three flashes a second, and this is the first thing a
// visitor sees full-screen.
const MIN_CYCLE_SECONDS = 1.0;

// Brace-counting reader: the boot rules we assert on include at-rules whose
// bodies contain nested blocks, which a `[^}]*` regex would truncate.
function blockBody(head) {
  const start = css.indexOf('\n' + head);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  if (open === -1) return '';
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return '';
}

describe('POST screen typography', () => {
  for (const selector of ['.boot-overlay', '.boot-bios']) {
    it(`renders ${selector} in VT323 with a mono fallback`, () => {
      const body = blockBody(selector);
      expect(body).toMatch(/font-family:\s*'VT323'/);
      // The fallback is load-bearing: when Google Fonts is blocked the POST
      // still has to read as fixed-width terminal output, not proportional text.
      expect(body).toMatch(/font-family:[^;]*var\(--font-mono\)/);
    });

    it(`keeps ${selector} at a full-height raster line box`, () => {
      const body = blockBody(selector);
      expect(body).toMatch(/font-size:\s*20px/);
      // line-height: 1 exactly — 14 BIOS lines at 1.1 overflow the 2rem-padded,
      // overflow-hidden overlay on short desktop viewports and lose the last line.
      expect(body).toMatch(/line-height:\s*1\s*;/);
    });
  }
});

describe('splash progress bar', () => {
  it('paints the #c0c0c0 hairline above the sliding span', () => {
    const body = blockBody('.boot-splash__bar::after');
    expect(body).toMatch(/position:\s*absolute/);
    expect(body).toMatch(/inset:\s*0/);
    expect(body).toMatch(/box-shadow:\s*inset 0 0 0 1px #c0c0c0/);
  });

  it('animates the bar on transform only', () => {
    const body = blockBody('@keyframes boot-bar-slide');
    expect(body).toMatch(/transform:\s*translateX\(-50%\)/);
    expect(body).not.toMatch(/\b(width|left|margin)\s*:/);
  });

  it('freezes the bar under prefers-reduced-motion', () => {
    const body = blockBody('@media (prefers-reduced-motion: reduce)');
    expect(body).toContain('.boot-splash__bar > span');
    expect(body).toMatch(/animation:\s*none/);
  });
});

describe('boot splash flag', () => {
  it(`sizes the flag at a whole ${CSS_PIXEL}px per pixel on the ${FLAG_WIDTH}x${FLAG_HEIGHT} grid`, () => {
    const body = blockBody('.boot-flag');
    expect(body).toContain(`width: calc(${FLAG_WIDTH} * ${CSS_PIXEL}px)`);
    expect(body).toContain(`height: calc(${FLAG_HEIGHT} * ${CSS_PIXEL}px)`);
    expect(body).toMatch(/position:\s*relative/);
    // A flex item in .boot-splash. Let it shrink and the 5px pixels land on
    // fractional boundaries on a short viewport, which resamples every edge
    // shapeRendering="crispEdges" exists to keep hard.
    expect(body).toMatch(/flex-shrink:\s*0/);
  });

  it('swaps the frames on opacity and nothing else', () => {
    const body = blockBody('@keyframes boot-flag-wave');
    expect(body).toMatch(/opacity:\s*1/);
    expect(body).toMatch(/opacity:\s*0/);
    // A frame swap that moved or resized anything would be a layout animation
    // three times a second on the first screen a visitor sees.
    expect(body).not.toMatch(/\b(transform|width|height|top|left|margin|filter)\s*:/);
  });

  // steps(1, end) holds a frame opaque until the stop that turns it off, so
  // that stop has to sit past a third of the cycle. One hair early and the
  // three windows stop touching, and the teal flashes through the stack three
  // times a second.
  it('keeps the three opaque windows touching rather than gapping', () => {
    const body = blockBody('@keyframes boot-flag-wave');
    const off = body.match(/([\d.]+)%\s*{\s*opacity:\s*0/);
    expect(off).not.toBeNull();
    expect(Number(off[1])).toBeGreaterThan(100 / 3);
  });

  it('keeps the swap under three changes a second', () => {
    const declared = blockBody('.boot-flag').match(/--boot-flag-cycle:\s*([\d.]+)s\s*;/);
    expect(declared, 'the cycle is not declared on .boot-flag').not.toBeNull();
    expect(Number(declared[1])).toBeGreaterThanOrEqual(MIN_CYCLE_SECONDS);
  });

  // The wave is drawn into the three maps. A transform doing the waving would
  // resample the pixel edges shapeRendering="crispEdges" exists to keep sharp.
  it('never shears or rotates the flag', () => {
    for (const head of ['.boot-flag', '.boot-flag__frame', '@keyframes boot-flag-wave']) {
      const body = blockBody(head);
      // blockBody answers '' for a head it cannot find, and '' satisfies the
      // negative below for ever: renaming the rule would silence this check
      // rather than fail it.
      expect(body, `${head} block not found`).not.toBe('');
      expect(body, `${head} transforms the flag`).not.toMatch(/skew|rotate|matrix/i);
    }
  });

  it('offsets frames 2 and 3 by thirds of the one declared cycle', () => {
    // The whole shorthand: without steps(1, end) the frames cross-fade into a
    // three-way blur, and without `infinite` the flag freezes after one cycle.
    // Both survive an assertion that stops at the duration.
    expect(blockBody('.boot-flag__frame')).toMatch(
      /animation:\s*boot-flag-wave var\(--boot-flag-cycle\) steps\(1, end\) infinite/,
    );
    expect(blockBody('.boot-flag__frame--2')).toMatch(
      /animation-delay:\s*calc\(var\(--boot-flag-cycle\) \/ -3 \* 2\)/,
    );
    expect(blockBody('.boot-flag__frame--3')).toMatch(
      /animation-delay:\s*calc\(var\(--boot-flag-cycle\) \/ -3\)/,
    );
  });

  it('freezes the flag on frame 1 under prefers-reduced-motion', () => {
    const body = blockBody('@media (prefers-reduced-motion: reduce)');
    // With the comma: bare '.boot-flag__frame' is satisfied by the
    // '.boot-flag__frame--1' rule further down the same block, so dropping the
    // base class out of the animation: none list would go unnoticed.
    expect(body).toContain('.boot-flag__frame,');
    expect(body).toMatch(/animation:\s*none/);
    // Stopping the animation alone would leave every frame at its static
    // opacity: 0 and the splash with no logo at all.
    expect(body).toMatch(/\.boot-flag__frame--1\s*{\s*opacity:\s*1;\s*}/);
    expect(body).toMatch(/\.boot-flag__frame--2,\s*\.boot-flag__frame--3\s*{\s*opacity:\s*0;\s*}/);
  });
});
