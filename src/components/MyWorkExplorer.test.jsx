import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyWorkExplorer } from './MyWorkExplorer.jsx';
import { CATEGORIES } from './myWorkCategories.js';
import { projects } from '../data/projects.js';
import { ICONS, PALETTE, TRANSPARENT, ICON_SIZE, FALLBACK_ICON_ID } from '../lib/pixelIcons/index.js';

const EMOJI = /\p{Extended_Pictographic}/u;

function categoryButton(name) {
  return screen.getByRole('button', { name });
}

/**
 * Rebuild the 16x16 map an <svg> actually painted. Kept local rather than
 * shared with PixelIcon.test.jsx on purpose: this file asserts what the
 * explorer draws, and a shared helper would let one change quietly rewrite
 * both sets of expectations.
 */
function repaint(svg) {
  const hexToKey = new Map(Object.entries(PALETTE).map(([key, hex]) => [hex, key]));
  const grid = Array.from({ length: ICON_SIZE }, () => Array(ICON_SIZE).fill(TRANSPARENT));

  for (const rect of svg.querySelectorAll('rect')) {
    const x = Number(rect.getAttribute('x'));
    const y = Number(rect.getAttribute('y'));
    const width = Number(rect.getAttribute('width'));
    const key = hexToKey.get(rect.getAttribute('fill'));
    for (let i = 0; i < width; i += 1) grid[y][x + i] = key;
  }
  return grid.map((row) => row.join(''));
}

describe('MyWorkExplorer icons', () => {
  it('draws a 16px pixel icon beside every category', () => {
    const { container } = render(<MyWorkExplorer />);
    const paneIcons = container.querySelectorAll('.explorer-folder-icon');

    expect(paneIcons).toHaveLength(CATEGORIES.length);
    for (const icon of paneIcons) {
      expect(icon.tagName.toLowerCase()).toBe('svg');
      expect(icon.getAttribute('width')).toBe('16');
      expect(icon.getAttribute('shape-rendering')).toBe('crispEdges');
    }
  });

  // The failure this exists for: a mistyped category icon id resolves to the
  // generic placeholder, so the sidebar still shows six crisp 16px icons and
  // every other assertion here still passes. Only the pixels give it away.
  it('never falls back to the placeholder for a category', () => {
    const { container } = render(<MyWorkExplorer />);
    const fallback = ICONS[FALLBACK_ICON_ID];
    const painted = [...container.querySelectorAll('.explorer-folder-icon')].map(repaint);

    painted.forEach((map, i) => {
      expect(map, `${CATEGORIES[i].label} painted the ${FALLBACK_ICON_ID} placeholder`)
        .not.toEqual(fallback);
    });
  });

  it('gives every category a visibly different icon', () => {
    const { container } = render(<MyWorkExplorer />);
    const painted = [...container.querySelectorAll('.explorer-folder-icon')].map((svg) =>
      repaint(svg).join('|'),
    );
    expect(new Set(painted).size).toBe(CATEGORIES.length);
  });

  it('draws a 32px pixel icon on every visible project tile', () => {
    const { container } = render(<MyWorkExplorer />);
    const tileIcons = container.querySelectorAll('.explorer-tile-icon');

    expect(tileIcons).toHaveLength(projects.length);
    for (const icon of tileIcons) {
      expect(icon.getAttribute('width')).toBe('32');
    }
  });

  it('opens the All folder while it is the active filter and closes it otherwise', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyWorkExplorer />);
    const allIcon = () => container.querySelector('.explorer-folder-icon');

    expect(repaint(allIcon())).toEqual(ICONS['folder-open']);

    await user.click(categoryButton('Work'));
    expect(repaint(allIcon())).toEqual(ICONS.folder);

    await user.click(categoryButton('All'));
    expect(repaint(allIcon())).toEqual(ICONS['folder-open']);
  });

  it('keeps the icons out of the accessible name of each category button', () => {
    render(<MyWorkExplorer />);
    for (const { label } of CATEGORIES) {
      expect(categoryButton(label)).toBeInTheDocument();
    }
  });

  it('renders no emoji anywhere in the explorer', () => {
    const { container } = render(<MyWorkExplorer />);
    expect(EMOJI.test(container.textContent)).toBe(false);
  });

  it('still filters the grid down to one category', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyWorkExplorer />);
    const webProjects = projects.filter((p) => p.category === 'web');

    await user.click(categoryButton('Web'));
    expect(container.querySelectorAll('.explorer-tile-icon')).toHaveLength(webProjects.length);
  });
});
