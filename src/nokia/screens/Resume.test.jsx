import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Resume } from './Resume.jsx';
import { resume } from '../../data/resume.js';

function setup(props = {}) {
  const onBack = vi.fn();
  render(<Resume onBack={onBack} {...props} />);
  return { onBack };
}

describe('Resume', () => {
  it('renders the Experience and Education headings', () => {
    setup();
    expect(screen.getByText(/Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Education/i)).toBeInTheDocument();
  });

  it('renders every experience and education organisation', () => {
    setup();
    for (const entry of [...resume.experience, ...resume.education]) {
      expect(
        screen.getByText(new RegExp(entry.org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
      ).toBeInTheDocument();
    }
  });

  it('offers a PDF download link pointing at the served resume', () => {
    setup();
    const link = screen.getByRole('link', { name: /download pdf/i });
    expect(link).toHaveAttribute('href', resume.pdf);
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
