import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

// What a redeploy does to a tab that was already open: the document names a
// hashed chunk the server no longer has, so the dynamic import rejects. A
// factory that throws is the closest a test can stand to that.
vi.mock('./ResumeViewer.jsx', () => {
  throw new Error(
    'Failed to fetch dynamically imported module: /assets/ResumeViewer-a1b2c3d4.js',
  );
});

// The second mount point: StartMenu's dialogs are portalled to <body>, outside
// the desktop tree, so they need a boundary of their own.
vi.mock('./RunDialog.jsx', () => {
  throw new Error(
    'Failed to fetch dynamically imported module: /assets/RunDialog-e5f6a7b8.js',
  );
});

const openResume = async (user) =>
  user.click(screen.getByRole('button', { name: 'resume.pdf' }));

const openStartItem = async (user, name) => {
  await user.click(screen.getByRole('button', { name: /^start$/i }));
  await user.click(screen.getByRole('menuitem', { name }));
};

const dismissDialog = async (user) =>
  user.click(
    within(await screen.findByRole('alertdialog')).getByRole('button', {
      name: 'OK',
    }),
  );

describe('a window whose lazy chunk will not load', () => {
  let consoleError;

  beforeEach(() => {
    // React reports a boundary-caught error through console.error, and so does
    // ChunkBoundary itself. Silenced here so the run stays readable, and read
    // back in the last test rather than merely swallowed.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('says so in a dialog instead of taking the whole desktop down', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openResume(user);

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      /Cannot find a file needed to open this window/,
    );
    expect(within(dialog).getByRole('button', { name: 'OK' })).toBeInTheDocument();

    // The whole point. Without a boundary the rejection reaches the root and
    // React unmounts everything: no desktop, no taskbar, a blank white page
    // with no way back but a manual reload.
    expect(screen.getByRole('navigation', { name: 'Taskbar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'about.txt' })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'resume.pdf - Adobe Acrobat' }),
    ).toBeInTheDocument();
  });

  it('says so in the window frame too, not only in the dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openResume(user);
    await screen.findByRole('alertdialog');

    // An empty frame is what a window looks like while its chunk is still on
    // the wire. A dead one has to look different, or the only difference
    // between "loading" and "never arriving" is how long you wait.
    const frame = screen.getByRole('region', { name: 'resume.pdf - Adobe Acrobat' });
    expect(within(frame).getByText(/Cannot open this window/)).toBeInTheDocument();
  });

  it('keeps that line in the window on OK rather than retrying into the same error', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openResume(user);
    await dismissDialog(user);

    // React.lazy caches the rejection, so re-rendering the child would throw
    // again in the same commit. OK dismisses; it does not re-arm. The note is
    // what is left on screen once the dialog is gone.
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    const frame = screen.getByRole('region', { name: 'resume.pdf - Adobe Acrobat' });
    expect(within(frame).getByText(/Cannot open this window/)).toBeInTheDocument();
  });

  it('reports the reason to the console instead of swallowing it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openResume(user);
    await screen.findByRole('alertdialog');

    expect(consoleError).toHaveBeenCalledWith(
      '[chunk] a lazily loaded window failed to arrive',
      expect.any(Error),
    );
  });
});

describe('a Start-menu dialog whose lazy chunk will not load', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('says so without taking the taskbar it was opened from with it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^start$/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Run…' }));

    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      /Cannot find a file needed to open this window/,
    );
    expect(screen.getByRole('navigation', { name: 'Taskbar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'about.txt' })).toBeInTheDocument();
    // No in-window note here: these children are portalled to the body, so it
    // would be a loose line of text under the desktop rather than something
    // inside a frame.
    expect(screen.queryByText(/Cannot open this window/)).not.toBeInTheDocument();
  });

  // This boundary never unmounts on its own: Taskbar renders StartMenu whether
  // the menu is open or not, so one caught rejection used to be permanent.
  // After dismissing a dead Run…, `failed` stayed true and render() stopped
  // returning children at all -- Shut Down… became a silent no-op for the rest
  // of the page's life, and a second Run… said nothing either.
  it('opens a different dialog after a dead one is dismissed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openStartItem(user, 'Run…');
    await dismissDialog(user);

    // ShutDown's chunk is fine; nothing about the Run… failure concerns it.
    await openStartItem(user, 'Shut Down…');

    expect(
      await screen.findByRole('dialog', { name: 'Shut Down Windows' }),
    ).toBeInTheDocument();
  });

  it('says so again when the same dead dialog is picked a second time', async () => {
    const user = userEvent.setup();
    render(<App />);

    await openStartItem(user, 'Run…');
    await dismissDialog(user);
    await openStartItem(user, 'Run…');

    // React.lazy keeps the rejection, so the second attempt fails the same
    // way. What it must not do is fail without saying so.
    expect(await screen.findByRole('alertdialog')).toHaveTextContent(
      /Cannot find a file needed to open this window/,
    );
  });
});
