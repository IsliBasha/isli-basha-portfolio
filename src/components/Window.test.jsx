import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Window } from './Window.jsx';
import { WindowStackProvider } from '../context/WindowStack.jsx';
import { useWindowStack } from '../context/windowStackContext.js';

// Stands in for a start-menu entry that points at a window nobody renders.
function GhostLauncher({ id }) {
  const { bringToFront } = useWindowStack();
  return (
    <button type="button" onClick={() => bringToFront(id)}>
      raise-ghost
    </button>
  );
}

function renderWindow(props = {}) {
  return render(
    <WindowStackProvider initialOrder={['test-win']}>
      <Window id="test-win" title="test.exe" {...props}>
        <p>window body</p>
      </Window>
    </WindowStackProvider>,
  );
}

describe('Window titlebar buttons', () => {
  it('renders accessible minimize, maximize, and close buttons', () => {
    renderWindow();
    expect(
      screen.getByRole('button', { name: /minimize/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /maximize/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('hides the window content when close is clicked', async () => {
    const user = userEvent.setup();
    renderWindow();
    expect(screen.getByText('window body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByText('window body')).not.toBeInTheDocument();
  });

  it('hides the window content when minimize is clicked', async () => {
    const user = userEvent.setup();
    renderWindow();
    expect(screen.getByText('window body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /minimize/i }));

    expect(screen.queryByText('window body')).not.toBeInTheDocument();
  });

  it('toggles maximized class on the window region when maximize is clicked', async () => {
    const user = userEvent.setup();
    renderWindow();
    const region = screen.getByRole('region', { name: 'test.exe' });
    expect(region.className).not.toMatch(/win95-window--maximized/);

    await user.click(screen.getByRole('button', { name: /maximize/i }));

    expect(region.className).toMatch(/win95-window--maximized/);
  });

  it('does not trigger titlebar drag when a titlebar button is clicked', async () => {
    const user = userEvent.setup();
    renderWindow();
    const closeBtn = screen.getByRole('button', { name: /close/i });

    await user.click(closeBtn);

    expect(screen.queryByText('window body')).not.toBeInTheDocument();
  });
});

describe('Window maximized — CSS specificity', () => {
  it('maximized selector beats the desktop position:absolute override', () => {
    // Reproduces the cascade conflict: desktop media query defines .win95-window
    // { position: absolute } AFTER .win95-window--maximized { position: fixed }
    // in the stylesheet. Same specificity (0,1,0) → later rule wins → bug.
    // Fix: compound selector .win95-window.win95-window--maximized (0,2,0) wins.
    const style = document.createElement('style');
    // The compound selector (.win95-window.win95-window--maximized, specificity 0,2,0)
    // must beat the single-class desktop override (.win95-window, specificity 0,1,0)
    // even when the override is declared later in the stylesheet.
    style.textContent = [
      '.win95-window.win95-window--maximized { position: fixed; top: 0; left: 0; }',
      '.win95-window { position: absolute; top: 5%; left: 18%; }',
    ].join('\n');
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.className = 'win95-window win95-window--maximized';
    document.body.appendChild(div);

    try {
      expect(getComputedStyle(div).position).toBe('fixed');
      expect(getComputedStyle(div).top).toBe('0px');
      expect(getComputedStyle(div).left).toBe('0px');
    } finally {
      document.head.removeChild(style);
      document.body.removeChild(div);
    }
  });

  it('does not set inline width or height when maximized', async () => {
    const user = userEvent.setup();
    const { container } = renderWindow();

    await user.click(screen.getByRole('button', { name: /maximize/i }));

    const win = container.querySelector('.win95-window--maximized');
    expect(win.style.width).toBe('');
    expect(win.style.height).toBe('');
  });
});

describe('Window active/inactive titlebar', () => {
  function renderTwoWindows() {
    return render(
      <WindowStackProvider initialOrder={['back-win', 'front-win']}>
        <Window id="back-win" title="back.exe">
          <p>back body</p>
        </Window>
        <Window id="front-win" title="front.exe">
          <p>front body</p>
        </Window>
      </WindowStackProvider>,
    );
  }

  it('marks only the window that is not on top as inactive', () => {
    renderTwoWindows();

    expect(
      screen.getByRole('region', { name: 'front.exe' }).className,
    ).not.toMatch(/win95-window--inactive/);
    expect(screen.getByRole('region', { name: 'back.exe' }).className).toMatch(
      /win95-window--inactive/,
    );
  });

  it('moves the inactive marker when another window is brought to front', async () => {
    const user = userEvent.setup();
    renderTwoWindows();
    const back = screen.getByRole('region', { name: 'back.exe' });
    const front = screen.getByRole('region', { name: 'front.exe' });

    await user.click(back);

    expect(back.className).not.toMatch(/win95-window--inactive/);
    expect(front.className).toMatch(/win95-window--inactive/);
  });

  it('does not mark a lone open window as inactive', () => {
    renderWindow();
    expect(
      screen.getByRole('region', { name: 'test.exe' }).className,
    ).not.toMatch(/win95-window--inactive/);
  });

  it('promotes the remaining window when the active one is closed', async () => {
    const user = userEvent.setup();
    renderTwoWindows();

    await user.click(screen.getByRole('button', { name: 'Close front.exe' }));

    expect(
      screen.getByRole('region', { name: 'back.exe' }).className,
    ).not.toMatch(/win95-window--inactive/);
  });

  it('promotes the remaining window when the active one is minimized', async () => {
    // hide() leaves the minimized id on top of `order`; only the hidden check
    // stops it staying elected. Without that check the desktop would show a
    // minimized window as active while its taskbar task sat un-pressed.
    const user = userEvent.setup();
    renderTwoWindows();

    await user.click(screen.getByRole('button', { name: 'Minimize front.exe' }));

    expect(
      screen.getByRole('region', { name: 'back.exe' }).className,
    ).not.toMatch(/win95-window--inactive/);
  });

  it('keeps exactly one window active when an unmounted id is raised', async () => {
    // The start menu can name a window that no longer exists. Electing that
    // id would make every rendered window match `activeId !== id`, greying
    // out the whole desktop with no titlebar to click back.
    const user = userEvent.setup();
    render(
      <WindowStackProvider initialOrder={['back-win', 'front-win']}>
        <Window id="back-win" title="back.exe">
          <p>back body</p>
        </Window>
        <Window id="front-win" title="front.exe">
          <p>front body</p>
        </Window>
        <GhostLauncher id="does-not-exist" />
      </WindowStackProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'raise-ghost' }));

    const active = screen
      .getAllByRole('region')
      .filter((el) => !el.className.includes('win95-window--inactive'));
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAccessibleName('front.exe');
  });
});

describe('Window titlebar button glyphs', () => {
  it('draws the caption glyphs as bitmaps instead of text characters', () => {
    renderWindow();
    for (const name of [/minimize/i, /maximize/i, /close/i]) {
      const btn = screen.getByRole('button', { name });
      expect(btn.textContent).toBe('');
      const svg = btn.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg.getAttribute('viewBox')).toBe('0 0 16 14');
      expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.querySelectorAll('rect').length).toBeGreaterThan(0);
    }
  });

  it('fills every glyph pixel with currentColor so forced-colors can repaint', () => {
    // Windows High Contrast overrides `color` but leaves a literal fill
    // alone; a hard-coded #000000 here would render three blank buttons on
    // the one setting that most needs them visible.
    renderWindow();
    for (const name of [/minimize/i, /maximize/i, /close/i]) {
      const rects = [
        ...screen.getByRole('button', { name }).querySelectorAll('rect'),
      ];
      expect(rects.length).toBeGreaterThan(0);
      for (const rect of rects) {
        expect(rect.getAttribute('fill')).toBe('currentColor');
      }
    }
  });

  it('swaps the maximize glyph for the restore glyph once maximized', async () => {
    const user = userEvent.setup();
    renderWindow();
    const before = screen
      .getByRole('button', { name: /maximize/i })
      .querySelectorAll('rect').length;

    await user.click(screen.getByRole('button', { name: /maximize/i }));

    const after = screen
      .getByRole('button', { name: /restore/i })
      .querySelectorAll('rect').length;
    expect(after).not.toBe(before);
  });
});

describe('Window resize handles', () => {
  it('renders right, bottom, and corner resize handles when not maximized', () => {
    const { container } = renderWindow();
    expect(container.querySelector('[data-resize="right"]')).not.toBeNull();
    expect(container.querySelector('[data-resize="bottom"]')).not.toBeNull();
    expect(container.querySelector('[data-resize="corner"]')).not.toBeNull();
  });

  it('does not render resize handles when the window is maximized', async () => {
    const user = userEvent.setup();
    const { container } = renderWindow();

    await user.click(screen.getByRole('button', { name: /maximize/i }));

    expect(container.querySelector('[data-resize="right"]')).toBeNull();
    expect(container.querySelector('[data-resize="bottom"]')).toBeNull();
    expect(container.querySelector('[data-resize="corner"]')).toBeNull();
  });
});
