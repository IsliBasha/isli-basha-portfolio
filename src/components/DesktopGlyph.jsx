import { memo } from 'react';
import { PALETTE } from '../lib/pixelIcons/palette.js';
import { pixelRuns, UNKNOWN_COLOUR } from '../lib/pixelIcons/runs.js';
import { DESKTOP_GRID, getDesktopIcon } from '../lib/pixelIcons/desktop.js';

// pixelRuns is pure and the maps are constants, so each one's rects are worth
// computing once per process. Keyed on the map object rather than on the kind:
// caching under the kind would grow an entry per typo'd name, where every miss
// resolves to the one placeholder map and so shares its one entry.
const runCache = new Map();

function glyphRuns(kind) {
  const map = getDesktopIcon(kind);
  const cached = runCache.get(map);
  if (cached) return cached;

  // Palette and fallback colour passed explicitly rather than left to
  // pixelRuns' defaults: this component is the one that promises a damaged map
  // paints fuchsia instead of black, and that promise should be readable here.
  const runs = pixelRuns(map, PALETTE, UNKNOWN_COLOUR);
  runCache.set(map, runs);
  return runs;
}

/**
 * Draws one of the seven 32x32 desktop shortcuts from its map in
 * pixelIcons/desktop.js.
 *
 * The viewBox is fixed at the map's own 32x32 grid and `width`/`height` scale
 * it, so an integer `size` lands every pixel on a device pixel boundary; the
 * default is the 32px `.win95-desktop-icon__glyph` box, where the map draws
 * one map pixel to one device pixel at DPR 1;
 * `shapeRendering="crispEdges"` stops the renderer softening those edges back
 * into the blur this whole system exists to avoid.
 *
 * Decorative: the shortcut's own label sits directly underneath, and the
 * button carries the accessible name.
 *
 * `display: block` because the slot around it is exactly 32px tall — an inline
 * SVG would sit on a text baseline and push its own bottom edge past the box.
 *
 * Memoised: DesktopIcon calls setPos on every pointermove of a drag, so
 * without this the glyph re-renders on every frame of one. Not to recompute
 * the rects — the run cache above already answers that off the map object —
 * but to build one React element per rect and hand the lot to the reconciler,
 * 96 of them for contact.exe and 212 for cmd, for as long as the pointer is
 * down. Both props are primitives, so the default shallow compare is exact,
 * and DesktopIcon.test.jsx holds the caller to passing only primitives.
 */
export const DesktopGlyph = memo(function DesktopGlyph({ kind, size = 32 }) {
  const runs = glyphRuns(kind);

  return (
    <svg
      viewBox={`0 0 ${DESKTOP_GRID} ${DESKTOP_GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
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
