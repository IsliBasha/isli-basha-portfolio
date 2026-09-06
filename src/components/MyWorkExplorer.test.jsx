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

describe('MyWorkExplorer selection', () => {
  function tiles(container) {
    return [...container.querySelectorAll('.explorer-tile')];
  }

  it('marks exactly one tile selected, and it is the one showing in the detail pane', () => {
    const { container } = render(<MyWorkExplorer />);
    const selected = tiles(container).filter(
      (tile) => tile.dataset.selected === 'true',
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain(projects[0].name);
    expect(selected[0]).toHaveAttribute('aria-current', 'true');
  });

  // The whole tile used to fill with titlebar navy, which put a second block
  // of the one colour reserved for the active window behind a 32px icon.
  it('paints the label and leaves the icon and the tile box unpainted', () => {
    const { container } = render(<MyWorkExplorer />);
    const [selected] = tiles(container).filter((t) => t.dataset.selected === 'true');

    expect(selected.querySelector('.explorer-tile__label')).not.toBeNull();
    expect(selected.getAttribute('style')).toBeNull();
    expect(selected.querySelector('.explorer-tile-icon').getAttribute('style')).toBeNull();
  });

  it('moves the selection to the tile that was clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyWorkExplorer />);
    const third = tiles(container)[2];

    await user.click(third);

    expect(third.dataset.selected).toBe('true');
    expect(
      tiles(container).filter((tile) => tile.dataset.selected === 'true'),
    ).toHaveLength(1);
  });
});

describe('MyWorkExplorer detail pane', () => {
  /**
   * "Company →" in the data reads "Company" on the button. Same strip the
   * component does: taking the first word instead would agree with it only for
   * as long as every link label stays one word.
   */
  function destinationOf(project) {
    return project.link.label.replace(/\s*→\s*$/u, '');
  }

  it('opens the project link through a plain chrome button, not a filled pill', () => {
    const { container } = render(<MyWorkExplorer />);
    const link = container.querySelector('.explorer-open-btn');

    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link).toHaveClass('win-btn');
    // The blue fill was applied inline; a leftover style attribute would put
    // it straight back regardless of what the stylesheet says.
    expect(link.getAttribute('style')).toBeNull();
    expect(link).toHaveAttribute('href', projects[0].link.href);
  });

  // "Open" said nothing about where it opened. The label the data carries does
  // — minus the trailing arrow, which is a desktop affordance the button has no
  // use for.
  it('names the destination on the button', () => {
    const { container } = render(<MyWorkExplorer />);
    const link = container.querySelector('.explorer-open-btn');

    expect(link.textContent).toBe(destinationOf(projects[0]));
    expect(link.textContent).not.toContain('→');
  });

  it('follows the selection to a project that goes somewhere else', async () => {
    const user = userEvent.setup();
    const repo = projects.find((p) => p.link?.label.startsWith('GitHub'));
    const { container } = render(<MyWorkExplorer />);

    const tile = [...container.querySelectorAll('.explorer-tile')].find((t) =>
      t.textContent.includes(repo.name),
    );
    await user.click(tile);

    expect(container.querySelector('.explorer-open-btn').textContent).toBe('GitHub');
  });

  it('pairs the destination with the project name in the accessible name', () => {
    const { container } = render(<MyWorkExplorer />);
    expect(container.querySelector('.explorer-open-btn')).toHaveAttribute(
      'aria-label',
      `${destinationOf(projects[0])} — ${projects[0].name}`,
    );
  });

  it('opens in a new tab without handing over the referrer', () => {
    const { container } = render(<MyWorkExplorer />);
    const link = container.querySelector('.explorer-open-btn');

    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel').split(/\s+/).sort()).toEqual([
      'noopener',
      'noreferrer',
    ]);
  });

  it('keeps the sunken note, not a button, for a project with no link', async () => {
    const user = userEvent.setup();
    const linkless = projects.find((p) => p.link === null);
    const { container } = render(<MyWorkExplorer />);

    const tile = [...container.querySelectorAll('.explorer-tile')].find((t) =>
      t.textContent.includes(linkless.name),
    );
    await user.click(tile);

    expect(container.querySelector('.explorer-open-btn')).toBeNull();
    expect(screen.getByText(linkless.privateNote)).toBeInTheDocument();
  });
});

describe('MyWorkExplorer status bar', () => {
  function panels(container) {
    return [...container.querySelectorAll('.explorer-statusbar__panel')];
  }

  it('splits the status bar into two sunken panels', () => {
    const { container } = render(<MyWorkExplorer />);
    const [count, selection] = panels(container);

    expect(panels(container)).toHaveLength(2);
    expect(count).toHaveTextContent(`${projects.length} objects`);
    expect(selection).toHaveTextContent('1 object selected');
  });

  it('reports the match count while a search is running', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyWorkExplorer />);

    await user.type(screen.getByLabelText(/search projects/i), projects[0].name);

    expect(panels(container)[0]).toHaveTextContent(`matching '${projects[0].name}'`);
  });

  // The second panel stays in the DOM with nothing in it: a panel that
  // disappears lets the first one jump wider the moment a search misses.
  it('keeps the second panel present and empty when nothing is selected', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyWorkExplorer />);

    await user.type(screen.getByLabelText(/search projects/i), 'zzzznothing');

    expect(panels(container)).toHaveLength(2);
    expect(panels(container)[0]).toHaveTextContent("0 objects matching 'zzzznothing'");
    expect(panels(container)[1].textContent).toBe('');
  });
});

describe('MyWorkExplorer sidebar', () => {
  function rows(container) {
    return [...container.querySelectorAll('.explorer-folder-item')];
  }

  it('marks exactly one category active, from the stylesheet and not inline', () => {
    const { container } = render(<MyWorkExplorer />);
    const active = rows(container).filter((r) => r.dataset.selected === 'true');

    expect(rows(container)).toHaveLength(CATEGORIES.length);
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveTextContent(CATEGORIES[0].label);
    for (const row of rows(container)) {
      expect(row.getAttribute('style')).toBeNull();
    }
  });

  // data-selected paints the row; aria-current is what says so out loud. The
  // tiles carried both and the sidebar only the first, so a screen reader
  // heard no difference between the open category and the other four.
  it('says which category is current, not only which one is painted', () => {
    const { container } = render(<MyWorkExplorer />);
    const current = rows(container).filter(
      (r) => r.getAttribute('aria-current') === 'true',
    );

    expect(current).toHaveLength(1);
    expect(current[0].dataset.selected).toBe('true');
    for (const row of rows(container)) {
      if (row.dataset.selected === 'true') continue;
      expect(row.getAttribute('aria-current')).toBeNull();
    }
  });

  // The row used to fill navy edge to edge, which painted the 16px folder icon
  // into the one colour reserved for the active window — the same thing the
  // tiles were doing. Only the name is in the painted span now.
  it('wraps the category name in the span the highlight paints, icon outside it', () => {
    const { container } = render(<MyWorkExplorer />);
    const [active] = rows(container).filter((r) => r.dataset.selected === 'true');
    const label = active.querySelector('.explorer-folder-item__label');

    expect(label.textContent).toBe(CATEGORIES[0].label);
    expect(label.querySelector('svg')).toBeNull();
    expect(active.querySelector('.explorer-folder-icon')).not.toBeNull();
  });

  it('moves the highlight to the category that was clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<MyWorkExplorer />);

    await user.click(categoryButton('Web'));

    const active = rows(container).filter((r) => r.dataset.selected === 'true');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveTextContent('Web');
  });
});

describe('MyWorkExplorer grid', () => {
  // The 25 tiles are taller than the window at every size it opens at. The
  // grid is a grid item, so without room to shrink it sized itself to its
  // content and .explorer-body simply cut the last row off — no scrollbar,
  // no clue that six projects were missing.
  it('renders every project in a scrollable grid, last row included', () => {
    const { container } = render(<MyWorkExplorer />);
    const grid = container.querySelector('.explorer-tile-grid');

    expect(grid).not.toBeNull();
    expect(grid.querySelectorAll('.explorer-tile')).toHaveLength(projects.length);
    expect(grid.lastElementChild.textContent).toContain(
      projects[projects.length - 1].name,
    );
  });

  // The detail pane under the grid is a fixed 140px. On a window dragged down
  // to the 220x140 resize floor the pane took the last of the height and left
  // the grid at 0px, so the file list showed no files at all.
  it('floors the grid at a full tile row so it never collapses to nothing', () => {
    const { container } = render(<MyWorkExplorer />);
    const body = container.querySelector('.explorer-tile-grid').parentElement;

    // A tile is a 32px icon over up to three lines of 0.65rem label: 91px at
    // its tallest, and the grid adds 8px of padding above and below it. At 91
    // the floor was the tile without its padding, so the row it guarantees was
    // 16px short of a whole one.
    expect(Number.parseInt(body.style.minHeight, 10)).toBeGreaterThanOrEqual(107);
  });
});
