// Renders every registered pixel icon onto one SVG contact sheet, so a set of
// hand-drawn 16x16 maps can be looked at as a set rather than approved one
// diff hunk at a time.
//
//   node scripts/icon-sheet.js out.svg
//
// Nothing on the site reads the output; this is a review artefact. It draws
// straight from the three registries in src/lib/pixelIcons rather than from
// index.js, which keeps the sections honest — an icon appears under the file
// that actually owns it, and a duplicate id shows up twice instead of being
// silently merged away.
//
// Split the way scripts/dither.js is: everything above `main` is a pure module
// that icon-sheet.test.js imports, and the half that reads argv and writes to
// disk runs only when this file is the process entry point.

/* global process */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import system from '../src/lib/pixelIcons/system.js';
import games from '../src/lib/pixelIcons/games.js';
import projectIcons from '../src/lib/pixelIcons/projects.js';
import {
  PALETTE,
  TRANSPARENT,
  ICON_SIZE,
  isValidMap,
} from '../src/lib/pixelIcons/palette.js';

const SCALE = 4;
const ICON_PX = ICON_SIZE * SCALE;
const CELL = 72;
const COLUMNS = 8;
const MARGIN = 24;
const SECTION_HEADER = 36;
const LABEL_SIZE = 10;
const LABEL_LINE = 12;
const LABEL_LINES = 3;
const LABEL_BAND = LABEL_LINES * LABEL_LINE + 6;
const ROW_PITCH = CELL + LABEL_BAND;
// 10px monospace runs about 6px per character, so twelve is what fits a cell
// before a label starts reaching into its neighbour.
const LABEL_CHARS = 12;

const SECTIONS = [
  ['system', system],
  ['games', games],
  ['projects', projectIcons],
];

// A character that is not a palette key would otherwise reach the SVG as
// fill="undefined", which renderers paint black — the sheet would grow a stray
// outline pixel and the reviewer would blame the drawing rather than the typo.
// Fuchsia is in the palette, is never used for an outline, and is impossible
// to mistake for intent. src/components/PixelIcon.jsx keeps the same constant
// under the same name for the same reason; it is module-private there, so the
// sheet repeats the choice rather than importing out of a component.
const UNKNOWN_COLOUR = PALETTE.m;

// `games` is empty until the order that owns it lands, and `system` has been
// populated since the shell order, so a blanket "no icons anywhere" check
// either fires on a healthy tree or can never fire at all. The projects
// registry is the one that can quietly empty out, and a contact sheet showing
// eight system tiles says nothing about the work being reviewed.
const SECTIONS_THAT_MUST_DRAW = ['projects'];

/**
 * Merge each row of a map into runs of one colour, the way PixelIcon does.
 * A rect per pixel would be 256 per icon and 8,000-odd for the sheet, which is
 * slow enough to notice when the browser rasterises it for the PNG.
 */
export function iconRuns(rows) {
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
      runs.push({ x, y, width: end - x, fill: PALETTE[ch] ?? UNKNOWN_COLOUR });
      x = end;
    }
  });
  return runs;
}

/** Break an id over at most three lines, preferring a break after a hyphen. */
export function wrapId(id) {
  const lines = [];
  let rest = id;
  while (rest.length > LABEL_CHARS && lines.length < LABEL_LINES - 1) {
    const head = rest.slice(0, LABEL_CHARS + 1);
    const hyphen = head.lastIndexOf('-');
    const at = hyphen > 0 ? hyphen + 1 : LABEL_CHARS;
    lines.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  lines.push(rest);
  return lines;
}

export function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderLabel(id, cellX, cellY) {
  return wrapId(id)
    .map((line, i) => {
      const y = cellY + CELL + LABEL_LINE * (i + 1);
      // A line that still overflows after wrapping gets squeezed rather than
      // allowed to run into the next cell — squeezed is legible, overlapped is not.
      const fitted =
        line.length > LABEL_CHARS
          ? ` textLength="${CELL - 4}" lengthAdjust="spacingAndGlyphs"`
          : '';
      return `<text x="${cellX + CELL / 2}" y="${y}" class="label"${fitted}>${escapeText(line)}</text>`;
    })
    .join('\n');
}

function renderCell(id, rows, cellX, cellY) {
  const inset = (CELL - ICON_PX) / 2;
  const rects = iconRuns(rows)
    .map(
      (run) =>
        `<rect x="${cellX + inset + run.x * SCALE}" y="${cellY + inset + run.y * SCALE}" ` +
        `width="${run.width * SCALE}" height="${SCALE}" fill="${run.fill}"/>`,
    )
    .join('');
  return [
    `<rect x="${cellX}" y="${cellY}" width="${CELL}" height="${CELL}" class="tile"/>`,
    rects,
    renderLabel(id, cellX, cellY),
  ].join('\n');
}

function sectionRows(count) {
  return Math.max(1, Math.ceil(count / COLUMNS));
}

/**
 * The whole sheet as an SVG string.
 *
 * `registries` takes the same `[name, map]` pairs as SECTIONS and defaults to
 * the real three, so a test can render one scratch icon without editing a
 * registry every other test in the suite reads.
 */
export function renderSheet(registries = SECTIONS) {
  const width = MARGIN * 2 + CELL * COLUMNS;
  const height =
    MARGIN * 2 +
    registries.reduce(
      (total, [, registry]) =>
        total + SECTION_HEADER + sectionRows(Object.keys(registry).length) * ROW_PITCH,
      0,
    );

  const body = [];
  let y = MARGIN;
  for (const [name, registry] of registries) {
    const entries = Object.entries(registry);
    body.push(
      `<text x="${MARGIN}" y="${y + 20}" class="section">${escapeText(name)} — ${entries.length}</text>`,
    );
    y += SECTION_HEADER;
    if (entries.length === 0) {
      body.push(`<text x="${MARGIN}" y="${y + 18}" class="empty">no icons registered yet</text>`);
    }
    entries.forEach(([id, rows], i) => {
      const cellX = MARGIN + (i % COLUMNS) * CELL;
      const cellY = y + Math.floor(i / COLUMNS) * ROW_PITCH;
      body.push(renderCell(id, rows, cellX, cellY));
    });
    y += sectionRows(entries.length) * ROW_PITCH;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
<style>
  .sheet { fill: #ffffff; }
  .tile { fill: #ffffff; stroke: #c0c0c0; stroke-width: 1; }
  .section { font: bold 14px monospace; fill: #000000; }
  .empty { font: ${LABEL_SIZE}px monospace; fill: #808080; }
  .label { font: ${LABEL_SIZE}px monospace; fill: #000000; text-anchor: middle; }
</style>
<rect width="${width}" height="${height}" class="sheet"/>
${body.join('\n')}
</svg>
`;
}

/**
 * The first `section/id` whose map is malformed, or null when every map is a
 * well-formed 16x16 grid. A row a character short draws a plausible tile here
 * and a sheared icon on the site, so the sheet refuses to render rather than
 * handing a reviewer an artefact that hides the defect it exists to surface.
 */
function firstInvalidMap(registries) {
  for (const [name, registry] of registries) {
    for (const [id, rows] of Object.entries(registry)) {
      if (!isValidMap(rows)) return `${name}/${id}`;
    }
  }
  return null;
}

function main() {
  const out = process.argv[2];
  if (!out) {
    console.error('usage: node scripts/icon-sheet.js <out.svg>');
    process.exit(1);
  }

  for (const [name, registry] of SECTIONS) {
    if (SECTIONS_THAT_MUST_DRAW.includes(name) && Object.keys(registry).length === 0) {
      console.error(`icon-sheet: the ${name} registry is empty — nothing to review`);
      process.exit(1);
    }
  }

  const invalid = firstInvalidMap(SECTIONS);
  if (invalid) {
    console.error(`icon-sheet: ${invalid} is not a valid ${ICON_SIZE}x${ICON_SIZE} map`);
    process.exit(1);
  }

  try {
    writeFileSync(out, renderSheet());
  } catch (err) {
    // A path under a directory that does not exist is the way this actually
    // fails, and node's default stack trace buries which path it was under a
    // rollup of internals.
    console.error(`icon-sheet: cannot write ${out}: ${err.code ?? err.message}`);
    process.exit(1);
  }

  const total = SECTIONS.reduce((n, [, registry]) => n + Object.keys(registry).length, 0);
  console.log(
    `icon-sheet: ${total} icons -> ${out}` +
      ` (${SECTIONS.map(([name, r]) => `${name} ${Object.keys(r).length}`).join(', ')})`,
  );
}

// Only the half below `main` touches argv and the filesystem, so importing
// this module from a test writes nothing. `node -e` leaves argv[1] undefined,
// which pathToFileURL throws on.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
