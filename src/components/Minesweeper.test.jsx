import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Minesweeper } from './Minesweeper.jsx';

describe('Minesweeper component', () => {
  it('renders a 9x9 grid of cell buttons with a fresh board', () => {
    render(<Minesweeper />);
    const grid = screen.getByRole('grid', { name: /minesweeper board/i });
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells).toHaveLength(81);
  });

  it('shows initial mines remaining count', () => {
    render(<Minesweeper />);
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('010');
  });

  it('reveals a cell on left click', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    const grid = screen.getByRole('grid', { name: /minesweeper board/i });
    const cells = within(grid).getAllByRole('gridcell');

    await user.click(cells[0]);

    const revealed = cells.filter(
      (c) => c.getAttribute('data-revealed') === 'true',
    );
    expect(revealed.length).toBeGreaterThan(0);
  });

  it('flags a cell on context menu', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    const grid = screen.getByRole('grid', { name: /minesweeper board/i });
    const cells = within(grid).getAllByRole('gridcell');

    await user.pointer({ keys: '[MouseRight]', target: cells[0] });

    expect(cells[0].getAttribute('data-flagged')).toBe('true');
    expect(screen.getByLabelText(/mines remaining/i)).toHaveTextContent('009');
  });

  it('resets the board when the smiley face is clicked', async () => {
    const user = userEvent.setup();
    render(<Minesweeper />);
    const grid = screen.getByRole('grid', { name: /minesweeper board/i });
    const cellsBefore = within(grid).getAllByRole('gridcell');
    await user.click(cellsBefore[0]);

    const reset = screen.getByRole('button', { name: /new game/i });
    await user.click(reset);

    const cellsAfter = within(grid).getAllByRole('gridcell');
    const revealedAfter = cellsAfter.filter(
      (c) => c.getAttribute('data-revealed') === 'true',
    );
    expect(revealedAfter).toHaveLength(0);
  });
});
