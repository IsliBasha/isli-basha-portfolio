import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the visitor hook so the odometer renders a deterministic number without
// touching the network. The hook's own /api/visit behaviour is tested elsewhere.
vi.mock('../../hooks/useVisitorCount.js', () => ({
  useVisitorCount: () => 42,
}));

import { Counter } from './Counter.jsx';

function setup(props = {}) {
  const onBack = vi.fn();
  render(<Counter onBack={onBack} {...props} />);
  return { onBack };
}

describe('Counter', () => {
  it('renders the visitor number in the caption', () => {
    setup();
    expect(screen.getByText(/caller no\. 42/i)).toBeInTheDocument();
  });

  it('zero-pads the count into a 5-cell odometer', () => {
    setup();
    // 42 -> "00042"; the accessible label carries the raw number.
    expect(
      screen.getByRole('img', { name: /visitor number 42/i }),
    ).toBeInTheDocument();
  });

  it('goes Back on Escape and via the Back softkey', async () => {
    const user = userEvent.setup();
    const { onBack } = setup();
    await user.keyboard('{Escape}');
    expect(onBack).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(2);
  });
});
