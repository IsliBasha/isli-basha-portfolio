// The 16 colours a VGA Windows 95 install could actually put on screen.
// Every icon map in this directory is written as 16 lines of 16 characters
// picked from these keys, so a map stays legible as text in a diff and needs
// no build step to become pixels.
//
// Case carries meaning: a lowercase key is the bright half of a pair, the
// uppercase key its dark counterpart (`y` yellow / `Y` olive, `b` blue /
// `B` navy). `.` is not a colour — it is "leave this pixel empty", which is
// what lets an icon sit on the explorer's white grid and on its navy
// selection highlight without carrying a background of its own.

// Frozen because `const` only pins the binding: every icon is coloured by
// reading these keys at render time, so one stray assignment would repaint the
// whole set for the rest of the session.
export const PALETTE = Object.freeze({
  k: '#000000', // black — every outline
  d: '#808080', // gray — shadow side of a bevel
  g: '#c0c0c0', // silver — the chrome fill
  w: '#ffffff', // white — lit side of a bevel
  r: '#ff0000', // red
  R: '#800000', // maroon
  y: '#ffff00', // yellow — folder faces
  Y: '#808000', // olive — folder shading
  l: '#00ff00', // lime
  L: '#008000', // green
  c: '#00ffff', // aqua
  C: '#008080', // teal
  b: '#0000ff', // blue
  B: '#000080', // navy — title bars
  m: '#ff00ff', // fuchsia
  M: '#800080', // purple
});

export const TRANSPARENT = '.';

export const ICON_SIZE = 16;

/**
 * True when `rows` is a well-formed icon map: exactly 16 strings of exactly
 * 16 characters, each character a palette key or the transparent marker.
 *
 * Hand-drawn maps drift by a character at a time — one row a pixel short
 * shears everything below it — so this runs over every registered icon in
 * pixelIcons.test.js rather than trusting the drawing.
 */
export function isValidMap(rows) {
  if (!Array.isArray(rows) || rows.length !== ICON_SIZE) return false;
  return rows.every(
    (row) =>
      typeof row === 'string' &&
      row.length === ICON_SIZE &&
      [...row].every((ch) => ch === TRANSPARENT || Object.hasOwn(PALETTE, ch)),
  );
}
