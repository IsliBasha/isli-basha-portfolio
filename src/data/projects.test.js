import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import { projects } from './projects.js';
import { ICONS } from '../lib/pixelIcons/index.js';
import projectIcons from '../lib/pixelIcons/projects.js';
import { SOURCES } from '../../scripts/dither.js';

const VALID_CATEGORIES = ['work', 'web', 'app', 'tool', 'research'];

describe('projects data', () => {
  it('includes the mira-study project', () => {
    const ids = projects.map((p) => p.id);
    expect(ids).toContain('mira-study');
  });

  it('mira-study has a valid GitHub link', () => {
    const p = projects.find((p) => p.id === 'mira-study');
    expect(p).toBeDefined();
    expect(p.link.href).toBe('https://github.com/IsliBasha/mira-study');
  });

  it('mira-study lists PyQt6 in its stack', () => {
    const p = projects.find((p) => p.id === 'mira-study');
    expect(p.stack).toContain('PyQt6');
  });

  it('gives every project a unique id', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only lists a screenshot for projects the dither pipeline actually produces', () => {
    // Cross-checks against scripts/dither.js's SOURCES rather than a
    // hardcoded list, so the two can't silently drift apart.
    const withShot = projects.filter((p) => p.screenshot).map((p) => p.id).sort();
    const ditherIds = SOURCES.map((s) => s.id).sort();
    expect(withShot).toEqual(ditherIds);
  });

  it('points each screenshot field at the exact path the dither pipeline writes', () => {
    for (const p of projects) {
      if (!p.screenshot) continue;
      expect(p.screenshot, `${p.id} screenshot path`).toBe(`/nokia/${p.id}.png`);
    }
  });

  it('all projects have the fields every surface renders', () => {
    for (const p of projects) {
      expect(p.id, `${p.id} missing id`).toBeTruthy();
      expect(p.name, `${p.id} missing name`).toBeTruthy();
      expect(p.description, `${p.id} missing description`).toBeTruthy();
      expect(Array.isArray(p.stack), `${p.id} stack must be array`).toBe(true);
      expect(p.stack.length, `${p.id} stack must not be empty`).toBeGreaterThan(0);
      expect(p.iconType, `${p.id} missing iconType`).toBeTruthy();
      expect(p.icon, `${p.id} missing explorer icon`).toBeTruthy();
      expect(p.tag, `${p.id} missing tag`).toBeTruthy();
      expect(p.type, `${p.id} missing type`).toBeTruthy();
      expect(VALID_CATEGORIES, `${p.id} category`).toContain(p.category);
    }
  });

  // A project either has somewhere real to send a visitor, or it says why it
  // doesn't. The failure this guards against is a card whose button renders
  // with nothing behind it.
  it('every project either has a usable link or explains why it has none', () => {
    for (const p of projects) {
      if (p.link === null) {
        expect(p.privateNote, `${p.id} is linkless and must carry a privateNote`).toBeTruthy();
        continue;
      }
      expect(p.link.href, `${p.id} link.href`).toMatch(/^https:\/\//);
      expect(p.link.label, `${p.id} link.label`).toBeTruthy();
    }
  });

  // Private repos 404 for every visitor who isn't signed in as the owner, so
  // linking one is worse than showing no link at all. These were live on the
  // site: copycat and Coolab_hackathon both point at private repos.
  it('never links a GitHub repo that is known to be private', () => {
    const PRIVATE_REPOS = [
      'IsliBasha/copycat',
      'IsliBasha/Coolab_hackathon',
      'IsliBasha/ecovolt-platform',
      'IsliBasha/previsit-doctor-dashboard',
      'IsliBasha/Software-Testing',
    ];
    for (const p of projects) {
      if (!p.link) continue;
      for (const repo of PRIVATE_REPOS) {
        expect(p.link.href, `${p.id} links private repo ${repo}`).not.toContain(repo);
      }
    }
  });

  // The explorer draws p.icon through PixelIcon, which swallows an unknown id
  // and paints the generic placeholder. Without this the whole grid could
  // quietly degrade to 25 identical grey windows and still pass every other
  // test here.
  it('gives every project an icon id the registry can actually draw', () => {
    for (const p of projects) {
      expect(typeof p.icon, `${p.id} icon must be an id string`).toBe('string');
      // Object.hasOwn, not toHaveProperty: the latter walks the prototype
      // chain, so an icon of 'toString' would pass while drawing nothing.
      expect(
        Object.hasOwn(ICONS, p.icon),
        `${p.id} icon "${p.icon}" is not registered`,
      ).toBe(true);
    }
  });

  // Every project carries its own drawing rather than its category's, and the
  // id is derived from the project id rather than chosen. So a project renamed
  // without its icon renamed fails here instead of silently falling back to the
  // generic placeholder, and a project moved between categories can no longer
  // sit in the Tool folder still drawing a briefcase — there is one legal icon
  // per project and this is it.
  it('draws every project with its own registered proj-<id> icon', () => {
    for (const p of projects) {
      expect(p.icon, `${p.id} should draw its own icon`).toBe(`proj-${p.id}`);
      expect(
        Object.hasOwn(projectIcons, p.icon),
        `${p.id} icon "${p.icon}" is not in the per-project registry`,
      ).toBe(true);
    }
  });

  // Ofive repos live under a private org; the org name should not leak into a
  // link a visitor could try to open.
  it('routes Ofive work to the company site, never to a private org repo', () => {
    const ofive = projects.filter((p) => p.id.startsWith('ofive-'));
    expect(ofive.length).toBeGreaterThan(0);
    for (const p of ofive) {
      expect(p.link.href, `${p.id}`).toBe('https://ofive.io');
      expect(p.link.href).not.toContain('github.com');
    }
  });
});

// ── No emoji in the rendered UI ─────────────────────────────────────────────
// The desktop is a 1995 machine: a colour emoji glyph is anti-aliased, font-
// dependent and decades out of period, which is why the explorer draws
// PixelIcons instead. This walks the source rather than the DOM so a new emoji
// is caught wherever it is introduced, including in a component no test
// happens to render.
//
// Test files are excluded (this one has to name the thing it forbids) and so
// is src/nokia — the phone renders its own monochrome text UI and never reads
// p.icon.

const SRC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EMOJI = /\p{Extended_Pictographic}/u;

// Files that still hold a pictographic character, each waiting on the order
// that owns it. The list must shrink and never grow: the assertion is exact
// equality, so clearing the last emoji out of one of these files fails this
// test until its entry is deleted too.
const PENDING_EMOJI_FILES = [
  // Submenu marker in the desktop context menu — shell-glyph order.
  'components/ContextMenu.jsx',
  // The Minesweeper smiley button — games-icon order.
  'components/Minesweeper.jsx',
];

// Only the Nokia port itself, not any directory that happens to be called
// nokia further down the tree.
const NOKIA_ROOT = join(SRC_ROOT, 'nokia');
const TEST_FILE = /(\.(test|spec)\.[jt]sx?)$/;
// Text the desktop can actually render. Reading a binary that lands under src/
// would fail the suite with a message about emoji, which is the wrong lead.
const READABLE = /\.(jsx?|tsx?|css|html)$/;

function sourceFiles(dir = SRC_ROOT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === NOKIA_ROOT || entry.name === '__tests__') return [];
      return sourceFiles(full);
    }
    if (TEST_FILE.test(entry.name) || !READABLE.test(entry.name)) return [];
    return [full];
  });
}

describe('no emoji in the desktop UI', () => {
  it('scans a source tree that is actually there', () => {
    // An empty walk would make every assertion below vacuously true.
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(30);
    expect(files.some((f) => f.endsWith('MyWorkExplorer.jsx'))).toBe(true);
  });

  it('leaves no emoji outside the files later orders still own', () => {
    const offenders = sourceFiles()
      .filter((file) => EMOJI.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC_ROOT, file).split('\\').join('/'))
      .sort();

    expect(offenders).toEqual([...PENDING_EMOJI_FILES].sort());
  });

  it('keeps every project and category icon free of emoji', () => {
    for (const p of projects) {
      expect(EMOJI.test(p.icon), `${p.id} icon is an emoji`).toBe(false);
    }
    const explorer = readFileSync(join(SRC_ROOT, 'components/MyWorkExplorer.jsx'), 'utf8');
    expect(EMOJI.test(explorer)).toBe(false);
  });
});
