import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BootSequence } from './BootSequence.jsx';

describe('BootSequence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the BIOS screen on first mount', () => {
    render(<BootSequence />);
    expect(
      screen.getByRole('dialog', { name: /system boot/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/AMI BIOS/i)).toBeInTheDocument();
  });

  it('skips entirely when sessionStorage flag is set', () => {
    sessionStorage.setItem('isli-boot-seen', '1');
    render(<BootSequence />);
    expect(
      screen.queryByRole('dialog', { name: /system boot/i }),
    ).not.toBeInTheDocument();
  });

  it('skips when prefers-reduced-motion is reduce', () => {
    const original = window.matchMedia;
    window.matchMedia = (q) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    });

    render(<BootSequence />);
    expect(
      screen.queryByRole('dialog', { name: /system boot/i }),
    ).not.toBeInTheDocument();

    window.matchMedia = original;
  });

  it('marks sessionStorage when the boot sequence ends', async () => {
    render(<BootSequence />);
    await waitFor(
      () => {
        expect(
          screen.queryByRole('dialog', { name: /system boot/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 7000 },
    );
    expect(sessionStorage.getItem('isli-boot-seen')).toBe('1');
    // Its own budget, not the suite's: this is the only test that sits out a
    // real 4.5s boot, and waitFor asks for up to 7s of it. The 5s default kills
    // it before its own timeout runs out; raising the default globally would
    // hide a hang in every other test in the repo.
  }, 10000);

  it('skips when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<BootSequence />);
    expect(
      screen.getByRole('dialog', { name: /system boot/i }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('dialog', { name: /system boot/i }),
    ).not.toBeInTheDocument();
    expect(sessionStorage.getItem('isli-boot-seen')).toBe('1');
  });

  // A storage that refuses the write is a boot that replays on every
  // navigation. The write stays swallowed — it runs inside the layout effect
  // that removes the overlay — so the dev line is the only signal there is.
  it('warns in dev when sessionStorage refuses the flag', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });
    const user = userEvent.setup();

    render(<BootSequence />);
    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('dialog', { name: /system boot/i }),
    ).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('replay on every navigation');
  });

  it('skips when the skip button is clicked', async () => {
    const user = userEvent.setup();
    render(<BootSequence />);
    await user.click(
      screen.getByRole('button', { name: /skip boot animation/i }),
    );
    expect(
      screen.queryByRole('dialog', { name: /system boot/i }),
    ).not.toBeInTheDocument();
  });
});
