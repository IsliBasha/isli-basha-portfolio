import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Snake } from './Snake.jsx';

describe('Snake component', () => {
  it('renders a focusable board and a score of 0', () => {
    render(<Snake />);
    expect(screen.getByLabelText(/score/i)).toHaveTextContent('Score: 0');
    const board = screen.getByRole('application', { name: /snake board/i });
    expect(board).toHaveAttribute('tabindex', '0');
  });

  it('shows a Start button when paused', () => {
    render(<Snake />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('shows the keyboard hint', () => {
    render(<Snake />);
    expect(screen.getByText(/arrow keys/i)).toBeInTheDocument();
  });

  it('resets score when Reset is clicked', async () => {
    const user = userEvent.setup();
    render(<Snake />);
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText(/score/i)).toHaveTextContent('Score: 0');
  });
});

describe('Snake board cells', () => {
  it('marks exactly one head cell and one food cell', () => {
    const { container } = render(<Snake />);

    expect(container.querySelectorAll('.snake-cell--head')).toHaveLength(1);
    expect(container.querySelectorAll('.snake-cell--food')).toHaveLength(1);
  });

  // Both used to be inline-free but CSS-decorated: the food was a 50% radius
  // dot and the head carried a 4px glow, the only blurred shadow in the whole
  // desktop. Nothing here should carry its own paint.
  it('leaves the appearance of every cell to the stylesheet', () => {
    const { container } = render(<Snake />);
    const cells = [...container.querySelectorAll('.snake-cell')];

    expect(cells.length).toBe(20 * 15);
    expect(cells.every((cell) => cell.getAttribute('style') === null)).toBe(true);
  });
});
