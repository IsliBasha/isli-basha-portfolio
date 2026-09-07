import { describe, it, expect, vi, afterEach } from 'vitest';
import { useEffect, useState } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { SystemDialog } from './SystemDialog.jsx';

afterEach(() => {
  vi.useRealTimers();
});

/**
 * A parent on a one-second clock that hands the dialog a fresh inline callback
 * on every render — the shape Minesweeper has while its timer is running. The
 * dialog opens from a real button, because the effect's cleanup restores focus
 * to whatever held it beforehand: opened out of nowhere that is <body>, which
 * jsdom refuses to focus, and the whole defect disappears from the test.
 */
function TickingHost() {
  const [ticks, setTicks] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTicks((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <p data-testid="ticks">{ticks}</p>
      <button type="button" onClick={() => setOpen(true)}>
        Help
      </button>
      <SystemDialog
        open={open}
        title="Minesweeper"
        message="Left-click to reveal, right-click to flag."
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Open the dialog the way a user does: from a focused menu button. */
function openFromHelp() {
  const help = screen.getByRole('button', { name: 'Help' });
  help.focus();
  fireEvent.click(help);
  return help;
}

describe('SystemDialog focus while the parent re-renders', () => {
  it('holds focus on OK across three parent renders', () => {
    vi.useFakeTimers();
    render(<TickingHost />);
    openFromHelp();
    const ok = screen.getByRole('button', { name: 'OK' });

    expect(document.activeElement).toBe(ok);

    for (let tick = 1; tick <= 3; tick += 1) {
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByTestId('ticks')).toHaveTextContent(String(tick));
      expect(document.activeElement).toBe(ok);
    }
  });

  // The bug this file exists for. With the focus effect keyed on onClose as
  // well as open, a parent that re-rendered on a timer re-ran it every second;
  // each re-run went through the cleanup, which focuses whatever held focus
  // before the dialog opened. Focus landed back on OK by the end of the same
  // commit, so activeElement above never noticed — what the user got was a
  // blur/focus pair once a second, which drops an IME, restarts a screen
  // reader's announcement and cancels a text selection.
  it('does not blur the button or wake the trigger on every parent render', () => {
    vi.useFakeTimers();
    render(<TickingHost />);
    const help = openFromHelp();
    const ok = screen.getByRole('button', { name: 'OK' });

    let blurs = 0;
    let triggerFocuses = 0;
    ok.addEventListener('focusout', () => {
      blurs += 1;
    });
    help.addEventListener('focusin', () => {
      triggerFocuses += 1;
    });

    // One second at a time: three interval callbacks inside a single act()
    // batch into one React render, which would hide two thirds of the churn.
    for (let tick = 0; tick < 3; tick += 1) {
      act(() => vi.advanceTimersByTime(1000));
    }

    expect(screen.getByTestId('ticks')).toHaveTextContent('3');
    expect(blurs).toBe(0);
    expect(triggerFocuses).toBe(0);
  });
});

describe('SystemDialog callback freshness', () => {
  // The other half of holding onClose in a ref: a ref that is never updated
  // would keep calling the closure from the first render, which is the bug the
  // dependency array was there to prevent.
  it('calls the callback from the latest render, not the first one', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(
      <SystemDialog open message="Ready." onClose={first} />,
    );

    rerender(<SystemDialog open message="Ready." onClose={second} />);
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  // onClose is optional in the destructure only because it defaults there.
  // Without the default a caller that omits it turns every Escape into a
  // TypeError thrown inside a window keydown listener, where nothing catches it.
  it('shrugs off Escape from a caller that passed no onClose', () => {
    render(<SystemDialog open message="Ready." />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes on Enter and on the OK button too', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <SystemDialog open message="Ready." onClose={onClose} />,
    );

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<SystemDialog open message="Ready." onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('SystemDialog focus handover', () => {
  it('gives focus back to whatever opened it', () => {
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Help
          </button>
          <SystemDialog
            open={open}
            message="Ready."
            onClose={() => setOpen(false)}
          />
        </>
      );
    }

    render(<Host />);
    const help = screen.getByRole('button', { name: 'Help' });
    help.focus();

    fireEvent.click(help);
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'OK' }),
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(help);
  });

  // ContextMenu closes its menu and the dialog it opened in one commit, so by
  // the time this effect's cleanup runs the trigger is already out of the tree.
  // A detached node still answers typeof prev.focus === 'function' and still
  // takes the call; nothing moves, and focus is left on <body>.
  it('does not hand focus to a trigger that has left the document', () => {
    function VanishingHost() {
      const [open, setOpen] = useState(false);
      const [menuOpen, setMenuOpen] = useState(true);
      return (
        <>
          {menuOpen && (
            <button type="button" onClick={() => setOpen(true)}>
              Help
            </button>
          )}
          <SystemDialog
            open={open}
            message="Ready."
            onClose={() => {
              setOpen(false);
              setMenuOpen(false);
            }}
          />
        </>
      );
    }

    render(<VanishingHost />);
    const help = screen.getByRole('button', { name: 'Help' });
    help.focus();
    fireEvent.click(help);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    const handover = vi.spyOn(help, 'focus');
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(help.isConnected).toBe(false);
    expect(handover).not.toHaveBeenCalled();
  });

  it('keeps Tab inside the dialog', () => {
    render(<SystemDialog open message="Ready." onClose={() => {}} />);
    const ok = screen.getByRole('button', { name: 'OK' });

    document.body.focus();
    fireEvent.keyDown(window, { key: 'Tab' });

    expect(document.activeElement).toBe(ok);
  });
});
