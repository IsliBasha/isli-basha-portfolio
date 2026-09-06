import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Window } from './Window.jsx';
import { Taskbar } from './Taskbar.jsx';
import { MyWorkExplorer } from './MyWorkExplorer.jsx';
import { WindowStackProvider } from '../context/WindowStack.jsx';
import { __TEST__ as POSITIONS } from '../hooks/useWindowPosition.js';

// Read the desktop's own window list rather than restating it. If DesktopApp
// gains a window and the Start menu does not, the coverage assertion below is
// what says so.
const DESKTOP_SOURCE = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '..', 'DesktopApp.jsx'),
  'utf8',
);
const WINDOW_ORDER = (() => {
  const block = DESKTOP_SOURCE.match(/const WINDOW_ORDER = \[([^\]]*)\]/);
  if (!block) throw new Error('WINDOW_ORDER is no longer a literal array in DesktopApp.jsx');
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
})();

// Display Properties reached WINDOW_ORDER with its own order. The menu has to
// be able to reach it either way, so name it here and fold it in rather than
// assuming which side of that landing we are on.
const DISPLAY_ID = 'display';
const ALL_IDS = [...new Set([...WINDOW_ORDER, DISPLAY_ID])];

// Every leaf that opens a window, with the clicks that get to it.
const LAUNCHERS = [
  { path: ['Programs', 'Accessories', 'Notepad'], id: 'about' },
  { path: ['Programs', 'Accessories', 'MS-DOS Prompt'], id: 'stack' },
  { path: ['Programs', 'Accessories', 'SiteCounter.exe'], id: 'stats' },
  { path: ['Programs', 'Games', 'minesweeper.exe'], id: 'minesweeper' },
  { path: ['Programs', 'Games', 'snake.exe'], id: 'snake' },
  { path: ['Programs', 'contact.exe'], id: 'contact' },
  { path: ['Programs', 'my work'], id: 'mywork' },
  { path: ['Documents', 'about.txt'], id: 'about' },
  { path: ['Documents', 'resume.pdf'], id: 'resume' },
  { path: ['Settings', 'Display Properties…'], id: DISPLAY_ID },
];

function Desktop({ ids = ALL_IDS, open = [], reload }) {
  return (
    <WindowStackProvider
      initialOrder={ids}
      initialClosed={ids.filter((id) => !open.includes(id))}
    >
      {ids.map((id) => (
        <Window key={id} id={id} title={`${id}.win`}>
          <p>{id} body</p>
        </Window>
      ))}
      <Taskbar reload={reload} />
    </WindowStackProvider>
  );
}

// The explorer for real, because Find… is only worth anything if the cursor
// lands in the field the visitor is about to type into.
function ExplorerDesktop() {
  return (
    <WindowStackProvider initialOrder={['mywork']} initialClosed={['mywork']}>
      <Window id="mywork" title="my work">
        <MyWorkExplorer />
      </Window>
      <Taskbar />
    </WindowStackProvider>
  );
}

// Launching a window defers its focus by a frame: bringToFront is a state
// update, and the window it un-closes is not in the DOM until React commits.
// Wrapped in act because landing on the window fires its onFocus, which calls
// bringToFront again.
async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
}

const startButton = () => screen.getByRole('button', { name: /^start$/i });
const rootMenu = () => screen.getByRole('menu', { name: 'Start menu' });

async function walk(user, path) {
  await user.click(startButton());
  for (const label of path) {
    await user.click(screen.getByRole('menuitem', { name: label }));
  }
}

describe('Start menu tree', () => {
  it('lists the top level Windows 95 shipped, in order', () => {
    render(<Desktop />);
    // Not rendered until the menu is opened.
    expect(screen.queryByRole('menu', { name: 'Start menu' })).not.toBeInTheDocument();
  });

  it('renders the seven top-level entries with their Win95 labels', async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    await user.click(startButton());

    const labels = within(rootMenu())
      .getAllByRole('menuitem')
      .map((item) => item.textContent.replace('▸', '').trim());

    expect(labels).toEqual([
      'Programs',
      'Documents',
      'Settings',
      'Find…',
      'Help',
      'Run…',
      'Shut Down…',
    ]);
  });

  it('marks the three group entries as submenu parents', async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    await user.click(startButton());

    for (const label of ['Programs', 'Documents', 'Settings']) {
      const item = screen.getByRole('menuitem', { name: label });
      expect(item, label).toHaveAttribute('aria-haspopup', 'menu');
      expect(item, label).toHaveAttribute('aria-expanded', 'false');
    }
    expect(screen.getByRole('menuitem', { name: 'Help' })).not.toHaveAttribute(
      'aria-haspopup',
    );
  });

  // Walks all ten launchers -- the desktop's whole window list -- through a
  // real menu each time, which is more work than vitest's 5s default allows
  // for once the suite is running files in parallel.
  it('reaches every window the desktop can show, plus Display Properties', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    // The table above must cover the desktop's whole window list. This is the
    // assertion that fails when DesktopApp gains a window nothing launches.
    expect(new Set(LAUNCHERS.map((entry) => entry.id))).toEqual(new Set(ALL_IDS));

    for (const { path, id } of LAUNCHERS) {
      await walk(user, path);
      expect(screen.getByText(`${id} body`), `${path.join(' > ')} did not open ${id}`)
        .toBeInTheDocument();
    }
  }, 20_000);

  it('opens a fly-out on the parent it belongs to, not on its sibling', async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    await user.click(startButton());
    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));

    const programs = screen.getByRole('menuitem', { name: 'Programs' });
    expect(programs).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Documents' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('menu', { name: 'Programs' })).toBeInTheDocument();
    expect(programs.closest('li')).toContainElement(
      screen.getByRole('menu', { name: 'Programs' }),
    );
  });
});

describe('Start menu keyboard navigation', () => {
  it('walks two fly-outs deep and launches snake.exe', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName('Programs');

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAccessibleName('Accessories');

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName('Games');

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAccessibleName('minesweeper.exe');

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName('snake.exe');

    await user.keyboard('{Enter}');
    expect(screen.getByText('snake body')).toBeInTheDocument();
    expect(screen.queryByRole('menu', { name: 'Start menu' })).not.toBeInTheDocument();
  });

  it('wraps from the last entry to the first', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toHaveAccessibleName('Shut Down…');

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveAccessibleName('Programs');
  });

  it('steps over the separator instead of landing on it', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement).toHaveAccessibleName('Run…');
  });

  it('closes one level per Escape and hands focus back to Start', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('menu', { name: 'Programs' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'Programs' })).not.toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName('Programs');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'Start menu' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(startButton());
  });

  it('closes a fly-out with ArrowLeft but leaves the root menu standing', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowLeft}');

    expect(screen.queryByRole('menu', { name: 'Programs' })).not.toBeInTheDocument();
    expect(screen.getByRole('menu', { name: 'Start menu' })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName('Programs');
  });
});

describe('Start menu accessibility', () => {
  it('names every item and puts no control inside another', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));
    await user.click(screen.getByRole('menuitem', { name: 'Games' }));

    const items = screen.getAllByRole('menuitem');
    // Root 7 + Programs 4 + Games 2.
    expect(items).toHaveLength(13);
    for (const item of items) {
      expect(item, `unnamed item: ${item.outerHTML.slice(0, 80)}`).toHaveAccessibleName();
      expect(
        item.querySelector('button, a[href], input, select, textarea'),
        `${item.textContent} nests a control`,
      ).toBeNull();
    }
  });

  it('opens a fly-out on hover once the pointer has settled', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.hover(screen.getByRole('menuitem', { name: 'Documents' }));

    expect(screen.queryByRole('menu', { name: 'Documents' })).not.toBeInTheDocument();
    await screen.findByRole('menu', { name: 'Documents' });
  });
});

describe('Start menu fly-out placement', () => {
  // The panel is placed by CSS at the parent row's top-right corner. The only
  // scripted part is the correction that keeps it on screen, and it is applied
  // as a translate so nothing behind it reflows.
  //
  // jsdom measures every box as 0x0, and a zero-sized box is not "a fly-out
  // that fits" -- it is a box whose top is already above the viewport margin.
  // Every case here stages a rect that could exist.
  function stageRect({ top, height, right }) {
    return vi
      .spyOn(HTMLUListElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        x: 0,
        y: top,
        top,
        left: right - 168,
        width: 168,
        height,
        right,
        bottom: top + height,
        toJSON: () => ({}),
      });
  }

  async function openPrograms(user, rect) {
    render(<Desktop />);
    await user.click(startButton());
    const measured = stageRect(rect);
    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));
    const flyout = screen.getByRole('menu', { name: 'Programs' });
    measured.mockRestore();
    return flyout;
  }

  it('leaves a fly-out that already fits alone', async () => {
    const user = userEvent.setup();
    const flyout = await openPrograms(user, { top: 400, height: 134, right: 372 });

    expect(flyout.style.transform).toBe('none');
  });

  it('nudges one that would hang past the right edge or under the taskbar', async () => {
    const user = userEvent.setup();
    const flyout = await openPrograms(user, {
      top: window.innerHeight - 124,
      height: 134,
      right: window.innerWidth + 40,
    });

    // 4px of viewport margin on the right; 34px of taskbar plus that margin
    // at the bottom.
    expect(flyout.style.transform).toBe('translate(-44px, -48px)');
  });

  it('caps only the panels no fly-out hangs off', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.click(screen.getByRole('menuitem', { name: 'Programs' }));
    await user.click(screen.getByRole('menuitem', { name: 'Games' }));

    const CAPPED = 'win95-start-menu__panel--scrolls';
    // The cap is `max-height` plus `overflow-y: auto`, and overflow-y computes
    // overflow-x to auto with it. A fly-out sits entirely outside its parent's
    // box, so capping a parent does not scroll the child -- it deletes it from
    // the page, unclickable and invisible.
    expect(screen.getByRole('menu', { name: 'Start menu' })).not.toHaveClass(CAPPED);
    expect(screen.getByRole('menu', { name: 'Programs' })).not.toHaveClass(CAPPED);
    expect(screen.getByRole('menu', { name: 'Games' })).toHaveClass(CAPPED);

    for (const menu of screen.getAllByRole('menu')) {
      if (!menu.classList.contains(CAPPED)) continue;
      expect(
        menu.querySelector('[role="menu"]'),
        `${menu.getAttribute('aria-label')} would clip its own fly-out`,
      ).toBeNull();
    }
  });

  it('refuses to drag a fly-out taller than the screen off the top of it', async () => {
    const user = userEvent.setup();
    // 900px of menu in a 768px viewport. Correcting the bottom overflow alone
    // would put the first item at -170px, where nothing can reach it.
    const flyout = await openPrograms(user, { top: 20, height: 900, right: 372 });

    // Stops at the 4px margin, 16px up: the fly-out's own max-height scrolls
    // the rest.
    expect(flyout.style.transform).toBe('translate(0px, -16px)');
  });
});

describe('Start menu items that name no window', () => {
  // A desktop built without the display window, which is what every desktop
  // looked like before Display Properties landed and what any future item
  // pointing at an unbuilt window will look like again.
  it('does nothing when the desktop renders no window behind the item', async () => {
    const user = userEvent.setup();
    const ids = WINDOW_ORDER.filter((id) => id !== DISPLAY_ID);
    render(<Desktop ids={ids} open={['about']} />);

    const taskbar = screen.getByRole('navigation', { name: /taskbar/i });
    const before = within(taskbar).getAllByRole('button').length;

    await walk(user, ['Settings', 'Display Properties…']);

    expect(screen.getByText('about body')).toBeInTheDocument();
    expect(within(taskbar).getAllByRole('button')).toHaveLength(before);
    expect(screen.queryByText('display body')).not.toBeInTheDocument();
  });
});

describe('Start menu focus after a launch', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Every window on this desktop except the visitor counter starts closed, so
  // the launch that has to work is the one where nothing is mounted yet.
  it('puts focus in the window it just opened from closed', async () => {
    // jsdom implements requestAnimationFrame as a ~16ms timer, so real time
    // spent inside the awaited clicks can let the frame fire before the
    // assertion that it has not. Faking rAF alone makes the frame a step this
    // test takes on purpose; userEvent keeps real timers for its own waits.
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const user = userEvent.setup();
    render(<Desktop />);

    await walk(user, ['Programs', 'Games', 'snake.exe']);
    expect(document.activeElement).toBe(document.body);

    // In act because landing on the window fires its onFocus, which calls
    // bringToFront -- the same reason nextFrame() wraps its own frame.
    await act(async () => {
      vi.advanceTimersToNextFrame();
    });

    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'snake.win' }),
    );
  });

  it('puts the cursor in the search box when Find… opens the explorer', async () => {
    const user = userEvent.setup();
    render(<ExplorerDesktop />);

    await walk(user, ['Find…']);
    await nextFrame();

    expect(document.activeElement).toBe(
      screen.getByLabelText('Search projects by name or technology'),
    );
  });
});

describe('Start menu focus when a dialog closes', () => {
  // The menu unmounts and the dialog mounts in one commit, so there is no
  // "previously focused element" left to restore -- the browser has already
  // dropped focus on <body>. The Start button is where the trip began.
  it('hands focus back to Start after Escape from Run', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await walk(user, ['Run…']);
    expect(screen.getByRole('dialog', { name: 'Run' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Run' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(startButton());
  });

  it('hands focus back to Start after No on Shut Down', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await walk(user, ['Shut Down…']);
    expect(
      screen.getByRole('dialog', { name: 'Shut Down Windows' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(screen.queryByRole('dialog', { name: 'Shut Down Windows' })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(startButton());
  });
});

describe('Start menu hover and focus together', () => {
  it('carries focus onto the row the pointer arrives at', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await user.click(startButton());
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(document.activeElement).toHaveAccessibleName('Accessories');

    // Sweeping onto a sibling closes the fly-out that focus was inside. If
    // hover did not take focus with it, the unmount would drop focus on
    // <body> and leave the menu on screen with no way back into it.
    await user.hover(screen.getByRole('menuitem', { name: 'Documents' }));
    expect(document.activeElement).toHaveAccessibleName('Documents');

    await screen.findByRole('menu', { name: 'Documents' });
    expect(screen.queryByRole('menu', { name: 'Programs' })).not.toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName('Documents');
  });

  it('drops the hover intent when the pointer leaves before it fires', async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    await user.click(startButton());

    const documents = screen.getByRole('menuitem', { name: 'Documents' });
    await user.hover(documents);
    await user.unhover(documents);

    // Hovering something else would clear the intent whatever this test is
    // about -- there is one shared timer -- so the sweep has to end outside
    // the menu, exactly as it does on the way to the clock. Real time, twice
    // HOVER_INTENT_MS (150ms in StartMenu.jsx), because the assertion is that
    // nothing happens.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    expect(screen.queryByRole('menu', { name: 'Documents' })).not.toBeInTheDocument();
  });
});

describe('Start menu entries that are not windows', () => {
  afterEach(() => {
    window.localStorage.removeItem(POSITIONS.STORAGE_KEY);
  });

  it('opens Help on the About box', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await walk(user, ['Help']);

    const about = screen.getByRole('alertdialog', { name: 'About sys95' });
    expect(about).toHaveTextContent('sys95 version 4.00.950');
    expect(about).toHaveTextContent('Fast, minimal, useful things.');
  });

  it('opens the Run box on Run…', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await walk(user, ['Run…']);

    expect(screen.getByRole('dialog', { name: 'Run' })).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByLabelText('Open:'));
  });

  it('opens Shut Down Windows on Shut Down…', async () => {
    const user = userEvent.setup();
    render(<Desktop />);

    await walk(user, ['Shut Down…']);

    expect(
      screen.getByRole('dialog', { name: 'Shut Down Windows' }),
    ).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Yes' }));
  });

  it('forgets every dragged window position on Reset desktop, then reloads', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    window.localStorage.setItem(
      POSITIONS.STORAGE_KEY,
      JSON.stringify({ about: { x: 120, y: 80 } }),
    );
    render(<Desktop reload={reload} />);

    await walk(user, ['Settings', 'Reset desktop']);

    expect(window.localStorage.getItem(POSITIONS.STORAGE_KEY)).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
