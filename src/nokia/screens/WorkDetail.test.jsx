import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkDetail } from './WorkDetail.jsx';
import { projects } from '../../data/projects.js';

function setup(props = {}) {
  const onPage = vi.fn();
  const onBack = vi.fn();
  render(<WorkDetail index={0} onPage={onPage} onBack={onBack} {...props} />);
  return { onPage, onBack };
}

describe('WorkDetail', () => {
  it('renders the project at the given index', () => {
    setup({ index: 2 });
    expect(screen.getByText(projects[2].name)).toBeInTheDocument();
    expect(screen.getByText(projects[2].description)).toBeInTheDocument();
  });

  it('pages to the next project on ArrowRight', async () => {
    const user = userEvent.setup();
    const { onPage } = setup({ index: 0 });
    await user.keyboard('{ArrowRight}');
    expect(onPage).toHaveBeenCalledWith(1);
  });

  it('wraps to the last project when paging back from the first', async () => {
    const user = userEvent.setup();
    const { onPage } = setup({ index: 0 });
    await user.keyboard('{ArrowLeft}');
    expect(onPage).toHaveBeenCalledWith(projects.length - 1);
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
