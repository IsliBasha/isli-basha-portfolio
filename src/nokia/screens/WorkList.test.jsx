import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkList } from './WorkList.jsx';
import { projects } from '../../data/projects.js';

function setup(props = {}) {
  const onOpen = vi.fn();
  const onBack = vi.fn();
  render(<WorkList onOpen={onOpen} onBack={onBack} {...props} />);
  return { onOpen, onBack };
}

describe('WorkList', () => {
  it('renders every project name', () => {
    setup();
    for (const project of projects) {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    }
  });

  it('shows the n/total position indicator (starts at 1/total)', () => {
    setup();
    expect(
      screen.getByText(new RegExp(`1/${projects.length}`)),
    ).toBeInTheDocument();
  });

  it('opens the focused project when a row is clicked', async () => {
    const user = userEvent.setup();
    const { onOpen } = setup();
    await user.click(screen.getByText(projects[2].name));
    expect(onOpen).toHaveBeenCalledWith(2);
  });

  it('moves focus with arrows and opens with Enter', async () => {
    const user = userEvent.setup();
    const { onOpen } = setup();
    await user.keyboard('{ArrowDown}{Enter}'); // focus 0 -> 1
    expect(onOpen).toHaveBeenCalledWith(1);
  });

  it('jumps the highlight with a digit key, then Enter opens it', async () => {
    const user = userEvent.setup();
    const { onOpen } = setup();
    await user.keyboard('3'); // jump to index 2
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledWith(2);
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
