import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowStackProvider } from './WindowStack.jsx';
import { useWindowStack } from './windowStackContext.js';

function Probe({ id }) {
  const { isClosed, bringToFront } = useWindowStack();
  return (
    <div>
      <span data-testid={`state-${id}`}>
        {isClosed(id) ? 'closed' : 'open'}
      </span>
      <button type="button" onClick={() => bringToFront(id)}>
        launch-{id}
      </button>
    </div>
  );
}

describe('WindowStackProvider initialClosed', () => {
  it('marks windows in initialClosed as closed at boot', () => {
    render(
      <WindowStackProvider
        initialOrder={['about', 'minesweeper']}
        initialClosed={['minesweeper']}
      >
        <Probe id="about" />
        <Probe id="minesweeper" />
      </WindowStackProvider>,
    );

    expect(screen.getByTestId('state-about')).toHaveTextContent('open');
    expect(screen.getByTestId('state-minesweeper')).toHaveTextContent('closed');
  });

  it('bringToFront un-closes a window that started closed', async () => {
    const user = userEvent.setup();
    render(
      <WindowStackProvider
        initialOrder={['minesweeper']}
        initialClosed={['minesweeper']}
      >
        <Probe id="minesweeper" />
      </WindowStackProvider>,
    );

    expect(screen.getByTestId('state-minesweeper')).toHaveTextContent('closed');

    await user.click(screen.getByRole('button', { name: 'launch-minesweeper' }));

    expect(screen.getByTestId('state-minesweeper')).toHaveTextContent('open');
  });
});

// Every id the desktop renders, plus the one it does not. `display` is the
// real case: the Start menu and the Run box can both name it before the
// Display Properties order lands.
const PHANTOM = 'display';

function StackProbe() {
  const { getZ, bringToFront, activeId } = useWindowStack();
  return (
    <div>
      <span data-testid="z">
        {['about', 'snake', PHANTOM].map((id) => `${id}:${getZ(id)}`).join(' ')}
      </span>
      <span data-testid="active">{activeId ?? 'none'}</span>
      <button type="button" onClick={() => bringToFront(PHANTOM)}>
        launch-phantom
      </button>
      <button type="button" onClick={() => bringToFront('about')}>
        launch-about
      </button>
    </div>
  );
}

describe('WindowStackProvider and an id nothing renders', () => {
  function renderProbe() {
    render(
      <WindowStackProvider initialOrder={['about', 'snake']}>
        <StackProbe />
      </WindowStackProvider>,
    );
  }

  it('leaves the stacking order exactly where it was', async () => {
    const user = userEvent.setup();
    renderProbe();

    const before = screen.getByTestId('z').textContent;
    expect(before).toBe('about:10 snake:11 display:10');

    await user.click(screen.getByRole('button', { name: 'launch-phantom' }));

    // Inserted into `order`, the phantom would land on top of it and getZ
    // would hand it 12 -- a higher z-index than any window on the desktop,
    // for a window that does not exist.
    expect(screen.getByTestId('z')).toHaveTextContent(before);
    expect(screen.getByTestId('active')).toHaveTextContent('snake');
  });

  it('still raises a window the desktop does render', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'launch-about' }));

    expect(screen.getByTestId('z')).toHaveTextContent('about:11 snake:10 display:10');
    expect(screen.getByTestId('active')).toHaveTextContent('about');
  });
});
