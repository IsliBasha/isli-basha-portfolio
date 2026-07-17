import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Boot } from './Boot.jsx';

describe('Boot', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the hands art on frame 1 and the tagline', () => {
    const { container } = render(<Boot onDone={() => {}} />);
    expect(container.querySelector('.nk-boot__hands').src).toContain(
      '/nokia/boot-pixel-f1.png',
    );
    expect(screen.getByText(/connecting to/i)).toBeInTheDocument();
    expect(screen.getByText(/my portfolio/i)).toBeInTheDocument();
  });

  it('steps through frames 2 and 3 on whole-pixel timers, no NOKIA/"connecting people" wording', () => {
    vi.useFakeTimers();
    const { container } = render(<Boot onDone={() => {}} />);
    const img = () => container.querySelector('.nk-boot__hands');

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(img().src).toContain('/nokia/boot-pixel-f2.png');

    act(() => {
      vi.advanceTimersByTime(600); // 1400ms total
    });
    expect(img().src).toContain('/nokia/boot-pixel-f3.png');

    // Copyright note in the design handoff: no Nokia wordmark, no
    // "Connecting People" phrase — assert the banned phrase never appears.
    expect(screen.queryByText(/connecting people/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/nokia/i)).not.toBeInTheDocument();
  });

  it('calls onDone automatically once the sequence finishes, without a tap', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<Boot onDone={onDone} />);
    act(() => {
      vi.advanceTimersByTime(2350);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone when tapped (skip)', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const { container } = render(<Boot onDone={onDone} />);
    await user.click(container.querySelector('.nk-boot'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('calls onDone only once even if tapped repeatedly', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const { container } = render(<Boot onDone={onDone} />);
    const target = container.querySelector('.nk-boot');
    await user.click(target);
    await user.click(target);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
