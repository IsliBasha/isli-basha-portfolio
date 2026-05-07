import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BootSequence } from './BootSequence.jsx';

describe('BootSequence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
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
  });

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
