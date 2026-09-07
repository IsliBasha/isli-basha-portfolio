import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Window } from './Window.jsx';
import { Taskbar } from './Taskbar.jsx';
import { WindowStackProvider } from '../context/WindowStack.jsx';
import { ICONS, PALETTE, TRANSPARENT } from '../lib/pixelIcons/index.js';
import {
  CHIME_MUTE_KEY,
  isChimeMuted,
  setChimeMuted,
} from '../lib/bootChime.js';

const here = dirname(fileURLToPath(import.meta.url));
const taskbarSource = readFileSync(resolve(here, 'Taskbar.jsx'), 'utf8');

// The colours the hand-drawn Start flag mixed for itself, kept here by value
// so the assertion that they are gone names the one that came back.
const RETIRED_FLAG_COLOURS = [
  '#bf1700',
  '#1e7800',
  '#1040c0',
  '#cc9800',
  '#c0b890',
];

function startFlagSvg() {
  const startBtn = screen.getByRole('button', { name: /^start$/i });
  return startBtn.querySelector('svg.win95-start-btn__icon');
}

function Harness() {
  return (
    <WindowStackProvider initialOrder={['about', 'projects']}>
      <Window id="about" title="about.exe">
        <p>about body</p>
      </Window>
      <Window id="projects" title="projects.exe">
        <p>projects body</p>
      </Window>
      <Taskbar />
    </WindowStackProvider>
  );
}

function getTaskbar() {
  return screen.getByRole('navigation', { name: /taskbar/i });
}

describe('Start button Win95 logo', () => {
  it('renders the logo SVG with crispEdges rendering', () => {
    render(<Harness />);
    const startBtn = screen.getByRole('button', { name: /^start$/i });
    const svg = startBtn.querySelector('svg.win95-start-btn__icon');
    expect(svg).toBeInTheDocument();
    // React serialises shapeRendering to shape-rendering in the DOM; jsdom may lower-case it
    const rendering =
      svg.getAttribute('shapeRendering') ??
      svg.getAttribute('shaperendering') ??
      svg.getAttribute('shape-rendering');
    expect(rendering).toBe('crispEdges');
  });

  it('hides the logo from assistive technology', () => {
    render(<Harness />);
    const startBtn = screen.getByRole('button', { name: /^start$/i });
    const svg = startBtn.querySelector('svg.win95-start-btn__icon');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws the registered start-flag map instead of its own geometry', () => {
    render(<Harness />);
    const svg = startFlagSvg();
    const viewBox = svg.getAttribute('viewBox') ?? svg.getAttribute('viewbox');

    expect(viewBox).toBe('0 0 16 16');
    expect(svg.querySelectorAll('polygon')).toHaveLength(0);
    expect(svg.querySelectorAll('rect').length).toBeGreaterThan(0);
    // The drawn size, not the box: win95.css holds the svg in a 16px box so
    // the map lands on whole pixels, and win95.test.js pins that. jsdom
    // computes no CSS, so neither number can be read off the element here.
    expect(svg.getAttribute('width')).toBe('16');
  });

  // Colour-set equality rather than a spot check on four fills: an id typo
  // falls back to generic-exe, which still paints palette colours and still
  // fills the button with something flag-shaped enough to pass a rect count.
  it('paints the four boot-splash panes, in the icon palette', () => {
    render(<Harness />);
    const fills = new Set(
      Array.from(startFlagSvg().querySelectorAll('rect')).map((rect) =>
        rect.getAttribute('fill'),
      ),
    );
    const mapColours = new Set(
      [...ICONS['start-flag'].join('')]
        .filter((ch) => ch !== TRANSPARENT)
        .map((ch) => PALETTE[ch]),
    );

    expect(fills).toEqual(mapColours);
    for (const pane of [PALETTE.r, PALETTE.l, PALETTE.b, PALETTE.y]) {
      expect(fills, `${pane} pane is missing`).toContain(pane);
    }
    expect(fills, 'the outline is missing').toContain(PALETTE.k);
  });

  // The assertion above builds its expectation out of the map, so a map
  // scrambled into a blob still matches itself and still ships green. These
  // two rows are the silhouette: the corner the wave starts from, and a
  // mid-band row carrying the black cross between the panes and the dark twin
  // a pixel in from each pane's left edge.
  it('keeps the wave silhouette the boot flag was folded into', () => {
    const flag = ICONS['start-flag'];
    expect(flag[0], 'the top-right corner of the wave moved').toBe(
      '............kkkk',
    );
    expect(flag[9], 'the pane cross or a dark-twin fold moved').toBe(
      'kbBbbbbkyYyyyyyk',
    );
  });

  // The flag was the last colour this component mixed by hand, and an
  // off-palette one here is the one that would not match the boot splash.
  // Named CSS colours ("red", "silver") are deliberately not guarded: a name
  // list long enough to be worth having also fires on ordinary prose in the
  // JSX and its comments, so those are left to review.
  it('leaves no hand-mixed colour behind in the taskbar source', () => {
    const PALETTE_RULE =
      'Taskbar.jsx takes colour from the palette, not literals';
    for (const colour of RETIRED_FLAG_COLOURS) {
      expect(taskbarSource, `${colour} is still in Taskbar.jsx`).not.toContain(
        colour,
      );
    }
    const literal = taskbarSource.match(
      /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\bcolor-mix\(/i,
    );
    expect(literal, `${PALETTE_RULE} — found ${literal?.[0]}`).toBeNull();
    expect(taskbarSource, PALETTE_RULE).not.toContain('rgba(');
  });
});

describe('Taskbar always-on tasks', () => {
  it('renders a task button for every open window on initial mount', () => {
    render(<Harness />);
    const taskbar = getTaskbar();
    expect(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    ).toBeInTheDocument();
    expect(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    ).toBeInTheDocument();
  });

  it('keeps the task button after the window is minimized', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole('button', { name: /minimize about\.exe/i }),
    );

    const taskbar = getTaskbar();
    expect(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    ).toBeInTheDocument();
  });

  it('minimizes a visible window when its active taskbar button is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    // projects is on top because it is last in initialOrder
    expect(screen.getByText('projects body')).toBeInTheDocument();

    const taskbar = getTaskbar();
    await user.click(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    );

    expect(screen.queryByText('projects body')).not.toBeInTheDocument();
  });

  it('restores the window when its taskbar button is clicked while minimized', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText('about body')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /minimize about\.exe/i }),
    );
    expect(screen.queryByText('about body')).not.toBeInTheDocument();

    const taskbar = getTaskbar();
    await user.click(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    );

    expect(screen.getByText('about body')).toBeInTheDocument();
  });

  it('reopens a closed window when its start-menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole('button', { name: /close about\.exe/i }),
    );
    expect(screen.queryByText('about body')).not.toBeInTheDocument();

    // about.txt moved under Documents when the menu grew its real Win95 tree.
    await user.click(screen.getByRole('button', { name: /^start$/i }));
    await user.click(screen.getByRole('menuitem', { name: /^documents$/i }));
    await user.click(screen.getByRole('menuitem', { name: /^about\.txt$/i }));

    expect(screen.getByText('about body')).toBeInTheDocument();
  });

  it('does not add a task button when a window is closed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText('about body')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /close about\.exe/i }),
    );

    expect(screen.queryByText('about body')).not.toBeInTheDocument();
    const taskbar = getTaskbar();
    expect(
      within(taskbar).queryByRole('button', { name: /about\.exe/i }),
    ).not.toBeInTheDocument();
  });

  it('shows a button per minimized window and can restore each independently', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole('button', { name: /minimize about\.exe/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /minimize projects\.exe/i }),
    );

    const taskbar = getTaskbar();
    expect(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    ).toBeInTheDocument();
    expect(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    ).toBeInTheDocument();

    await user.click(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    );

    expect(screen.getByText('projects body')).toBeInTheDocument();
    expect(screen.queryByText('about body')).not.toBeInTheDocument();
  });
});

describe('System tray', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CHIME_MUTE_KEY);
    // A refused write leaves the preference in memory for the session; a
    // successful one clears it again, so this undoes the storage-failure test.
    setChimeMuted(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('holds the boot-sound toggle and the clock in one well', () => {
    render(<Harness />);
    const taskbar = getTaskbar();
    const speaker = within(taskbar).getByRole('button', { name: /^boot sound:/i });
    const tray = speaker.closest('.win95-tray');

    expect(tray).not.toBeNull();
    expect(tray).toHaveTextContent(/^\d{2}:\d{2}$/);
  });

  it('starts audible, because nothing has been switched off yet', () => {
    render(<Harness />);
    const speaker = screen.getByRole('button', { name: 'Boot sound: on' });
    expect(speaker).toHaveAttribute('aria-pressed', 'true');
  });

  it('persists the mute so the next visit stays quiet', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Boot sound: on' }));

    const speaker = screen.getByRole('button', { name: 'Boot sound: off' });
    expect(speaker).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem(CHIME_MUTE_KEY)).toBe('1');
    // The chime reads the same key, so the toggle actually silences it.
    expect(isChimeMuted()).toBe(true);
  });

  it('unmutes by clearing the key rather than storing a second value', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Boot sound: on' }));
    await user.click(screen.getByRole('button', { name: 'Boot sound: off' }));

    expect(screen.getByRole('button', { name: 'Boot sound: on' })).toBeInTheDocument();
    expect(window.localStorage.getItem(CHIME_MUTE_KEY)).toBeNull();
  });

  it('opens muted when the key was already set before the page loaded', () => {
    window.localStorage.setItem(CHIME_MUTE_KEY, '1');
    render(<Harness />);

    expect(screen.getByRole('button', { name: 'Boot sound: off' })).toBeInTheDocument();
  });

  it('follows the preference when something else writes it', async () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Boot sound: on' })).toBeInTheDocument();

    // Display Properties writes this key too. A tray holding its own copy in
    // state would keep showing the speaker it was rendered with until the
    // page reloaded.
    await act(async () => {
      setChimeMuted(true);
    });

    expect(screen.getByRole('button', { name: 'Boot sound: off' })).toBeInTheDocument();
    expect(isChimeMuted()).toBe(true);
  });

  it('still flips the speaker when storage refuses to remember the choice', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Boot sound: on' }));

    // Private mode costs the visitor the preference at the next visit. It must
    // not also cost them the button: the tray's snapshot is isChimeMuted(),
    // so a click that never reached storage still has to change the speaker.
    expect(screen.getByRole('button', { name: 'Boot sound: off' })).toBeInTheDocument();
    expect(window.localStorage.getItem(CHIME_MUTE_KEY)).toBeNull();
    expect(isChimeMuted()).toBe(true);
  });

  it('follows the preference when another tab changes it', async () => {
    window.localStorage.setItem(CHIME_MUTE_KEY, '1');
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Boot sound: off' })).toBeInTheDocument();

    await act(async () => {
      window.localStorage.removeItem(CHIME_MUTE_KEY);
      window.dispatchEvent(
        new StorageEvent('storage', { key: CHIME_MUTE_KEY, newValue: null }),
      );
    });

    expect(screen.getByRole('button', { name: 'Boot sound: on' })).toBeInTheDocument();
  });
});
