import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Minesweeper } from './Minesweeper.jsx';
import { createBoard } from '../lib/minesweeper.js';
import { ICONS, PALETTE, TRANSPARENT, ICON_SIZE } from '../lib/pixelIcons/index.js';

// Mine placement runs off Math.random, which makes "the face after a loss" a
// coin flip and "the timer stops at the end" depend on whether the first click
// happened to clear the grid. Every createBoard call below runs off the same
// seeded generator instead, so the same click lands on the same mine on every
// run — the game logic itself is untouched.
const COLS = 9;

vi.mock('../lib/minesweeper.js', async (importOriginal) => {
  const actual = await importOriginal();
  // mulberry32, inlined because vi.mock is hoisted above every other binding
  // in this file.
  const seeded = () => {
    let a = 1;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  return {
    ...actual,
    createBoard: (options) => actual.createBoard({ ...options, rng: seeded() }),
  };
});

/**
 * Which flat cell indices hold a mine for a first click on cell 0. Derived by
 * asking the same seeded createBoard the component uses rather than pasted in
 * as coordinates, so a change to the placement loop moves both together.
 */
function minedIndices() {
  const board = createBoard({
    rows: 9,
    cols: COLS,
    mines: 10,
    safeStart: { row: 0, col: 0 },
  });
  const mined = new Set();
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) mined.add(cell.row * COLS + cell.col);
    }
  }
  return mined;
}

/**
 * Rebuild the 16x16 map an <svg> painted, so a face assertion is about the
 * pixels on screen and not about a class name that could be attached to the
 * wrong drawing. Local rather than shared for the same reason the explorer's
 * copy is: one change should not quietly rewrite two sets of expectations.
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

function faceMap() {
  return repaint(screen.getByRole('button', { name: /new game/i }).querySelector('svg'));
}

function cells() {
  const grid = screen.getByRole('grid', { name: /minesweeper board/i });
  return within(grid).getAllByRole('gridcell');
}

function readout(name) {
  return screen.getByLabelText(name).querySelector('.seven-seg__value').textContent;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Minesweeper component', () => {
  it('renders a 9x9 grid of cell buttons with a fresh board', () => {
    render(<Minesweeper />);
    const grid = screen.getByRole('grid', { name: /minesweeper board/i });
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(81);
  });

  it('shows initial mines remaining count', () => {
    render(<Minesweeper />);
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('010');
  });

  it('reveals a cell on left click', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    await user.click(cells()[0]);

    expect(
      cells().filter((c) => c.getAttribute('data-revealed') === 'true').length,
    ).toBeGreaterThan(0);
  });

  it('flags a cell on context menu', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    await user.pointer({ keys: '[MouseRight]', target: cells()[0] });

    expect(cells()[0].getAttribute('data-flagged')).toBe('true');
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('009');
  });

  it('resets the board when the smiley face is clicked', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    await user.click(cells()[0]);
    await user.click(screen.getByRole('button', { name: /new game/i }));

    expect(
      cells().filter((c) => c.getAttribute('data-revealed') === 'true'),
    ).toHaveLength(0);
  });
});

describe('Minesweeper counters', () => {
  it('renders the mine counter as three seven-segment digit cells', () => {
    render(<Minesweeper />);
    const digits = [
      ...screen.getByLabelText(/mines remaining/i).querySelectorAll('g[data-digit]'),
    ];

    expect(digits.map((g) => g.getAttribute('data-digit'))).toEqual(['0', '1', '0']);
  });

  it('renders the counters as painted segments, not as a seven-segment font', () => {
    const { container } = render(<Minesweeper />);
    // 2 counters x 3 digits x 7 strokes.
    expect(container.querySelectorAll('rect[data-seg]')).toHaveLength(42);
  });

  // A span carrying nothing but an aria-label is exposed as nothing at all,
  // so neither counter had a name for a screen reader to read.
  it('exposes both counters as named groups', () => {
    render(<Minesweeper />);

    expect(screen.getByRole('group', { name: /mines remaining/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /timer/i })).toBeInTheDocument();
  });

  // Clamping at zero made an over-flagged board look like a solved one. The
  // real counter went negative, and the display already draws the minus.
  it('counts below zero once more flags are down than there are mines', () => {
    render(<Minesweeper />);

    // fireEvent for the eleven flags: userEvent walks a full pointer sequence
    // and awaits its own timers between the steps, which is eleven times the
    // work for an event the component handles in one place.
    for (let i = 0; i < 11; i += 1) {
      fireEvent.contextMenu(cells()[i]);
    }

    expect(readout(/mines remaining/i)).toBe('-01');
  });

  it('leaves the timer at zero until the first cell is revealed', () => {
    vi.useFakeTimers();
    render(<Minesweeper />);

    act(() => vi.advanceTimersByTime(5000));

    expect(readout(/timer/i)).toBe('000');
  });

  // These four drive the board with fireEvent rather than userEvent: userEvent
  // awaits its own timers between key and pointer steps, and under
  // vi.useFakeTimers() that wait never resolves — the test hangs instead of
  // failing. A click is one event here, so nothing is lost by dispatching it
  // directly.
  it('counts the timer up once the first cell is revealed', () => {
    vi.useFakeTimers();
    render(<Minesweeper />);

    fireEvent.click(cells()[0]);
    act(() => vi.advanceTimersByTime(3000));

    expect(readout(/timer/i)).toBe('003');
  });

  it('freezes the timer once the game is over', () => {
    vi.useFakeTimers();
    render(<Minesweeper />);
    const [firstMine] = [...minedIndices()];

    fireEvent.click(cells()[0]);
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.click(cells()[firstMine]);
    act(() => vi.advanceTimersByTime(9000));

    expect(screen.getByRole('status')).toHaveTextContent(/boom/i);
    expect(readout(/timer/i)).toBe('002');
  });

  // The loss path had a test; the win path is the one a player reaches by
  // playing well, and it runs through a different status transition.
  it('freezes the timer on a win as well as a loss', () => {
    vi.useFakeTimers();
    render(<Minesweeper />);
    const mined = minedIndices();

    fireEvent.click(cells()[0]);
    act(() => vi.advanceTimersByTime(2000));
    cells().forEach((cell, index) => {
      if (mined.has(index)) return;
      fireEvent.click(cell);
    });
    act(() => vi.advanceTimersByTime(9000));

    expect(screen.getByRole('status')).toHaveTextContent(/cleared/i);
    expect(readout(/timer/i)).toBe('002');
  });

  it('puts the timer back to zero on a new game', () => {
    vi.useFakeTimers();
    render(<Minesweeper />);

    fireEvent.click(cells()[0]);
    act(() => vi.advanceTimersByTime(4000));
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));

    expect(readout(/timer/i)).toBe('000');
    act(() => vi.advanceTimersByTime(4000));
    expect(readout(/timer/i)).toBe('000');
  });

  it('stops the timer at 999 rather than growing a fourth digit', () => {
    vi.useFakeTimers();
    render(<Minesweeper />);

    fireEvent.click(cells()[0]);
    act(() => vi.advanceTimersByTime(1_200_000));

    expect(readout(/timer/i)).toBe('999');
  });
});

describe('Minesweeper faces', () => {
  it('rests on the idle face before anything is clicked', () => {
    render(<Minesweeper />);
    expect(faceMap()).toEqual(ICONS['face-idle']);
  });

  it('pulls the "oh" face while a cell is held down and drops it on release', () => {
    render(<Minesweeper />);
    const cell = cells()[0];

    fireEvent.mouseDown(cell);
    expect(faceMap()).toEqual(ICONS['face-o']);

    fireEvent.mouseUp(cell);
    expect(faceMap()).toEqual(ICONS['face-idle']);
  });

  // Alt-Tab with the pointer still down: the mouseup lands in whatever took
  // the focus, so this window never hears it and the face kept its mouth open
  // until the next click on the board.
  it('drops the "oh" face when the tab loses focus mid-press', () => {
    render(<Minesweeper />);

    fireEvent.mouseDown(cells()[0]);
    expect(faceMap()).toEqual(ICONS['face-o']);

    fireEvent.blur(window);

    expect(faceMap()).toEqual(ICONS['face-idle']);
  });

  // Right-dragging plants a flag. The face has no opinion about that, and the
  // native context menu eats the mouseup that would have ended the press, so
  // pulling the "oh" face on a right press left it stuck there.
  it('leaves the face idle on a right press', () => {
    render(<Minesweeper />);

    fireEvent.mouseDown(cells()[0], { button: 2 });

    expect(faceMap()).toEqual(ICONS['face-idle']);
  });

  it('swallows the context menu on the board itself, gaps and padding included', () => {
    render(<Minesweeper />);
    const board = screen.getByRole('grid', { name: /minesweeper board/i });

    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.contextMenu(board)).toBe(false);
  });

  // A press that ends off the board would otherwise leave the face stuck.
  it('drops the "oh" face when the pointer leaves the board still held', () => {
    render(<Minesweeper />);
    const board = screen.getByRole('grid', { name: /minesweeper board/i });

    fireEvent.mouseDown(cells()[0]);
    fireEvent.mouseLeave(board);

    expect(faceMap()).toEqual(ICONS['face-idle']);
  });

  it('wears the dead face after a mine is revealed', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    const [firstMine] = [...minedIndices()];

    await user.click(cells()[0]);
    await user.click(cells()[firstMine]);

    expect(screen.getByRole('status')).toHaveTextContent(/boom/i);
    expect(faceMap()).toEqual(ICONS['face-dead']);
  });

  it('wears the sunglasses once every safe cell is revealed', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    await user.click(cells()[0]);

    const mined = minedIndices();
    cells().forEach((cell, index) => {
      if (mined.has(index)) return;
      fireEvent.click(cell);
    });

    expect(screen.getByRole('status')).toHaveTextContent(/cleared/i);
    expect(faceMap()).toEqual(ICONS['face-win']);
  });
});

describe('Minesweeper cell glyphs', () => {
  it('plants a pixel flag rather than a text character', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    await user.pointer({ keys: '[MouseRight]', target: cells()[0] });

    const flag = cells()[0].querySelector('svg');
    expect(flag).not.toBeNull();
    expect(repaint(flag)).toEqual(ICONS['ms-flag']);
    expect(cells()[0].textContent).toBe('');
  });

  it('draws a pixel mine in the cell that ended the game', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    const [firstMine] = [...minedIndices()];

    await user.click(cells()[0]);
    await user.click(cells()[firstMine]);

    expect(repaint(cells()[firstMine].querySelector('svg'))).toEqual(ICONS['ms-mine']);
  });
});

describe('Minesweeper menu bar', () => {
  it('starts a new game from the Game menu', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    await user.click(cells()[0]);
    expect(
      cells().filter((c) => c.getAttribute('data-revealed') === 'true').length,
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole('menuitem', { name: 'Game' }));

    expect(
      cells().filter((c) => c.getAttribute('data-revealed') === 'true'),
    ).toHaveLength(0);
  });

  it('explains the controls from the Help menu and closes again', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Help' }));

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent(/left-click to reveal, right-click to flag/i);

    await user.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
