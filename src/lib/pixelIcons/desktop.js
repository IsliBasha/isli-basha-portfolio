// The seven desktop shortcuts, drawn on a 32x32 grid over the palette in
// palette.js. Out of the icon registry in index.js for the same reason the
// boot flag is: that registry is 16x16 by contract, and these are the icons
// the desktop draws at full size, where a 16x16 map scaled up would double
// every outline into a 2px slab.
//
// Each one is the elder sibling of the 16x16 titlebar icon its window wears
// (notepad, dos, mail, pdf, mine, snake in system.js) — the same object,
// redrawn with the detail 16 pixels had to drop rather than resampled. my work
// is the one exception: its window wears the closed `folder`, while the
// shortcut draws `folder-open` with pages standing out of it — at 32 pixels
// there is room to show what is in the folder, at 16 there is not.
//
// All seven follow the same house rules as that set: a black outline, light
// arriving from the top-left, flat fills, and no colour outside the 16 the
// palette holds.
import { PALETTE, TRANSPARENT } from './palette.js';

export const DESKTOP_GRID = 32;

// An icon that paints less than a third of its grid is a speck in an empty
// square at this size. The floor sits well under the thinnest of the seven
// (contact, at 532 of 1024) so a genuinely spare subject stays possible.
const MIN_PAINTED = 340;

// Three is the line between a drawing and a silhouette: an outline, a fill and
// one shade. The same floor pixelIcons.test.js holds the 16x16 set to.
const MIN_COLOURS = 3;

// runs.js paints fuchsia for any character that is not a palette key, and that
// only reads as damage for as long as nothing draws with it on purpose.
const SENTINEL = 'm';

/**
 * about.txt — a page with the corner turned down, ruled in the same navy the
 * 16px notepad rules its lines in.
 *
 * The dog-ear is the whole reason this reads as a different document from
 * resume.pdf below it, which shares its silhouette: the crease steps one pixel
 * per row from the top edge to the right, and the flap behind it is gray, so
 * the corner reads as folded rather than as a chipped outline.
 */
const about = [
  '................................',
  '................................',
  '......kkkkkkkkkkkkkkkkkkkk......',
  '......kwwwwwwwwwwwwkdddddk......',
  '......kwwwwwwwwwwwwwkddddk......',
  '......kwwwwwwwwwwwwwwkdddk......',
  '......kwwwwwwwwwwwwwwwkddk......',
  '......kwwwwwwwwwwwwwwwwkdk......',
  '......kwwwwwwwwwwwwwwwwwkk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwBBBBBBBBBBBBwwwdk......',
  '......kwwBBBBBBBBBBBBwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwBBBBBBBBBBBBBBwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwBBBBBBBBBBBBBBwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwBBBBBBBBBBwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwBBBBBBBBBBBBBBwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwBBBBBBBBBBBBwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kkkkkkkkkkkkkkkkkkkk......',
  '................................',
  '................................',
];

/**
 * cmd — the MS-DOS Prompt window the 16px `dos` icon shows edge-on: a raised
 * silver frame, a navy caption with one button, and a sunken well holding a
 * black console.
 *
 * The prompt is `C:` and a block cursor, not `C:\>`. A backslash on this grid
 * is a one-pixel diagonal, and at 32px a one-pixel diagonal beside a colon
 * reads as the digit 1; the cursor says "this is a console" without asking a
 * single column of pixels to carry a character.
 */
const stack = [
  '................................',
  '................................',
  '................................',
  '................................',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '..kwwwwwwwwwwwwwwwwwwwwwwwwwdk..',
  '..kwggggggggggggggggggggggggdk..',
  '..kwgBBBBBBBBBBBBBBBBBBBBBBgdk..',
  '..kwgBBBBBBBBBBBBBBBBBggggBgdk..',
  '..kwgBBwwBwwwBwwwBBBBBgkkgBgdk..',
  '..kwgBBBBBBBBBBBBBBBBBggggBgdk..',
  '..kwgBBBBBBBBBBBBBBBBBBBBBBgdk..',
  '..kwggggggggggggggggggggggggdk..',
  '..kwgddddddddddddddddddddddgdk..',
  '..kwgdkkkkkkkkkkkkkkkkkkkkwgdk..',
  '..kwgdkwwwwwkkkkkwwwwkkkkkwgdk..',
  '..kwgdkwwkkkkwwkkwwwwkkkkkwgdk..',
  '..kwgdkwwkkkkwwkkwwwwkkkkkwgdk..',
  '..kwgdkwwkkkkkkkkwwwwkkkkkwgdk..',
  '..kwgdkwwkkkkwwkkwwwwkkkkkwgdk..',
  '..kwgdkwwwwwkwwkkwwwwkkkkkwgdk..',
  '..kwgdkkkkkkkkkkkkkkkkkkkkwgdk..',
  '..kwgdkddddddddddddkkkkkkkwgdk..',
  '..kwgdkkkkkkkkkkkkkkkkkkkkwgdk..',
  '..kwgdwwwwwwwwwwwwwwwwwwwwwgdk..',
  '..kwggggggggggggggggggggggggdk..',
  '..kddddddddddddddddddddddddddk..',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '................................',
  '................................',
  '................................',
  '................................',
];

/**
 * contact.exe — a closed envelope seen from the back, the flap folded down
 * over it.
 *
 * The flap is white and the envelope behind it silver, because they are two
 * planes and only one of them is facing the light; a single flat fill with a
 * black V scratched across it is a rectangle with a line in it. The V steps
 * two pixels across per row, and a row of gray under every black step is the
 * shadow the fold casts on the sheet below.
 */
const contact = [
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '..kkkwwwwwwwwwwwwwwwwwwwwwwkkk..',
  '..kddkkwwwwwwwwwwwwwwwwwwkkddk..',
  '..kggddkkwwwwwwwwwwwwwwkkddggk..',
  '..kggggddkkwwwwwwwwwwkkddggggk..',
  '..kggggggddkkwwwwwwkkddggggggk..',
  '..kggggggggddkkwwkkddggggggggk..',
  '..kggggggggggddkkddggggggggggk..',
  '..kggggggggggggddggggggggggggk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgggggggggggggggggggggggggdk..',
  '..kgdddddddddddddddddddddddddk..',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

/**
 * resume.pdf — the same page silhouette as about.txt carrying the Acrobat red,
 * the way the 16px `pdf` icon does: the label block, not the page, is the part
 * anyone recognises, so it takes the top third and the white A inside it is
 * the detail 16 pixels had no room for.
 */
const resume = [
  '................................',
  '................................',
  '......kkkkkkkkkkkkkkkkkkkk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwkkkkkkkkkkkkkkwdk......',
  '......kwwkrrrrrwwrrrrrkwdk......',
  '......kwwkrrrrwwwwrrrRkwdk......',
  '......kwwkrrrwwrrwwrrRkwdk......',
  '......kwwkrrrwwwwwwrrRkwdk......',
  '......kwwkrrrwwrrwwrrRkwdk......',
  '......kwwkRRRwwRRwwRRRkwdk......',
  '......kwwkkkkkkkkkkkkkkwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwddddddddddddddwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwddddddddddddddwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwddddddddddwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwdddddddddddddwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kwwwwwwwwwwwwwwwwwdk......',
  '......kkkkkkkkkkkkkkkkkkkk......',
  '................................',
  '................................',
];

/**
 * minesweeper.exe — the mine sitting on an unswept tile, drawn full-bleed the
 * way the 16px `mine` is, with the tile's raised bevel two pixels deep instead
 * of one: white down the lit top-left, gray down the shadowed bottom-right,
 * mitred at the two corners where they meet.
 *
 * Every diagonal spike steps two pixels at a time. A one-pixel diagonal on
 * this grid touches only at its corners and comes apart into a line of dots at
 * 1x, which is what turns a mine into an asterisk.
 */
const minesweeper = [
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwd',
  'wwggggggggggggggggggggggggggggdd',
  'wwgggggggggggggkkgggggggggggggdd',
  'wwgggggggggggggkkgggggggggggggdd',
  'wwgggkkggggggggkkggggggggkkgggdd',
  'wwggggkkgggggggkkgggggggkkggggdd',
  'wwgggggkkggggkkkkkkggggkkgggggdd',
  'wwggggggkkgkkkkkkkkkkgkkggggggdd',
  'wwgggggggkkkkkkkkkkkkkkgggggggdd',
  'wwgggggggkkkkkkkkkkkkkkgggggggdd',
  'wwggggggkkkwwwkkkkkkkkkkggggggdd',
  'wwggggggkkwwwwkkkkkkkkkkggggggdd',
  'wwgggggkkkwwwkkkkkkkkkkkkgggggdd',
  'wwgggggkkkkkkkkkkkkkkkkkkgggggdd',
  'wwgkkkkkkkkkkkkkkkkkkkkkkkkkkgdd',
  'wwgkkkkkkkkkkkkkkkkkkkkkkkkkkgdd',
  'wwgggggkkkkkkkkkkkkkkkkkkgggggdd',
  'wwgggggkkkkkkkkkkkkkkkkkkgggggdd',
  'wwggggggkkkkkkkkkkkkkkkkggggggdd',
  'wwggggggkkkkkkkkkkkkkkkkggggggdd',
  'wwgggggggkkkkkkkkkkkkkkgggggggdd',
  'wwgggggggkkkkkkkkkkkkkkgggggggdd',
  'wwggggggkkgkkkkkkkkkkgkkggggggdd',
  'wwgggggkkggggkkkkkkggggkkgggggdd',
  'wwggggkkgggggggkkgggggggkkggggdd',
  'wwgggkkggggggggkkggggggggkkgggdd',
  'wwgggggggggggggkkgggggggggggggdd',
  'wwgggggggggggggkkgggggggggggggdd',
  'wwggggggggggggggggggggggggggggdd',
  'wwdddddddddddddddddddddddddddddd',
  'wddddddddddddddddddddddddddddddd',
];

/**
 * snake.exe — the snake coiled round the apple on the same bevelled playfield
 * the mine sits on, so the two games read as a pair.
 *
 * Four pixel-wide segments, one blank column between every turn so the coil
 * reads as a body doubling back rather than as one green slab, and a clear
 * black margin between the tail and the wall — a body run flush against the
 * frame reads as cropped, not as coiled. The dark twin runs down every
 * trailing edge, which is what gives a flat lime shape a top-left light.
 */
const snake = [
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkklllllllLkkkkkkkkkkkkkkdd',
  'wwkkkkkklllllkkLkkkkkkkkkkkkkkdd',
  'wwkkkkkklllllkkLkkkkkkkkkkkkkkdd',
  'wwkkkkkkllllLLLLkkkkkkkkkkkkkkdd',
  'wwkkkkkklllLkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkklllllllllllllllLkkkkkkdd',
  'wwkkkkkklllllllllllllllLkkkkkkdd',
  'wwkkkkkklllllllllllllllLkkkkkkdd',
  'wwkkkkkkLLLLLLLLLLLLlllLkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkklllLkkkkkkdd',
  'wwkkkkkkkkkkkkwwrrkklllLkkkkkkdd',
  'wwkkkkkkkkkkkkrrrRkklllLkkkkkkdd',
  'wwkkkkkkkkkkkkrrrRkklllLkkkkkkdd',
  'wwkkkkkkkkkkkkRRRRkklllLkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkklllLkkkkkkdd',
  'wwkkkkkkkklllllllllllllLkkkkkkdd',
  'wwkkkkkklllllllllllllllLkkkkkkdd',
  'wwkkkkkkLLlllllllllllllLkkkkkkdd',
  'wwkkkkkkkkLLLLLLLLLLLLLLkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwkkkkkkkkkkkkkkkkkkkkkkkkkkkkdd',
  'wwdddddddddddddddddddddddddddddd',
  'wddddddddddddddddddddddddddddddd',
];

/**
 * my work — the manila folder standing open with two sheets of paper out of
 * it: the 32px reading of the shape `folder-open` draws at 16, with the detail
 * sixteen pixels had to leave out. Olive back plate, bright yellow flap whose
 * left edge steps right a pixel every second row so it leans away from the
 * plate behind it, and the tab dropped to rows 9–13 to clear the pages.
 *
 * The pages are what tells this folder from the closed one the titlebar wears,
 * and they are the reason the shortcut is worth 32 pixels. Two of them,
 * staggered rather than squared up, so the rear one reads as a second sheet
 * and not as a taller first, ruled in the same navy at the same two-pixel
 * inset about.txt rules its lines at. The rear sheet drops the gray bevel
 * column the front one carries down its right edge: at this size a lone gray
 * pixel between two whites reads as dirt, not as an edge in shadow.
 */
const mywork = [
  '................................',
  '................................',
  '................................',
  '.................kkkkkkkkkkkkk..',
  '.................kwwwwwwwwwwwk..',
  '.................kwwBBBBBBwwwk..',
  '.............kkkkkkkkkkkkkkwwk..',
  '.............kwwwwwwwwwwwdkwwk..',
  '.............kwwBBBBBBBwwdkwwk..',
  '..kkkkkkkkkkkkwwwwwwwwwwwdkwwk..',
  '..kwyyyyyyyykkwwBBBBBBBwwdkwwk..',
  '..kwyyyyyyyykkwwwwwwwwwwwdkwwk..',
  '..kwyyyyyyyykkwwBBBBBwwwwdkwwk..',
  '..kwyyyyyyyykkkkkkkkkkkkkkkkkk..',
  '..kwYYYYYYYYYYYYYYYYYYYYYYYYYk..',
  '..kwYYYYYYYYYYYYYYYYYYYYYYYYYk..',
  '..kwYYYYYYYYYYYYYYYYYYYYYYYYYk..',
  '..kwYYYYYYYYYYYYYYYYYYYYYYYYYk..',
  '..kwYYYYYYYYYYYYYYYYYYYYYYYYYk..',
  '..kwYYYYYYYYYYYYYYYYYYYYYYYYYk..',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '...kwyyyyyyyyyyyyyyyyyyyyyyyykk.',
  '...kwyyyyyyyyyyyyyyyyyyyyyyyyyk.',
  '....kwyyyyyyyyyyyyyyyyyyyyyyyyk.',
  '....kwyyyyyyyyyyyyyyyyyyyyyyyyk.',
  '.....kwyyyyyyyyyyyyyyyyyyyyyyyk.',
  '.....kwyyyyyyyyyyyyyyyyyyyyyyyk.',
  '......kYYYYYYYYYYYYYYYYYYYYYYYk.',
  '......kkkkkkkkkkkkkkkkkkkkkkkkk.',
  '................................',
  '................................',
  '................................',
];

/**
 * Keyed by the `kind` DesktopApp.jsx hands each <DesktopIcon>. Null-prototype
 * so a lookup can never answer with something off Object.prototype.
 *
 * Frozen a row at a time, not only at the top. Freezing the registry alone
 * guarantees exactly one thing — that no name can be added, removed or
 * repointed — and leaves `DESKTOP_ICONS.about[5] = 'x'` succeeding in silence,
 * which is the edit somebody would actually make. It would also be worse than
 * a wrong pixel: DesktopGlyph caches each map's rects on the map object, so
 * whether the change ever reaches the screen depends on which render got there
 * first, and after that the stale rects are served for the rest of the
 * session. Frozen to the row, that assignment throws in strict-mode ESM at the
 * line that wrote it.
 */
export const DESKTOP_ICONS = Object.freeze(
  Object.entries({ about, stack, contact, resume, minesweeper, snake, mywork }).reduce(
    (registry, [kind, rows]) => Object.assign(registry, { [kind]: Object.freeze(rows) }),
    Object.create(null),
  ),
);

/**
 * Everything about the seven maps that has to hold for them to draw as icons,
 * reported as a list of problems so a failure names what drifted. Hand edits
 * to a 32x32 map go wrong a character at a time: one row a pixel short shears
 * everything below it, and a map pasted twice gives two shortcuts the same
 * picture without changing a single count.
 *
 * Returns `[]` when the set is sound. Never throws — this is the check whose
 * whole job is to say which icon broke, and a TypeError out of it says
 * nothing.
 */
export function validateDesktopIcons(icons = DESKTOP_ICONS) {
  const problems = [];

  // Reported like everything else rather than thrown: a caller that lost the
  // registry entirely should get a sentence, not a TypeError out of the check
  // whose job is to say what broke.
  if (icons === null || typeof icons !== 'object') {
    problems.push(`the icon registry is ${icons === null ? 'null' : typeof icons}, not an object`);
    return problems;
  }

  const names = Object.keys(icons);

  if (names.length === 0) {
    problems.push('no desktop icons are registered');
    return problems;
  }

  // Indexed rather than for..of over entries: a map that came back undefined
  // has to be named like any other drift, and reading `.length` off it inside
  // a forEach throws out of the check instead of reporting it.
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    const rows = icons[name];

    if (!Array.isArray(rows)) {
      problems.push(`${name} is not an array of rows`);
      continue;
    }

    if (rows.length !== DESKTOP_GRID) {
      problems.push(`${name} is ${rows.length} rows, expected ${DESKTOP_GRID}`);
    }

    // Indexed for the same reason one level down: a stray comma in a 32-row
    // literal leaves a hole a forEach walks straight past, and a row that came
    // back a number reaches `row.length`.
    for (let y = 0; y < rows.length; y += 1) {
      const row = rows[y];
      if (typeof row !== 'string') {
        problems.push(`${name} row ${y} is not a string`);
        continue;
      }

      if (row.length !== DESKTOP_GRID) {
        problems.push(`${name} row ${y} is ${row.length} chars, expected ${DESKTOP_GRID}`);
      }
      for (const ch of row) {
        if (ch !== TRANSPARENT && !Object.hasOwn(PALETTE, ch)) {
          problems.push(`${name} row ${y} uses "${ch}", which is not a palette key`);
          break;
        }
      }
    }

    const flat = rows.filter((row) => typeof row === 'string').join('');
    const painted = [...flat].filter((ch) => ch !== TRANSPARENT);
    if (painted.length < MIN_PAINTED) {
      problems.push(
        `${name} paints ${painted.length} pixels, expected at least ${MIN_PAINTED}`,
      );
    }
    const used = new Set(painted);
    if (used.size < MIN_COLOURS) {
      problems.push(`${name} uses only ${used.size} colours, expected at least ${MIN_COLOURS}`);
    }
    if (used.has(SENTINEL)) {
      problems.push(`${name} draws with "${SENTINEL}", which runs.js reserves for damage`);
    }
  }

  // Distinct kinds are not distinct pictures. A map pasted from the icon above
  // it keeps its own key, so nothing else here would see it, and two shortcuts
  // would sit on the desktop wearing the same drawing.
  for (let i = 0; i < names.length; i += 1) {
    if (!Array.isArray(icons[names[i]])) continue;
    for (let j = i + 1; j < names.length; j += 1) {
      if (!Array.isArray(icons[names[j]])) continue;
      if (icons[names[i]].join('\n') === icons[names[j]].join('\n')) {
        problems.push(`${names[i]} and ${names[j]} are drawn identically`);
      }
    }
  }

  return problems;
}

/**
 * The placeholder an unregistered `kind` draws: a hollow 2px ring, deliberately
 * drawn in a character no palette defines, so pixelRuns paints it with the
 * `unknown` colour its callers hand it — the same fuchsia route a mistyped key
 * inside one of the seven maps above takes. Computed rather than typed out,
 * because a ring is not artwork and 32 lines of one character would read as if
 * it were.
 *
 * The first unknown kind of a session logs two dev warnings, not one:
 * getDesktopIcon names the kind that has no artwork, and runs.js names the
 * character it does not know, which is the proof that the fuchsia path a
 * damaged map would take is still wired up. Every unknown kind after it logs
 * only the first line — they all resolve to this one map object, so
 * DesktopGlyph's run cache answers without calling pixelRuns, and runs.js has
 * already burned `?` in its own warned set either way.
 */
const MISSING_KEY = '?';
const DESKTOP_FALLBACK = Object.freeze(
  Array.from({ length: DESKTOP_GRID }, (_, y) =>
    Array.from({ length: DESKTOP_GRID }, (_, x) =>
      x < 2 || y < 2 || x >= DESKTOP_GRID - 2 || y >= DESKTOP_GRID - 2
        ? MISSING_KEY
        : TRANSPARENT,
    ).join(''),
  ),
);

// Kinds already reported. Without this a `kind` typo'd in DesktopApp.jsx logs
// once per render, and DesktopIcon re-renders on every pointermove of a drag.
const warned = new Set();

/** Test seam: the Set above outlives a single test, which would let a later
 *  "did not warn" assertion pass because an earlier test already warned. */
export function __resetDesktopWarnings() {
  warned.clear();
}

/**
 * Map a shortcut `kind` to the map that draws it, falling back to the
 * placeholder when nothing is registered under that name.
 *
 * Never throws, for any `kind` at all: this runs inside render, and a typo'd
 * kind should cost a fuchsia ring and a console line, not the whole desktop.
 * The name is put through String() before it reaches the warning, because a
 * Symbol survives the lookup and the Set and then throws on interpolation —
 * one line of dev logging is not worth taking the desktop down with it.
 */
export function getDesktopIcon(kind) {
  if (Object.hasOwn(DESKTOP_ICONS, kind)) return DESKTOP_ICONS[kind];

  if (import.meta.env.DEV && !warned.has(kind)) {
    warned.add(kind);
    console.warn(
      `[desktopIcons] no shortcut artwork for "${String(kind)}" — drawing the missing-icon ring`,
    );
  }
  return DESKTOP_FALLBACK;
}
