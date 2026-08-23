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

  it('renders the dithered screenshot for a project that has one', () => {
    const index = projects.findIndex((p) => p.screenshot);
    expect(index, 'no project carries a screenshot').toBeGreaterThan(-1);
    setup({ index });
    const img = document.querySelector('.nk-detail__shot');
    expect(img).not.toBeNull();
    expect(img.src).toContain(projects[index].screenshot);
  });

  it('falls back to the hatch placeholder for a project without a screenshot', () => {
    const index = projects.findIndex((p) => !p.screenshot);
    expect(index, 'every project carries a screenshot').toBeGreaterThan(-1);
    setup({ index });
    expect(document.querySelector('.nk-detail__shot')).toBeNull();
    expect(screen.getByText(projects[index].iconType)).toBeInTheDocument();
  });

  it('offers a Visit softkey for a project with a public link', () => {
    const index = projects.findIndex((p) => p.link);
    setup({ index });
    expect(screen.getByRole('button', { name: /visit/i })).toBeInTheDocument();
  });

  it('drops the Visit softkey and states why for a project with no public link', () => {
    const index = projects.findIndex((p) => !p.link);
    expect(index, 'no linkless project to exercise').toBeGreaterThan(-1);
    setup({ index });
    expect(screen.queryByRole('button', { name: /visit/i })).toBeNull();
    expect(
      screen.getByText(new RegExp(projects[index].privateNote, 'i')),
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
