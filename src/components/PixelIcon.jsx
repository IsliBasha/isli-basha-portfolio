import { memo } from 'react';
import {
  PALETTE,
  TRANSPARENT,
  ICON_SIZE,
  getIcon,
  resolveIconId,
} from '../lib/pixelIcons/index.js';

// A 16x16 map is up to 256 rects if drawn a pixel at a time. Merging runs of
// the same colour along a row cuts the folder icon to 52, which matters
// because the explorer paints one icon per project plus the category list on
// every filter change.
const runCache = new Map();

// An unregistered palette character would otherwise reach the SVG with
// fill=undefined, which paints black and reads as a stray outline pixel.
// Fuchsia is in the palette, is never used for an outline, and is impossible
// to mistake for intent.
const UNKNOWN_COLOUR = PALETTE.m;

function iconRuns(id) {
  // Key the cache on the resolved id: caching under a missing id would grow an
  // entry per typo and store the fallback under a name that does not exist.
  const resolved = resolveIconId(id);
  const cached = runCache.get(resolved);
  if (cached) return cached;

  const rows = getIcon(resolved);
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

  runCache.set(resolved, runs);
  return runs;
}

/**
 * Draws a registered 16x16 pixel icon at any size.
 *
 * The viewBox is fixed at the map's own 16x16 grid and `width`/`height` scale
 * it, so an integer `size` lands every pixel on a device pixel boundary;
 * `shapeRendering="crispEdges"` stops the renderer softening those edges back
 * into the blur this whole system exists to avoid.
 *
 * Decorative by default (`aria-hidden`), because in both places it is used the
 * icon sits next to the same word it is illustrating. Passing `title` opts
 * into `role="img"` and an accessible name for a standalone use.
 *
 * Memoised: the explorer re-renders on every search keystroke, and with 25
 * tiles plus 6 sidebar entries that is roughly 1,775 rect elements rebuilt for
 * nothing. Every prop is a primitive, so the default shallow compare is exact.
 */
export const PixelIcon = memo(function PixelIcon({ id, size = 32, className, title }) {
  const runs = iconRuns(id);
  const labelled = Boolean(title);

  return (
    <svg
      viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      focusable="false"
    >
      {labelled && <title>{title}</title>}
      {runs.map((run) => (
        <rect
          key={`${run.y}-${run.x}`}
          x={run.x}
          y={run.y}
          width={run.width}
          height={1}
          fill={run.fill}
        />
      ))}
    </svg>
  );
});
