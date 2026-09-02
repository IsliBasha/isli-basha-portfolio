import system from './system.js';
import games from './games.js';
import projects from './projects.js';

export { PALETTE, TRANSPARENT, ICON_SIZE, isValidMap } from './palette.js';
export { CATEGORY_ICONS, ALL_ICON, ALL_OPEN_ICON } from './categories.js';

/**
 * Every icon the site can draw, merged from three registries so separate
 * pieces of work append to separate files. Later registries win on an id
 * clash; pixelIcons.test.js asserts there are no clashes to win.
 *
 * Null-prototype on purpose: icon ids arrive from project data, and on a plain
 * object `ICONS['constructor']` would answer with a function that is not an
 * icon. Nothing here should ever inherit.
 */
export const ICONS = Object.assign(Object.create(null), system, games, projects);

export const FALLBACK_ICON_ID = 'generic-exe';

// Ids already reported, so a missing icon inside a list of 25 projects logs
// one line rather than one line per render.
const warned = new Set();

/** Test seam: the Set above outlives a single test, which would let a later
 *  "did not warn" assertion pass because an earlier test already warned. */
export function __resetIconWarnings() {
  warned.clear();
}

/**
 * Map an icon id to one that is definitely registered, warning once per
 * unknown id in dev. Returns the id itself, so callers can key a cache on the
 * resolved id and never store an entry under a name that does not exist.
 */
export function resolveIconId(id) {
  if (Object.hasOwn(ICONS, id)) return id;

  if (import.meta.env.DEV && !warned.has(id)) {
    warned.add(id);
    console.warn(
      `[pixelIcons] no icon registered for "${id}" — falling back to ${FALLBACK_ICON_ID}`,
    );
  }
  return FALLBACK_ICON_ID;
}

/**
 * Resolve an icon id to its pixel map, falling back to the generic program
 * icon when the id is unknown.
 *
 * Never throws: this runs inside render, and a typo'd id in project data
 * should cost a placeholder icon and a console line, not the whole window.
 */
export function getIcon(id) {
  return ICONS[resolveIconId(id)];
}
