import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { WINDOW_ICONS } from './windowIcons.js';
import { WINDOW_ORDER } from '../windowOrder.js';
import { ICONS, FALLBACK_ICON_ID } from './pixelIcons/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const desktopSource = readFileSync(resolve(here, '../DesktopApp.jsx'), 'utf8');
const taskbarSource = readFileSync(resolve(here, '../components/Taskbar.jsx'), 'utf8');

describe('the window-icon map', () => {
  it('names an icon for every window the desktop mounts, and no other', () => {
    // Both directions. A window missing from the map hands PixelIcon
    // `undefined` and gets the generic-application fallback on its taskbar
    // button -- which is what Display Properties got while the taskbar was
    // still drawing AppGlyphs. An entry for an id no Window claims is dead
    // weight nothing renders.
    expect([...WINDOW_ORDER].sort()).toEqual(Object.keys(WINDOW_ICONS).sort());
  });

  it('names an icon that is actually registered, so nothing falls back', () => {
    // resolveIconId swaps an unknown id for generic-exe and warns once in dev,
    // which in production is a silent wrong picture. This is the assertion
    // that keeps every mounted window on its own artwork.
    for (const [id, icon] of Object.entries(WINDOW_ICONS)) {
      expect(Object.hasOwn(ICONS, icon), `no icon registered for "${id}"`).toBe(true);
      expect(icon).not.toBe(FALLBACK_ICON_ID);
    }
  });

  it('is what both the titlebars and the taskbar button read', () => {
    // The two surfaces drew the same window differently for months: native
    // 16-unit PixelIcons in the titlebar, a halved 32-unit AppGlyph on the
    // taskbar. Read the sources back so a future edit cannot quietly
    // reintroduce a second source of truth.
    for (const id of WINDOW_ORDER) {
      expect(desktopSource).toContain(`<PixelIcon id={WINDOW_ICONS.${id}} size={16} />`);
    }
    expect(taskbarSource).toContain('<PixelIcon id={WINDOW_ICONS[entry.id]} size={16} />');
    expect(taskbarSource).not.toContain('<AppGlyph');
  });
});
