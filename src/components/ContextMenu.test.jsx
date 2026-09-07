import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowStackProvider } from '../context/WindowStack.jsx';
import { useWindowStack } from '../context/windowStackContext.js';
import { ContextMenu } from './ContextMenu.jsx';

function ClosedProbe() {
  const { isClosed } = useWindowStack();
  return <span data-testid="display-closed">{String(isClosed('display'))}</span>;
}

function renderMenu({ onClose = vi.fn() } = {}) {
  render(
    <WindowStackProvider initialOrder={['display']} initialClosed={['display']}>
      <ContextMenu x={40} y={40} onClose={onClose} />
      <ClosedProbe />
    </WindowStackProvider>,
  );
  return { onClose };
}

const displayClosed = () => screen.getByTestId('display-closed').textContent;

describe('desktop context menu', () => {
  it('lists the shell items a Win95 desktop offered', () => {
    renderMenu();
    const labels = screen.getAllByRole('menuitem').map((el) => el.textContent);
    expect(labels).toEqual([
      'New Folder',
      'Arrange Icons By',
      'Refresh',
      'Paste',
      'Paste Shortcut',
      'Properties',
    ]);
  });

  it('draws the submenu marker with a class rather than a pictographic glyph', () => {
    renderMenu();
    const arrange = screen.getByRole('menuitem', { name: 'Arrange Icons By' });
    // The triangle is a CSS ::after border, so nothing pictographic reaches the
    // text; the class is the only thing that puts it on screen.
    expect(arrange).toHaveClass('win95-context-menu__item--submenu');
    expect(arrange.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('leaves no pictographic character anywhere in the rendered menu', () => {
    renderMenu();
    expect(screen.getByRole('menu').textContent).not.toMatch(
      /\p{Extended_Pictographic}/u,
    );
  });
});

describe('Properties', () => {
  it('opens the Display Properties window and dismisses the menu', async () => {
    const user = userEvent.setup();
    const { onClose } = renderMenu();
    expect(displayClosed()).toBe('true');

    await user.click(screen.getByRole('menuitem', { name: 'Properties' }));

    expect(displayClosed()).toBe('false');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not put a dialog in the way of the window it just opened', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Properties' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

describe('the items that are only there for the period', () => {
  it('says so plainly instead of doing nothing', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'New Folder' }));

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('This feature is not implemented.');
  });

  it('leaves the Display Properties window shut', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Refresh' }));

    expect(displayClosed()).toBe('true');
  });
});

describe('dismissing the menu', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderMenu();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });
});
