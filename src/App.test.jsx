import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

describe('App game desktop icons', () => {
  it('shows minesweeper and snake icons on the desktop', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /minesweeper\.exe/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /snake\.exe/i }),
    ).toBeInTheDocument();
  });

  it('does not render the minesweeper or snake windows on load', () => {
    render(<App />);
    expect(
      screen.queryByRole('region', { name: /minesweeper\.exe/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /snake\.exe/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the minesweeper window only after its icon is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('button', { name: /minesweeper\.exe/i }),
    );

    expect(
      screen.getByRole('region', { name: /minesweeper\.exe/i }),
    ).toBeInTheDocument();
  });

  it('opens the snake window only after its icon is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /snake\.exe/i }));

    expect(
      screen.getByRole('region', { name: /snake\.exe/i }),
    ).toBeInTheDocument();
  });
});

describe('App initial desktop state', () => {
  it('does not render any of the content windows on load', () => {
    render(<App />);
    expect(
      screen.queryByRole('region', { name: 'about.txt - Notepad' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'my work' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'cmd' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'contact.exe' }),
    ).not.toBeInTheDocument();
  });

  it('renders a cmd icon on the desktop', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: 'cmd' }),
    ).toBeInTheDocument();
  });

  it('opens the about window only after the about.txt icon is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'about.txt' }));
    expect(
      screen.getByRole('region', { name: 'about.txt - Notepad' }),
    ).toBeInTheDocument();
  });

  it('opens the stack window only after the cmd icon is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'cmd' }));
    expect(
      screen.getByRole('region', { name: 'cmd' }),
    ).toBeInTheDocument();
  });
});

describe('App desktop labels', () => {
  it('labels desktop icons with the rebranded filenames', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'about.txt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'my work' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'about.exe' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projects.exe' })).not.toBeInTheDocument();
  });
});

describe('Menu bar items — decorative only', () => {
  it('clicking a menu item in the about window does not open a dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'about.txt' }));
    const [first] = screen.getAllByRole('menuitem');
    await user.click(first);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('clicking a menu item in the my work window does not open a dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'my work' }));
    const [first] = screen.getAllByRole('menuitem');
    await user.click(first);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('clicking a menu item in the contact window does not open a dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'contact.exe' }));
    const [first] = screen.getAllByRole('menuitem');
    await user.click(first);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('clicking a menu item in the resume window does not open a dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'resume.pdf' }));
    // The viewer is a lazy chunk; its menu bar arrives a tick after the window.
    const [first] = await screen.findAllByRole('menuitem');
    await user.click(first);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('submitting the contact form still shows a confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'contact.exe' }));
    await user.type(screen.getByRole('textbox'), 'Hello');
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});

describe('Desktop icon — resume.pdf opens window', () => {
  it('resume.pdf icon is a button (not a link) and opens the resume window', async () => {
    const user = userEvent.setup();
    render(<App />);
    const icon = screen.getByRole('button', { name: 'resume.pdf' });
    expect(icon).toBeInTheDocument();
    await user.click(icon);
    expect(
      screen.getByRole('region', { name: /resume\.pdf/i }),
    ).toBeInTheDocument();
  });
});

describe('Contact window labels', () => {
  it('labels the message field "Message:" and not a shouted heading', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'contact.exe' }));

    const label = document.querySelector('.contact-form__label');
    expect(label).toHaveTextContent('Message:');
    expect(label.textContent).not.toMatch(/quick/i);
    // The label element itself carries the text; the uppercasing was CSS, so
    // the DOM said "Quick Message" while the window said "QUICK MESSAGE".
    expect(screen.getByLabelText('Message:')).toBe(
      screen.getByRole('textbox'),
    );
  });

  it('pairs each contact label with its value in one description list', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'contact.exe' }));

    const list = document.querySelector('.contact-links');
    expect(list.tagName.toLowerCase()).toBe('dl');
    expect(
      [...list.querySelectorAll('.contact-links__label')].map((n) => n.textContent),
    ).toEqual(['Email:', 'GitHub:', 'LinkedIn:']);
    expect(list.querySelectorAll('.contact-links__value')).toHaveLength(3);
  });
});

describe('Opening a window puts focus in it', () => {
  // The launcher used to call getElementById in its own click handler, which
  // on a FIRST open ran before React had rendered the <section>: focus stayed
  // on <body> while the titlebar painted active, so the next Tab restarted
  // from the top of the desktop.
  it('focuses the window region when its desktop icon opens it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'about.txt' }));

    const region = screen.getByRole('region', { name: 'about.txt - Notepad' });
    expect(document.activeElement).toBe(region);
  });

  it('focuses the window again when the taskbar restores it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'about.txt' }));
    await user.click(screen.getByRole('button', { name: 'Minimize about.txt - Notepad' }));
    await user.click(
      screen.getByRole('button', { name: /about\.txt - Notepad/ }),
    );

    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'about.txt - Notepad' }),
    );
  });
});

describe('Window status bars', () => {
  // .explorer-statusbar became a flex row of sunken panels for the explorer's
  // two-panel bar. The other two windows using the class rendered bare text,
  // which the new padding and gap left floating in an empty strip.
  it('sinks the contact.exe status text into a panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'contact.exe' }));

    const bar = document.querySelector('.win-contact .explorer-statusbar');
    const panel = bar.querySelector('.explorer-statusbar__panel');

    expect(panel).toHaveTextContent('Ready');
    expect(bar.textContent.trim()).toBe('Ready');
  });

  // Offline, not Online: nothing has answered /api/visit at this point, so the
  // display above the bar is still reading ---,--- and the panel says so too.
  it('sinks the SiteCounter.exe status text into a panel', () => {
    render(<App />);
    const bar = document.querySelector('.win-stats .explorer-statusbar');
    const panel = bar.querySelector('.explorer-statusbar__panel');

    expect(panel).toHaveTextContent('Offline');
    expect(bar.textContent.trim()).toBe('Offline');
  });

  it('turns Online and shows the numerals once /api/visit answers', async () => {
    // The rejecting default in src/test/setup.js keeps every other test in
    // this suite offline, which left the Online half of the panel — and the
    // six-digit odometer above it — with no test at all.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ count: 1234 }) })),
    );
    render(<App />);

    const bar = document.querySelector('.win-stats .explorer-statusbar');
    expect(await within(bar).findByText('Online')).toBeInTheDocument();
    // Zero-padded to six the way a 90s hit counter was.
    expect(document.querySelector('.win-stats .visitor-win__count')).toHaveTextContent(
      '001,234',
    );

    vi.unstubAllGlobals();
  });
});

describe('Skip link', () => {
  it('points at an element that is really on the page', () => {
    // It pointed at #projects for months, and nothing on the desktop carried
    // that id: pressing it moved neither the scroll nor the focus.
    render(<App />);
    const link = screen.getByRole('link', { name: /skip to projects/i });
    const id = link.getAttribute('href').slice(1);

    const target = document.getElementById(id);
    expect(target, `nothing on the page has id="${id}"`).not.toBeNull();
    // Without this a <div> is not focusable, and a skip link that moves the
    // scroll but not the focus drops the next Tab back at the top of the page.
    expect(target).toHaveAttribute('tabindex', '-1');
    expect(target).toContainElement(screen.getByRole('button', { name: 'my work' }));
  });
});
