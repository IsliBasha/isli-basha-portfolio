import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnakeII } from './SnakeII.jsx';

function setup() {
  const onBack = vi.fn();
  render(<SnakeII onBack={onBack} />);
  return { onBack };
}

describe('SnakeII', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the grid with an initial score of 0', () => {
    setup();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('calls onBack when Quit is pressed', async () => {
    const user = userEvent.setup();
    const { onBack } = setup();
    await user.click(screen.getByRole('button', { name: /quit/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('starts the game and switches Go to Pause on an arrow key', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByRole('button', { name: /^go$/i })).toBeInTheDocument();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('starts the game from an on-screen d-pad button', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /^left$/i }));
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('shows a game-over banner with Retry once the snake dies', () => {
    vi.useFakeTimers();
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
    // 16-wide grid, snake starts near center moving right: this many ticks
    // guarantees a wall hit regardless of exact spawn column.
    act(() => {
      vi.advanceTimersByTime(140 * 20);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/game over/i);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('does not claim a new high score when the run does not beat the stored one', () => {
    localStorage.setItem('nokia:hiscore:v1', JSON.stringify({ snake: 5 }));
    vi.useFakeTimers();
    setup();
    fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
    act(() => {
      vi.advanceTimersByTime(140 * 20);
    });
    expect(screen.getByRole('status')).not.toHaveTextContent(/new hi/i);
  });
});
