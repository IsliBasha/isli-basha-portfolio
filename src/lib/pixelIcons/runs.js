import { PALETTE, TRANSPARENT } from './palette.js';

// An unregistered palette character would otherwise reach the SVG with
// fill=undefined, which paints black and reads as a stray outline pixel.
// Fuchsia is in the palette, is never used for an outline, and is impossible
// to mistake for intent.
export const UNKNOWN_COLOUR = PALETTE.m;

// Characters already reported. A typo'd key in a 48x28 map is one character
// repeated down a column, so without this it logs once per row it appears on,
// three times over for the three stacked flag frames.
const warned = new Set();

/** Test seam: the Set above outlives a single test, which would let a later
 *  "did not warn" assertion pass because an earlier test already warned. */
export function __resetRunWarnings() {
  warned.clear();
}

/**
 * Turn a character map into the rects that draw it, merging runs of the same
 * colour along a row.
 *
 * A map drawn a pixel at a time is one rect per painted pixel: 164 for the
 * folder icon, 677 for a boot-flag frame. Merging cuts those to 52 and to
 * 206-245, which matters because the explorer paints one icon per project on
 * every filter change and the splash stacks three flag frames at once.
 *
 * Deliberately not tied to the 16x16 icon grid — the boot flag is 48x28 — so
 * `rows` may be any height and each row any width; nothing here reads
 * ICON_SIZE. No bound is enforced on either, and none is wanted: every caller
 * passes a build-time constant (the icon registry, bootFlagFrames.js), so a map
 * large enough to matter is a map somebody typed. Do not feed this user input
 * or anything fetched at runtime without capping it first.
 *
 * Returns `[{ x, y, width, fill }]` in row order, every rect one row tall.
 */
export function pixelRuns(rows, palette = PALETTE, unknown = UNKNOWN_COLOUR) {
  const runs = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === TRANSPARENT) {
        x += 1;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end += 1;
      const known = Object.hasOwn(palette, ch);
      // Fuchsia alone is a signal only to someone looking at the splash. The
      // maps are hand-typed, and a mistyped key is a pixel the author will not
      // be looking for.
      if (!known && import.meta.env.DEV && !warned.has(ch)) {
        warned.add(ch);
        console.warn(
          `[pixelIcons] "${ch}" is not a palette key — painting it ${unknown}`,
        );
      }
      runs.push({
        x,
        y,
        width: end - x,
        // hasOwn, not `?? unknown`: a palette handed in from outside this
        // module could inherit from Object.prototype, and a lookup that walks
        // the chain would answer a function for some keys instead of falling
        // back.
        fill: known ? palette[ch] : unknown,
      });
      x = end;
    }
  });
  return runs;
}
