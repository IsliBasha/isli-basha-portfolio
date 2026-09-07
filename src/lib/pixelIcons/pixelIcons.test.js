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
import { projects } from '../../data/projects.js';
import { FRAMES } from '../bootFlagFrames.js';

// Named pairs rather than three bare objects: a cross-registry failure has to
// say which file to open, and "projects/proj-medt" does that.
const REGISTRIES = [
  ['system', system],
  ['games', games],
  ['projects', projectIcons],
];

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
  'start-flag',
];

// The eight that order 07 hangs on window titlebars as well as in the menu,
// plus the Start button's flag: Taskbar.jsx indexes ICONS['start-flag']
// directly, so a renamed key throws a TypeError with no id in it rather than
// naming the icon that went missing.
const APP_ICONS = [
  'notepad',
  'dos',
  'mail',
  'pdf',
  'mine',
  'snake',
  'stats',
  'display',
  'start-flag',
];

// The Minesweeper board and status bar draw these by id. A missing one renders
// the generic program placeholder, which looks like a deliberate square button
// rather than a bug.
const REQUIRED_GAME_ICONS = [
  'face-idle',
  'face-o',
  'face-win',
  'face-dead',
  'ms-flag',
  'ms-mine',
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

  // Distinct ids are not distinct pictures. A project map pasted out of
  // system.js keeps its own id, so the per-registry duplicate check in
  // "project icons" below never sees it — and the explorer draws a briefcase
  // for a project that was supposed to get its own object.
  it('draws no two icons identically, in any registry', () => {
    const byDrawing = new Map();
    for (const [section, registry] of REGISTRIES) {
      for (const [id, rows] of Object.entries(registry)) {
        const drawing = rows.join('\n');
        const twin = byDrawing.get(drawing);
        expect(twin, `${section}/${id} is drawn identically to ${twin}`).toBeUndefined();
        byDrawing.set(drawing, `${section}/${id}`);
      }
    }
  });

  it('draws every glyph the games ask for', () => {
    for (const id of REQUIRED_GAME_ICONS) {
      expect(Object.hasOwn(games, id), `missing game icon ${id}`).toBe(true);
    }
  });

  // The four faces are built from one shared disc, so a copy-paste that forgot
  // to change the mouth would leave two ids pointing at the same picture and
  // the button would look frozen mid-game.
  it('gives every registered icon its own drawing, not just its own id', () => {
    const seen = new Map();
    for (const [id, rows] of Object.entries(ICONS)) {
      const key = rows.join('|');
      expect(seen.has(key), `${id} is pixel-for-pixel ${seen.get(key)}`).toBe(false);
      seen.set(key, id);
    }
  });

  it('uses at least three colours per icon, so nothing ships as a silhouette', () => {
    for (const [id, rows] of Object.entries(ICONS)) {
      const used = new Set(rows.join('').split('').filter((ch) => ch !== TRANSPARENT));
      expect(used.size, `${id} uses only ${[...used].join('')}`).toBeGreaterThanOrEqual(3);
    }
  });

  // Fuchsia is the damage marker: runs.js paints PALETTE.m for any character
  // that is not a palette key, and that only reads as "something is broken"
  // for as long as nothing draws with it on purpose. One icon using it for a
  // magenta detail turns every future typo into a plausible pixel.
  it('leaves the fuchsia sentinel unused so an unknown character stands out', () => {
    const SENTINEL = 'm';
    const drawings = [
      ...Object.entries(ICONS),
      ...FRAMES.map((rows, i) => [`boot flag frame ${i + 1}`, rows]),
    ];
    expect(drawings.length).toBeGreaterThan(FRAMES.length);
    for (const [id, rows] of drawings) {
      expect(
        rows.join(''),
        `${id} draws with "${SENTINEL}", which runs.js reserves for unknown characters`,
      ).not.toContain(SENTINEL);
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

// The project icons are hand-drawn text. Nothing about a 16x16 map fails
// loudly: a row a character short shears the rows below it, a map pasted twice
// gives two projects the same picture, and an outline forgotten leaves a
// coloured smear that only shows up on the navy selection highlight. Each of
// those is a separate assertion here because each fails on its own.
describe('project icons', () => {
  const entries = Object.entries(projectIcons);

  it('draws one icon per project and nothing spare', () => {
    expect(entries).toHaveLength(projects.length);
  });

  it('names every icon after a project that exists', () => {
    const projectIds = new Set(projects.map((p) => p.id));
    for (const [id] of entries) {
      expect(id.startsWith('proj-'), `${id} is not namespaced proj-`).toBe(true);
      expect(
        projectIds.has(id.slice('proj-'.length)),
        `${id} names no project in src/data/projects.js`,
      ).toBe(true);
    }
  });

  it('registers only valid 16x16 maps', () => {
    for (const [id, rows] of entries) {
      expect(isValidMap(rows), `${id} is not a valid 16x16 map`).toBe(true);
    }
  });

  // Two projects sharing a drawing is invisible in the suite and obvious on the
  // explorer grid, which is the wrong way round.
  it('gives no two projects the same drawing', () => {
    const byDrawing = new Map();
    for (const [id, rows] of entries) {
      const drawing = rows.join('\n');
      const twin = byDrawing.get(drawing);
      expect(twin, `${id} is drawn identically to ${twin}`).toBeUndefined();
      byDrawing.set(drawing, id);
    }
  });

  // The set reads as one set only if every icon is outlined and lit from the
  // same side. A fill with no outline dissolves into the navy highlight; a fill
  // with no highlight sits flat next to the eight system icons.
  it('outlines and lights every icon the way system.js does', () => {
    for (const [id, rows] of entries) {
      const pixels = rows.join('');
      const outline = [...pixels].filter((ch) => ch === 'k').length;
      const highlight = [...pixels].filter((ch) => ch === 'w').length;
      expect(outline, `${id} has only ${outline} outline pixels`).toBeGreaterThanOrEqual(12);
      expect(highlight, `${id} has no highlight pixels`).toBeGreaterThanOrEqual(1);
    }
  });

  // An icon drawn too small for its cell reads as a smudge at 32px beside the
  // system set, whose thinnest drawing (wrench) paints 100 of its 256 pixels.
  // The floor sits below that so a genuinely spare subject stays possible, but
  // above the size at which a map is a speck in the corner of an empty grid.
  it('paints enough of the grid to read as an icon on the explorer', () => {
    const MIN_PAINTED = 80;
    for (const [id, rows] of entries) {
      const painted = [...rows.join('')].filter((ch) => ch !== TRANSPARENT).length;
      expect(
        painted,
        `${id} paints only ${painted} of ${ICON_SIZE * ICON_SIZE} pixels`,
      ).toBeGreaterThanOrEqual(MIN_PAINTED);
    }
  });

  // Six is the budget for a project icon: past that one starts looking
  // rendered rather than drawn, and stops matching the row it sits in. The
  // loop below runs over this registry only, so it is a rule about project
  // icons and not about the shell — system.js keeps to six by habit rather
  // than by assertion, and start-flag spends nine on purpose.
  it('keeps each project icon inside its six-colour budget', () => {
    for (const [id, rows] of entries) {
      const used = new Set(rows.join('').split('').filter((ch) => ch !== TRANSPARENT));
      expect(used.size, `${id} uses ${used.size} colours: ${[...used].join('')}`)
        .toBeLessThanOrEqual(6);
    }
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
