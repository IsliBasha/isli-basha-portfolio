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
