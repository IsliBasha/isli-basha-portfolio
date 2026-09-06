import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShutDown } from './ShutDown.jsx';

const BOOT_SEEN_KEY = 'isli-boot-seen';
const SAFE_TEXT = "It's now safe to turn off your computer.";

function setup(props = {}) {
  const onClose = vi.fn();
  const reload = vi.fn();
  const user = userEvent.setup();
  render(<ShutDown open onClose={onClose} reload={reload} {...props} />);
  return { user, onClose, reload };
}

beforeEach(() => {
  window.sessionStorage.setItem(BOOT_SEEN_KEY, '1');
});

describe('Shut Down dialog', () => {
  it('offers both choices with shutting down preselected', () => {
    setup();

    expect(screen.getByRole('dialog', { name: 'Shut Down Windows' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Shut down the computer?' }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Restart the computer?' })).not.toBeChecked();
  });

  it('offers Yes, No and a Help button that was never wired up', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Yes' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'No' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Help' })).toBeDisabled();
  });

  it('backs out on No and on Escape without touching the boot flag', async () => {
    const { user, onClose, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(reload).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBe('1');
  });

  it('renders nothing while closed', () => {
    render(<ShutDown open={false} onClose={() => {}} reload={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('shutting the machine down', () => {
  it('replaces the desktop with the amber safe-to-turn-off screen', async () => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(screen.getByText(SAFE_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Shut Down Windows' })).not.toBeInTheDocument();
    // Powering off is not a restart: the boot flag survives until a key wakes it.
    expect(reload).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBe('1');
  });

  it('boots again on any key from the off screen', async () => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.keyboard('{a}');

    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('boots again on a click from the off screen', async () => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(screen.getByText(SAFE_TEXT));

    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('restarting', () => {
  it('clears the boot flag so the POST screens play, then reloads', async () => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('radio', { name: 'Restart the computer?' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
    // A restart never shows the off screen.
    expect(screen.queryByText(SAFE_TEXT)).not.toBeInTheDocument();
  });

  it('survives sessionStorage throwing instead of losing the restart', async () => {
    const removeItem = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('storage disabled');
      });
    const { user, reload } = setup();

    await user.click(screen.getByRole('radio', { name: 'Restart the computer?' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(reload).toHaveBeenCalledTimes(1);
    removeItem.mockRestore();
  });
});

describe('what counts as "press any key"', () => {
  // Reaching for a capital letter, or tabbing away to something else, is not
  // a request to boot the machine back up.
  const IGNORED = ['Shift', 'Control', 'Meta', 'Alt', 'Tab', 'CapsLock'];

  it.each(IGNORED)('leaves the machine off on %s alone', async (key) => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.keyboard(`{${key}>}{/${key}}`);

    expect(reload).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBe('1');
    expect(screen.getByText(SAFE_TEXT)).toBeInTheDocument();
  });

  it('still boots on Enter', async () => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.keyboard('{Enter}');

    expect(reload).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(BOOT_SEEN_KEY)).toBeNull();
  });

  it('still boots on a click', async () => {
    const { user, reload } = setup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(screen.getByText(SAFE_TEXT));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('a restart the browser refuses', () => {
  function blockedSetup() {
    const reload = vi.fn(() => {
      throw new Error('Blocked by the sandbox');
    });
    return { ...setup({ reload }), reload };
  }

  it('says so on the screen instead of leaving a black rectangle', async () => {
    const { user } = blockedSetup();

    await user.click(screen.getByRole('radio', { name: 'Restart the computer?' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(
      screen.getByText('Restart blocked by the browser. Press F5 to reload.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(SAFE_TEXT)).not.toBeInTheDocument();
  });

  it('stops listening for a wake it cannot honour', async () => {
    const { user, reload } = blockedSetup();

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.keyboard('{Enter}');
    expect(reload).toHaveBeenCalledTimes(1);

    // The first refusal is the answer. Every key after it would only re-clear
    // a flag that is already gone and re-run a call that already failed.
    await user.keyboard('{Enter}');
    await user.click(
      screen.getByText('Restart blocked by the browser. Press F5 to reload.'),
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('keeping Tab inside the dialog', () => {
  it('wraps forward off the last button onto the checked radio', async () => {
    const { user } = setup();

    // Yes has focus; Yes -> No -> (Help is disabled) -> back to the radio
    // group, which is one stop, not two.
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'No' }));
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('radio', { name: 'Shut down the computer?' }),
    );
  });

  it('keeps Shift+Tab off a chosen Restart inside the dialog', async () => {
    const { user } = setup();

    const restart = screen.getByRole('radio', { name: 'Restart the computer?' });
    await user.click(restart);
    expect(restart).toBeChecked();

    // A radio group is one tab stop and the checked button is it, so Restart
    // is now the first stop in the dialog. Counting the unchecked one as a
    // stop too is what let this land on the page behind the dialog.
    await user.tab({ shift: true });

    expect(screen.getByRole('dialog', { name: 'Shut Down Windows' })).toContainElement(
      document.activeElement,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'No' }));
  });
});
