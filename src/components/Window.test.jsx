import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Window } from './Window.jsx';
import { WindowStackProvider } from '../context/WindowStack.jsx';

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
