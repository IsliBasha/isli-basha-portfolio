import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowStackProvider } from '../context/WindowStack.jsx';
import { useWindowStack } from '../context/windowStackContext.js';
import { DisplayProperties } from './DisplayProperties.jsx';
import { WALLPAPERS } from '../hooks/useDisplaySettings.js';

const STORAGE_KEY = 'isli-display';
const CHIME_MUTED_KEY = 'isli-chime-muted';

const stored = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY));
const wallpaperAttr = () => document.documentElement.dataset.wallpaper;

/** Reports the window's closed state, which is how OK and Cancel are observed. */
function ClosedProbe() {
  const { isClosed } = useWindowStack();
  return <span data-testid="closed">{String(isClosed('display'))}</span>;
}

function renderSheet() {
  return render(
    <WindowStackProvider initialOrder={['display']} initialClosed={[]}>
      <DisplayProperties />
      <ClosedProbe />
    </WindowStackProvider>,
  );
}

const option = (name) => screen.getByRole('option', { name });
const isClosed = () => screen.getByTestId('closed').textContent;

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-wallpaper');
});

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-wallpaper');
});

describe('Display Properties pages', () => {
  it('opens on Background with Effects hidden', () => {
    renderSheet();
    expect(screen.getByRole('tab', { name: 'Background' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('listbox', { name: 'Wallpaper' })).toBeVisible();
    expect(screen.queryByLabelText('Play boot sound')).not.toBeVisible();
  });

  it('moves between pages with the arrow keys', async () => {
    const user = userEvent.setup();
    renderSheet();
    const background = screen.getByRole('tab', { name: 'Background' });
    background.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Effects' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Play boot sound')).toBeVisible();

    await user.keyboard('{ArrowLeft}');
    expect(background).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps rather than dead-ending on the last page', async () => {
    const user = userEvent.setup();
    renderSheet();
    screen.getByRole('tab', { name: 'Background' }).focus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Effects' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup();
    renderSheet();
    screen.getByRole('tab', { name: 'Background' }).focus();

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Effects' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Background' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('keeps one tab stop for the whole strip', () => {
    renderSheet();
    expect(screen.getByRole('tab', { name: 'Background' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Effects' })).toHaveAttribute('tabindex', '-1');
  });
});

describe('choosing a wallpaper', () => {
  it('lists the four wallpapers the hook knows about, in its order', () => {
    renderSheet();
    const ids = within(screen.getByRole('listbox', { name: 'Wallpaper' }))
      .getAllByRole('option')
      .map((el) => el.id.replace('display-wallpaper-', ''));
    expect(ids).toEqual(WALLPAPERS);
  });

  it('previews on the desktop as soon as one is clicked, without saving', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));

    expect(wallpaperAttr()).toBe('teal');
    expect(option('Teal')).toHaveAttribute('aria-selected', 'true');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('walks the list with the arrow keys and previews each step', async () => {
    const user = userEvent.setup();
    renderSheet();
    const list = screen.getByRole('listbox', { name: 'Wallpaper' });
    list.focus();

    await user.keyboard('{ArrowDown}');
    expect(wallpaperAttr()).toBe('clouds-16');
    expect(list).toHaveAttribute('aria-activedescendant', 'display-wallpaper-clouds-16');

    await user.keyboard('{ArrowUp}');
    // Back to the default, which is the absence of the attribute.
    expect(wallpaperAttr()).toBeUndefined();
  });

  it('hands focus to the listbox when an option is clicked', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));

    // Otherwise the next arrow key goes wherever the click left focus, and a
    // list you just used with the mouse stops answering the keyboard.
    expect(screen.getByRole('listbox', { name: 'Wallpaper' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(option('Setup')).toHaveAttribute('aria-selected', 'true');
  });

  it('jumps to the ends of the list with Home and End', async () => {
    const user = userEvent.setup();
    renderSheet();
    screen.getByRole('listbox', { name: 'Wallpaper' }).focus();

    await user.keyboard('{End}');
    expect(wallpaperAttr()).toBe('setup');

    await user.keyboard('{Home}');
    expect(wallpaperAttr()).toBeUndefined();
  });

  it('stops at the ends of the list instead of wrapping the desktop around', async () => {
    const user = userEvent.setup();
    renderSheet();
    screen.getByRole('listbox', { name: 'Wallpaper' }).focus();

    await user.keyboard('{ArrowUp}');
    expect(option('Clouds')).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(option('Setup')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Apply, OK and Cancel', () => {
  it('Apply saves the choice and leaves the sheet open', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Setup'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(stored()).toEqual({ wallpaper: 'setup' });
    expect(wallpaperAttr()).toBe('setup');
    expect(isClosed()).toBe('false');
  });

  it('OK saves the choice and closes the sheet', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(stored()).toEqual({ wallpaper: 'teal' });
    expect(isClosed()).toBe('true');
  });

  it('Cancel puts the previewed wallpaper back and closes', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await user.click(option('Setup'));
    expect(wallpaperAttr()).toBe('setup');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(wallpaperAttr()).toBe('teal');
    expect(stored().wallpaper).toBe('teal');
    expect(isClosed()).toBe('true');
  });

  it('Cancel undoes a preview that was never saved at all', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Clouds (16 colours)'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(wallpaperAttr()).toBeUndefined();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('Enter on a focused dialog button', () => {
  // The sheet answers Enter from anywhere inside it as "OK", the way a Win95
  // dialog did. A button already does something with Enter, and its click
  // lands AFTER the sheet's keydown handler, which is why that handler skips
  // `button, input` targets — these two are the cases that motivated it.
  it('OKs once when Enter lands on a focused OK', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));
    screen.getByRole('button', { name: 'OK' }).focus();
    await user.keyboard('{Enter}');

    expect(stored()).toEqual({ wallpaper: 'teal' });
    expect(isClosed()).toBe('true');
  });

  it('cancels, and saves nothing, when Enter lands on a focused Cancel', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));
    screen.getByRole('button', { name: 'Cancel' }).focus();
    await user.keyboard('{Enter}');

    // Without the exception the sheet's own handler would run first and save
    // the preview, then Cancel would close a sheet that had already OK'd.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(wallpaperAttr()).toBeUndefined();
    expect(isClosed()).toBe('true');
  });
});

describe('the boot sound checkbox', () => {
  it('is on by default and mutes through the one key that stores it', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('tab', { name: 'Effects' }));

    const checkbox = screen.getByLabelText('Play boot sound');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    // Still only a preview until a button says otherwise.
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBe('1');
    // And nowhere else: the wallpaper blob has no opinion about the chime.
    expect(stored()).toEqual({ wallpaper: 'clouds' });
  });

  it('shows the mute the tray set, not a copy of the old settings blob', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(CHIME_MUTED_KEY, '1');
    renderSheet();
    await user.click(screen.getByRole('tab', { name: 'Effects' }));

    expect(screen.getByLabelText('Play boot sound')).not.toBeChecked();
  });

  it('leaves that mute alone when the sheet only saves a wallpaper', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(CHIME_MUTED_KEY, '1');
    renderSheet();

    await user.click(option('Teal'));
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBe('1');
  });
});

describe('the keys a Win95 dialog answered', () => {
  it('Escape cancels, exactly as the button does', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(option('Teal'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await user.click(option('Setup'));
    expect(wallpaperAttr()).toBe('setup');

    await user.keyboard('{Escape}');

    expect(wallpaperAttr()).toBe('teal');
    expect(isClosed()).toBe('true');
  });

  it('Enter is OK', async () => {
    const user = userEvent.setup();
    renderSheet();
    screen.getByRole('listbox', { name: 'Wallpaper' }).focus();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(stored()).toEqual({ wallpaper: 'clouds-16' });
    expect(isClosed()).toBe('true');
  });

  it('leaves Enter to the controls that already answer it', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('tab', { name: 'Effects' }));
    screen.getByLabelText('Play boot sound').focus();

    await user.keyboard('{Enter}');

    // A checkbox mid-decision is not a finished dialog, and Enter on the
    // Cancel button would otherwise save the sheet it was cancelling.
    expect(isClosed()).toBe('false');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
