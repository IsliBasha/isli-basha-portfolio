import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Window } from './Window.jsx';
import { Taskbar } from './Taskbar.jsx';
import { WindowStackProvider } from '../context/WindowStack.jsx';

function Harness() {
  return (
    <WindowStackProvider initialOrder={['about', 'projects']}>
      <Window id="about" title="about.exe">
        <p>about body</p>
      </Window>
      <Window id="projects" title="projects.exe">
        <p>projects body</p>
      </Window>
      <Taskbar />
    </WindowStackProvider>
  );
}

function getTaskbar() {
  return screen.getByRole('navigation', { name: /taskbar/i });
}

describe('Taskbar always-on tasks', () => {
  it('renders a task button for every open window on initial mount', () => {
    render(<Harness />);
    const taskbar = getTaskbar();
    expect(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    ).toBeInTheDocument();
    expect(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    ).toBeInTheDocument();
  });

  it('keeps the task button after the window is minimized', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole('button', { name: /minimize about\.exe/i }),
    );

    const taskbar = getTaskbar();
    expect(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    ).toBeInTheDocument();
  });

  it('minimizes a visible window when its active taskbar button is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    // projects is on top because it is last in initialOrder
    expect(screen.getByText('projects body')).toBeInTheDocument();

    const taskbar = getTaskbar();
    await user.click(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    );

    expect(screen.queryByText('projects body')).not.toBeInTheDocument();
  });

  it('restores the window when its taskbar button is clicked while minimized', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText('about body')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /minimize about\.exe/i }),
    );
    expect(screen.queryByText('about body')).not.toBeInTheDocument();

    const taskbar = getTaskbar();
    await user.click(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    );

    expect(screen.getByText('about body')).toBeInTheDocument();
  });

  it('reopens a closed window when its start-menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole('button', { name: /close about\.exe/i }),
    );
    expect(screen.queryByText('about body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^start$/i }));
    await user.click(screen.getByRole('menuitem', { name: /about/i }));

    expect(screen.getByText('about body')).toBeInTheDocument();
  });

  it('does not add a task button when a window is closed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText('about body')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /close about\.exe/i }),
    );

    expect(screen.queryByText('about body')).not.toBeInTheDocument();
    const taskbar = getTaskbar();
    expect(
      within(taskbar).queryByRole('button', { name: /about\.exe/i }),
    ).not.toBeInTheDocument();
  });

  it('shows a button per minimized window and can restore each independently', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole('button', { name: /minimize about\.exe/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /minimize projects\.exe/i }),
    );

    const taskbar = getTaskbar();
    expect(
      within(taskbar).getByRole('button', { name: /about\.exe/i }),
    ).toBeInTheDocument();
    expect(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    ).toBeInTheDocument();

    await user.click(
      within(taskbar).getByRole('button', { name: /projects\.exe/i }),
    );

    expect(screen.getByText('projects body')).toBeInTheDocument();
    expect(screen.queryByText('about body')).not.toBeInTheDocument();
  });
});
