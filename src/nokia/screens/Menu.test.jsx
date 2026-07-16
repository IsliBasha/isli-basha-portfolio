import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu } from './Menu.jsx';

function setup(props = {}) {
  const onSelect = vi.fn();
  const onBack = vi.fn();
  render(<Menu time="16:52" onSelect={onSelect} onBack={onBack} {...props} />);
  return { onSelect, onBack };
}

describe('Menu', () => {
  it('renders the six menu items', () => {
    setup();
    ['About', 'My Work', 'Messages', 'Resume', 'Counter', 'Games'].forEach(
      (label) => {
        expect(screen.getByText(new RegExp(label, 'i'))).toBeInTheDocument();
      },
    );
  });

  it('opens an item when its row is clicked', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();
    await user.click(screen.getByText(/My Work/i));
    expect(onSelect).toHaveBeenCalledWith('/work');
  });

  it('opens an item via its number key (1-6)', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();
    await user.keyboard('3');
    expect(onSelect).toHaveBeenCalledWith('/messages');
  });

  it('moves focus with arrows and selects the focused row with Enter', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();
    await user.keyboard('{ArrowDown}{Enter}'); // focus 0 -> 1 (My Work)
    expect(onSelect).toHaveBeenCalledWith('/work');
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
