import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Games } from './Games.jsx';

function setup() {
  const onOpen = vi.fn();
  const onBack = vi.fn();
  render(<Games onOpen={onOpen} onBack={onBack} />);
  return { onOpen, onBack };
}

describe('Games', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('renders all three games with a zeroed high score', () => {
    setup();
    ['Snake II', 'Space Impact', 'Bantumi'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.getAllByText('HI 0000')).toHaveLength(3);
  });

  it('shows a stored high score for a game', () => {
    localStorage.setItem('nokia:hiscore:v1', JSON.stringify({ snake: 42 }));
    setup();
    expect(screen.getByText('HI 0042')).toBeInTheDocument();
  });

  it('opens a game when its row is clicked', async () => {
    const user = userEvent.setup();
    const { onOpen } = setup();
    await user.click(screen.getByText('Bantumi'));
    expect(onOpen).toHaveBeenCalledWith('bantumi');
  });

  it('opens a game via its number key (1-3)', async () => {
    const user = userEvent.setup();
    const { onOpen } = setup();
    await user.keyboard('2');
    expect(onOpen).toHaveBeenCalledWith('space');
  });

  it('goes Back on Escape and via the Back softkey', async () => {
    const user = userEvent.setup();
    const { onBack } = setup();
    await user.keyboard('{Escape}');
    expect(onBack).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(2);
  });
});
