import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpaceImpact } from './SpaceImpact.jsx';

function setup() {
  const onBack = vi.fn();
  const utils = render(<SpaceImpact onBack={onBack} />);
  return { onBack, ...utils };
}

describe('SpaceImpact', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the wave and lives HUD', () => {
    setup();
    expect(screen.getByText(/W1/)).toBeInTheDocument();
    expect(screen.getByText(/♥♥♥/)).toBeInTheDocument();
  });

  it('calls onBack when Quit is pressed', async () => {
    const user = userEvent.setup();
    const { onBack } = setup();
    await user.click(screen.getByRole('button', { name: /quit/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('fires a bullet ahead of the player when Fire is pressed', async () => {
    const user = userEvent.setup();
    const { container } = setup();
    await user.click(screen.getAllByRole('button', { name: /^fire$/i })[0]);
    expect(container.querySelector('.nk-si-cell--bullet')).not.toBeNull();
  });

  it('moves the player without crashing when the d-pad is used', async () => {
    const user = userEvent.setup();
    const { container } = setup();
    await user.click(screen.getByRole('button', { name: /^up$/i }));
    expect(container.querySelector('.nk-si-cell--player')).not.toBeNull();
  });

  it('ends the game with a game-over banner once lives run out', () => {
    // Force every enemy to spawn on the player's row so collisions are guaranteed.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.useFakeTimers();
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /^fire$/i })[0]);
    act(() => {
      vi.advanceTimersByTime(180 * 60);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/game over/i);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
