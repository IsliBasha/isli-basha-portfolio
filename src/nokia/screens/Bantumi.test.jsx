import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bantumi } from './Bantumi.jsx';

function setup() {
  const onBack = vi.fn();
  render(<Bantumi onBack={onBack} />);
  return { onBack };
}

describe('Bantumi', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('renders six playable player pits with four stones each', () => {
    setup();
    for (let i = 1; i <= 6; i += 1) {
      expect(screen.getByRole('button', { name: `Pit ${i}: 4 stones` })).toBeEnabled();
    }
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
  });

  it('calls onBack when Back is pressed', async () => {
    const user = userEvent.setup();
    const { onBack } = setup();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('keeps the turn with the player when a move lands in their own store', async () => {
    const user = userEvent.setup();
    setup();
    // Pit 3 (index 2) sows exactly into the store on the default board — an
    // extra turn under Kalah/Bantumi rules.
    await user.click(screen.getByRole('button', { name: 'Pit 3: 4 stones' }));
    expect(screen.getByText(/your turn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pit 4: 5 stones' })).toBeInTheDocument();
  });

  it('hands the turn to the AI and auto-plays its move after the delay', () => {
    vi.useFakeTimers();
    setup();
    // Pit 1 does not land in the store — a normal turn-passing move.
    act(() => {
      screen.getByRole('button', { name: 'Pit 1: 4 stones' }).click();
    });
    expect(screen.getByText(/ai turn/i)).toBeInTheDocument();
    expect(screen.getByLabelText('AI store')).toHaveTextContent('0');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // The AI's greedy move on this board deposits a stone in its store.
    expect(screen.getByLabelText('AI store')).toHaveTextContent('1');
  });
});
