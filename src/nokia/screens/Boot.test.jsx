import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Boot } from './Boot.jsx';

describe('Boot', () => {
  it('renders the boot splash', () => {
    render(<Boot onDone={() => {}} />);
    expect(screen.getByText('ISLI')).toBeInTheDocument();
    expect(
      screen.getByText(/connecting people to my work/i),
    ).toBeInTheDocument();
  });

  it('calls onDone when tapped (skip)', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<Boot onDone={onDone} />);
    await user.click(screen.getByText('ISLI'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone only once even if tapped repeatedly', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<Boot onDone={onDone} />);
    const target = screen.getByText('ISLI');
    await user.click(target);
    await user.click(target);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
