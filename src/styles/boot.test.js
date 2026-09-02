import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, 'boot.css'), 'utf8');

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
