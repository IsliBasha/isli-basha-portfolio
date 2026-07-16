import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { About } from './About.jsx';
import { bio } from '../../data/bio.js';

function setup(props = {}) {
  const onBack = vi.fn();
  render(<About onBack={onBack} {...props} />);
  return { onBack };
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('About', () => {
  it('renders the name and title from bio data', () => {
    setup();
    expect(screen.getByText(bio.name)).toBeInTheDocument();
    // Anchor on the "title · employer" separator: the prose paragraph says
    // "Specialist at Ofive Global", so only the title line has " · ".
    const titleLine = new RegExp(`${escapeRegExp(bio.title)} · `, 'i');
    expect(screen.getByText(titleLine)).toBeInTheDocument();
  });

  it('renders the opening of the first bio paragraph', () => {
    setup();
    const opening = escapeRegExp(bio.paragraphs[0].slice(0, 24));
    expect(screen.getByText(new RegExp(opening, 'i'))).toBeInTheDocument();
  });

  it('exposes the portrait as an accessible image', () => {
    setup();
    expect(
      screen.getByRole('img', { name: /portrait of/i }),
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
