import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ICONS,
  FALLBACK_ICON_ID,
  getIcon,
  resolveIconId,
  __resetIconWarnings,
} from './index.js';
import { PALETTE, TRANSPARENT, ICON_SIZE, isValidMap } from './palette.js';
import { CATEGORY_ICONS, ALL_ICON, ALL_OPEN_ICON } from './categories.js';
import system from './system.js';
import games from './games.js';
import projectIcons from './projects.js';

const REQUIRED_SYSTEM_ICONS = [
  'folder',
  'folder-open',
  'briefcase',
  'globe-doc',
  'app-window',
  'wrench',
  'book-flask',
  'generic-exe',
];

// The Start menu, the Run dialog and the tray name these directly. A missing
// id there costs a silent fallback to the generic placeholder, which looks
// like a design choice rather than a bug.
const REQUIRED_SHELL_ICONS = [
  'notepad',
  'dos',
  'mail',
  'pdf',
  'mine',
  'snake',
  'stats',
  'display',
  'find',
  'help',
  'run',
  'shutdown',
  'speaker',
  'speaker-muted',
  'programs',
  'folder-docs',
];

// The eight that order 07 hangs on window titlebars as well as in the menu.
const APP_ICONS = [
  'notepad',
  'dos',
  'mail',
  'pdf',
  'mine',
  'snake',
  'stats',
  'display',
];

describe('palette', () => {
  it('defines the 16 VGA system colours', () => {
    expect(Object.keys(PALETTE)).toHaveLength(16);
  });

  it('maps every key to a 6-digit hex colour', () => {
    for (const [key, hex] of Object.entries(PALETTE)) {
      expect(hex, `palette key ${key}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // Two keys sharing a colour would make one of them dead weight nobody
  // notices, and a key equal to '.' would silently paint the transparent
  // marker.
  it('gives each key a distinct colour and never claims the transparent marker', () => {
    const hexes = Object.values(PALETTE);
    expect(new Set(hexes).size).toBe(hexes.length);
    // Not toHaveProperty: '.' reads as a key path there, never as a key.
    expect(Object.keys(PALETTE)).not.toContain(TRANSPARENT);
  });
});

describe('isValidMap', () => {
  it('accepts a well-formed 16x16 map', () => {
    expect(isValidMap(Array(ICON_SIZE).fill('.'.repeat(ICON_SIZE)))).toBe(true);
  });

  it('rejects a map with the wrong number of rows', () => {
    expect(isValidMap(Array(15).fill('.'.repeat(ICON_SIZE)))).toBe(false);
  });

  it('rejects a row that is a character short', () => {
    const rows = Array(ICON_SIZE).fill('.'.repeat(ICON_SIZE));
    rows[7] = '.'.repeat(ICON_SIZE - 1);
    expect(isValidMap(rows)).toBe(false);
  });

  it('rejects a character that is not a palette key', () => {
    const rows = Array(ICON_SIZE).fill('.'.repeat(ICON_SIZE));
    rows[3] = 'z'.repeat(ICON_SIZE);
    expect(isValidMap(rows)).toBe(false);
  });

  it('rejects anything that is not an array of strings', () => {
    expect(isValidMap(null)).toBe(false);
    expect(isValidMap('folder')).toBe(false);
    expect(isValidMap(Array(ICON_SIZE).fill(0))).toBe(false);
  });
});

describe('icon registry', () => {
  it('draws every icon this order promised', () => {
    for (const id of REQUIRED_SYSTEM_ICONS) {
      expect(Object.hasOwn(ICONS, id), `missing icon ${id}`).toBe(true);
    }
  });

  it('draws every shell glyph the Start menu, Run dialog and tray name', () => {
    for (const id of REQUIRED_SHELL_ICONS) {
      expect(Object.hasOwn(ICONS, id), `missing icon ${id}`).toBe(true);
    }
  });

  // An app icon that resolves to the fallback would still render, so nothing
  // else in the suite would notice it had gone missing.
  it('never lets an app icon resolve to the generic placeholder', () => {
    for (const id of APP_ICONS) {
      expect(resolveIconId(id), `${id} fell back`).toBe(id);
    }
  });

  it('registers only valid 16x16 maps', () => {
    for (const [id, rows] of Object.entries(ICONS)) {
      expect(isValidMap(rows), `${id} is not a valid 16x16 map`).toBe(true);
    }
  });

  // The registries are merged into one object, so a duplicate id would be
  // silently overwritten by whichever file is merged last.
  it('never lets two registries claim the same id', () => {
    const ids = [
      ...Object.keys(system),
      ...Object.keys(games),
      ...Object.keys(projectIcons),
    ];
    expect(new Set(ids).size, `duplicate id across registries: ${ids}`).toBe(ids.length);
    expect(Object.keys(ICONS)).toHaveLength(ids.length);
  });

  it('keeps games and project registries free for the orders that own them', () => {
    // A guard on the split, not on emptiness: if a later order fills these,
    // the ids must still land in ICONS, which the duplicate test above covers.
    expect(games).toBeTypeOf('object');
    expect(projectIcons).toBeTypeOf('object');
  });

  it('uses at least three colours per icon, so nothing ships as a silhouette', () => {
    for (const [id, rows] of Object.entries(ICONS)) {
      const used = new Set(rows.join('').split('').filter((ch) => ch !== TRANSPARENT));
      expect(used.size, `${id} uses only ${[...used].join('')}`).toBeGreaterThanOrEqual(3);
    }
  });

  // Icon ids arrive from project data. On a normal object ICONS['constructor']
  // answers with a function, and getIcon would hand a function to a renderer
  // expecting 16 strings.
  it('inherits nothing from Object.prototype', () => {
    expect(Object.getPrototypeOf(ICONS)).toBeNull();
    expect(ICONS.toString).toBeUndefined();
  });
});

// The sidebar draws these six ids and nothing else validates them: an
// unregistered id renders the generic placeholder, which looks deliberate.
describe('category icons', () => {
  it('names an icon that is actually registered for every category', () => {
    for (const [category, id] of Object.entries(CATEGORY_ICONS)) {
      expect(Object.hasOwn(ICONS, id), `${category} → "${id}" is not registered`).toBe(true);
    }
  });

  it('registers both states of the All folder', () => {
    expect(Object.hasOwn(ICONS, ALL_ICON), `"${ALL_ICON}" is not registered`).toBe(true);
    expect(Object.hasOwn(ICONS, ALL_OPEN_ICON), `"${ALL_OPEN_ICON}" is not registered`).toBe(true);
  });

  it('never points a category at the fallback placeholder', () => {
    const ids = [...Object.values(CATEGORY_ICONS), ALL_ICON, ALL_OPEN_ICON];
    expect(ids).not.toContain(FALLBACK_ICON_ID);
  });

  it('gives each category its own icon', () => {
    const ids = Object.values(CATEGORY_ICONS);
    expect(new Set(ids).size, `two categories share an icon: ${ids}`).toBe(ids.length);
  });

  it('covers every category the project data uses', () => {
    expect(Object.keys(CATEGORY_ICONS).sort()).toEqual(
      ['app', 'research', 'tool', 'web', 'work'].sort(),
    );
  });
});

describe('getIcon', () => {
  beforeEach(() => {
    // The warned-id Set outlives a test. Without this, a later "did not warn"
    // assertion would pass because an earlier test already burned the id.
    __resetIconWarnings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the registered map for a known id', () => {
    expect(getIcon('folder')).toBe(ICONS.folder);
  });

  it('falls back to the generic program icon for an unknown id', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getIcon('no-such-icon')).toBe(ICONS[FALLBACK_ICON_ID]);
  });

  it('warns once per missing id instead of once per render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getIcon('missing-in-a-list-of-25');
    getIcon('missing-in-a-list-of-25');
    getIcon('missing-in-a-list-of-25');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('missing-in-a-list-of-25');
  });

  it('warns again for the same id once the warning state is reset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getIcon('reset-me');
    __resetIconWarnings();
    getIcon('reset-me');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('never throws on a missing id, because it runs inside render', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => getIcon(undefined)).not.toThrow();
    expect(getIcon(undefined)).toBe(ICONS[FALLBACK_ICON_ID]);
  });

  it('treats an inherited property name as a missing icon', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const id of ['constructor', 'toString', '__proto__']) {
      expect(getIcon(id), `${id} resolved to something that is not an icon`).toBe(
        ICONS[FALLBACK_ICON_ID],
      );
    }
    expect(warn).toHaveBeenCalledTimes(3);
  });
});

describe('resolveIconId', () => {
  beforeEach(() => {
    __resetIconWarnings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the id itself when it is registered', () => {
    expect(resolveIconId('briefcase')).toBe('briefcase');
  });

  // Callers key caches on this, so it must be a name that exists.
  it('returns the fallback id, never the missing one', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveIconId('briefcasee')).toBe(FALLBACK_ICON_ID);
  });
});
