import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunDialog } from './RunDialog.jsx';
import { resolveRunTarget } from './runTargets.js';

function setup(props = {}) {
  const onClose = vi.fn();
  const onOpenWindow = vi.fn();
  const user = userEvent.setup();
  render(
    <RunDialog open onClose={onClose} onOpenWindow={onOpenWindow} {...props} />,
  );
  return { user, onClose, onOpenWindow };
}

const openField = () => screen.getByLabelText('Open:');

describe('resolveRunTarget', () => {
  it('ignores case and surrounding whitespace', () => {
    expect(resolveRunTarget('SNAKE.EXE')).toBe('snake');
    expect(resolveRunTarget('Snake.exe')).toBe('snake');
    expect(resolveRunTarget(' winmine ')).toBe('minesweeper');
  });

  it('treats .exe as optional on the names that carry it', () => {
    expect(resolveRunTarget('snake')).toBe('snake');
    expect(resolveRunTarget('minesweeper')).toBe('minesweeper');
    expect(resolveRunTarget('contact')).toBe('contact');
    expect(resolveRunTarget('sitecounter')).toBe('stats');
  });

  it('maps the DOS-era aliases onto the windows that answer to them', () => {
    expect(resolveRunTarget('cmd')).toBe('stack');
    expect(resolveRunTarget('command')).toBe('stack');
    expect(resolveRunTarget('MS-DOS Prompt')).toBe('stack');
    expect(resolveRunTarget('notepad')).toBe('about');
    expect(resolveRunTarget('about.txt')).toBe('about');
    expect(resolveRunTarget('mail')).toBe('contact');
    expect(resolveRunTarget('explorer')).toBe('mywork');
    expect(resolveRunTarget('display properties')).toBe('display');
  });

  it('returns null for anything it does not know', () => {
    expect(resolveRunTarget('doom')).toBeNull();
    expect(resolveRunTarget('   ')).toBeNull();
    expect(resolveRunTarget(undefined)).toBeNull();
  });

  // The typed string reaches the table directly, so an inherited property name
  // must not answer with a function pretending to be a window id.
  it('never resolves an inherited property name', () => {
    for (const probe of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      expect(resolveRunTarget(probe), probe).toBeNull();
    }
  });
});

describe('Run dialog', () => {
  it('shows the Win95 prompt and the three buttons', () => {
    setup();
    expect(
      screen.getByText(
        'Type the name of a program, folder, or document, and Windows will open it for you.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse…' })).toBeInTheDocument();
  });

  it('opens the window a typed name resolves to, whatever the casing', async () => {
    const { user, onClose, onOpenWindow } = setup();

    await user.type(openField(), 'SNAKE.EXE');
    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(onOpenWindow).toHaveBeenCalledWith('snake');
    expect(onClose).toHaveBeenCalled();
  });

  it('submits on Enter', async () => {
    const { user, onOpenWindow } = setup();

    await user.type(openField(), 'Snake.exe{Enter}');

    expect(onOpenWindow).toHaveBeenCalledWith('snake');
  });

  it('trims what the user typed before looking it up', async () => {
    const { user, onOpenWindow } = setup();

    await user.type(openField(), ' winmine {Enter}');

    expect(onOpenWindow).toHaveBeenCalledWith('minesweeper');
  });

  it('reports an unknown name the way Win95 did, titled with what was typed', async () => {
    const { user, onClose, onOpenWindow } = setup();

    await user.type(openField(), 'doom.exe{Enter}');

    const alert = screen.getByRole('alertdialog');
    expect(alert).toHaveAccessibleName('doom.exe');
    expect(alert).toHaveTextContent(
      "Cannot find the file 'doom.exe' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.",
    );
    expect(onOpenWindow).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('leaves the Run dialog standing after the not-found alert is dismissed', async () => {
    const { user, onClose } = setup();

    await user.type(openField(), 'doom{Enter}');
    // Two OK buttons are on screen; the alert's is the one that dismisses it.
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'OK' }),
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Run' })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does nothing at all when the box is empty', async () => {
    const { user, onClose, onOpenWindow } = setup();

    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(onOpenWindow).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('cancels on Escape and on the Cancel button', async () => {
    const { user, onClose, onOpenWindow } = setup();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onOpenWindow).not.toHaveBeenCalled();
  });

  it('sends Browse… to the explorer, the only file system this desktop has', async () => {
    const { user, onClose, onOpenWindow } = setup();

    await user.click(screen.getByRole('button', { name: 'Browse…' }));

    expect(onOpenWindow).toHaveBeenCalledWith('mywork');
    expect(onClose).toHaveBeenCalled();
  });

  it('focuses the Open field so the name can be typed straight away', () => {
    setup();
    expect(document.activeElement).toBe(openField());
  });

  it('keeps Tab inside the dialog', async () => {
    const { user } = setup();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'OK' }));
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Browse…' }),
    );
    await user.tab();
    expect(document.activeElement).toBe(openField());
  });

  it('renders nothing while closed', () => {
    render(<RunDialog open={false} onClose={() => {}} onOpenWindow={() => {}} />);
    expect(screen.queryByRole('dialog', { name: 'Run' })).not.toBeInTheDocument();
  });

  it('caps what can be typed, because the alert is titled with it', () => {
    setup();
    expect(openField()).toHaveAttribute('maxlength', '260');
  });

  it('opens empty again after a name that did not resolve', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <RunDialog open onClose={onClose} onOpenWindow={vi.fn()} />,
    );

    await user.type(openField(), 'doom{Enter}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // The parent closes it in response; the dialog stays mounted throughout.
    rerender(<RunDialog open={false} onClose={onClose} onOpenWindow={vi.fn()} />);
    rerender(<RunDialog open onClose={onClose} onOpenWindow={vi.fn()} />);

    expect(openField()).toHaveValue('');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
