import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { WALLPAPERS, WALLPAPER_COLOURS } from '../hooks/useDisplaySettings.js';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '..', 'index.css'), 'utf8');
const win95 = readFileSync(resolve(here, 'win95.css'), 'utf8');

/** The body of `html[data-wallpaper='<id>'] body { ... }`. */
function variantBody(id) {
  const match = css.match(
    new RegExp(`html\\[data-wallpaper='${id}'\\]\\s+body\\s*\\{([^}]*)\\}`),
  );
  if (!match) throw new Error(`no wallpaper rule for ${id}`);
  return match[1];
}

/**
 * The inside of a top-level `@media (...)` block, brace-matched.
 *
 * Worth the six lines: "somewhere in the file" is not the same claim as
 * "inside this breakpoint", and a regex that walks past the closing brace
 * will happily find a declaration the browser only applies elsewhere.
 */
function mediaBlock(query) {
  const start = css.indexOf(`@media ${query}`);
  if (start === -1) throw new Error(`no @media ${query} block`);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`unterminated @media ${query} block`);
}

/** The body of one exact selector inside a block of rules. */
function ruleBody(block, selector) {
  const found = [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
    (match) => match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim() === selector,
  );
  if (!found) throw new Error(`no \`${selector}\` rule in that block`);
  return found[2];
}

const occurrences = (text, needle) => text.split(needle).length - 1;

// 'clouds' is deliberately not a variant: it is what the plain body rule paints.
const VARIANTS = WALLPAPERS.filter((id) => id !== 'clouds');

describe('wallpaper variants', () => {
  it('has a rule for every wallpaper except the default', () => {
    for (const id of VARIANTS) {
      expect(() => variantBody(id), `${id} has no CSS rule`).not.toThrow();
    }
  });

  it('paints no rule for the default, so a first visit needs no attribute', () => {
    expect(css).not.toMatch(/html\[data-wallpaper='clouds'\]/);
  });

  it.each(VARIANTS)(
    'sets %s with longhands, never the background shorthand',
    (id) => {
      // `background:` resets background-attachment to scroll, and these
      // selectors outrank the min-width:1024px rule that pins the desktop
      // wallpaper with `fixed` -- so a shorthand here silently unpins it.
      expect(variantBody(id)).not.toMatch(/(^|[;\s])background\s*:/);
      expect(variantBody(id)).toMatch(/background-image\s*:/);
    },
  );

  it('paints the flat wallpapers in the colours the preview draws', () => {
    expect(variantBody('teal')).toContain(WALLPAPER_COLOURS.teal);
    expect(variantBody('setup')).toContain(WALLPAPER_COLOURS.setupTop);
    expect(variantBody('setup')).toContain(WALLPAPER_COLOURS.setupBottom);
  });

  it('keeps every variant behind the breakpoint App.jsx splits on', () => {
    // Below 769px the Nokia port is what renders; it has no Display
    // Properties, so a variant rule outside this query would only ever cost a
    // phone the download.
    const desktopOnly = mediaBlock('(min-width: 769px)');
    for (const id of VARIANTS) {
      expect(desktopOnly).toContain(`html[data-wallpaper='${id}']`);
    }
    expect(occurrences(desktopOnly, 'win95-clouds-16.png')).toBe(1);
    expect(occurrences(css, 'win95-clouds-16.png')).toBe(1);
  });

  it('still pins the wallpaper in the desktop breakpoint own body rule', () => {
    expect(ruleBody(mediaBlock('(min-width: 1024px)'), 'body')).toMatch(
      /background-attachment:\s*fixed/,
    );
  });

  it('keeps the 16-colour wallpaper from being smoothed back up', () => {
    expect(variantBody('clouds-16')).toMatch(/image-rendering\s*:\s*pixelated/);
  });

  it('offers the WebP through image-set with the JPEG behind it', () => {
    const imageSet = css.match(/background-image:\s*image-set\(([\s\S]*?)\);/);
    expect(imageSet, 'no image-set() declaration').not.toBeNull();
    expect(imageSet[1]).toMatch(/win95-clouds-bg\.webp'\)\s*type\('image\/webp'\)/);
    expect(imageSet[1]).toMatch(/win95-clouds-bg\.jpg'\)\s*type\('image\/jpeg'\)/);
    // WebP first: image-set picks the first source the browser can decode.
    expect(imageSet[1].indexOf('.webp')).toBeLessThan(imageSet[1].indexOf('.jpg'));
  });

  it('declares the JPEG shorthand fallback before the image-set rule', () => {
    const shorthand = css.search(
      /body\s*\{[^}]*background:\s*url\('\/win95-clouds-bg\.jpg'\)\s*center\s*\/\s*cover/,
    );
    const enhancement = css.search(/background-image:\s*image-set\(/);
    expect(shorthand, 'no plain JPEG shorthand').toBeGreaterThan(-1);
    // Same selector, same specificity, so the later rule wins: a fallback
    // written after the enhancement is not a fallback, it is the only
    // declaration that ever paints.
    expect(shorthand).toBeLessThan(enhancement);
  });
});

describe('the property sheet pages', () => {
  it('hides the page that is not selected', () => {
    // Tailwind's preflight carries no [hidden] rule, and the panel's own
    // `display: flex` outranks the attribute, so both pages would render at
    // once with the second one stacked under the first.
    expect(win95).toMatch(
      /\.display-props__panel\[hidden\]\s*\{\s*display:\s*none;\s*\}/,
    );
  });
});
