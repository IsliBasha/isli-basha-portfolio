import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BSOD } from './BSOD.jsx';

describe('BSOD easter egg', () => {
  it('is hidden by default', () => {
    render(<BSOD />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('appears when Ctrl+Shift+B is pressed', async () => {
    const user = userEvent.setup();
    render(<BSOD />);

    await user.keyboard('{Control>}{Shift>}B{/Shift}{/Control}');

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
  });

  it('shows the classic Win95 fatal-exception header text', async () => {
    const user = userEvent.setup();
    render(<BSOD />);
    await user.keyboard('{Control>}{Shift>}B{/Shift}{/Control}');

    expect(screen.getByText(/fatal exception/i)).toBeInTheDocument();
    expect(screen.getAllByText(/press any key/i).length).toBeGreaterThan(0);
  });

  it('dismisses on any key press after it is shown', async () => {
    const user = userEvent.setup();
    render(<BSOD />);
    await user.keyboard('{Control>}{Shift>}B{/Shift}{/Control}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await act(async () => {
      await user.keyboard(' ');
    });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('ignores the initial modifier-only keydowns used to trigger it', async () => {
    const user = userEvent.setup();
    render(<BSOD />);

    await user.keyboard('{Control>}{Shift>}B{/Shift}{/Control}');

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
