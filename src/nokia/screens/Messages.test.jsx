import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Messages } from './Messages.jsx';
import { counterLabel } from './smsCounter.js';

function setup(props = {}) {
  const onSent = vi.fn();
  const onBack = vi.fn();
  render(<Messages onSent={onSent} onBack={onBack} {...props} />);
  return { onSent, onBack };
}

describe('counterLabel', () => {
  it('counts characters up to a single 160-char message', () => {
    expect(counterLabel(0)).toBe('0/160');
    expect(counterLabel(160)).toBe('160/160');
  });

  it('flips to a segment count past 160 characters', () => {
    expect(counterLabel(161)).toBe('2 msg');
    expect(counterLabel(320)).toBe('2 msg');
    expect(counterLabel(321)).toBe('3 msg');
  });
});

describe('Messages', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('updates the character counter as you type', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(screen.getByText('5/160')).toBeInTheDocument();
  });

  it('posts { message } to /api/contact and confirms delivery', async () => {
    const user = userEvent.setup();
    const { onSent } = setup();
    await user.type(screen.getByRole('textbox'), 'hi there');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(onSent).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'hi there' }),
      }),
    );
  });

  it('does not send an empty message', async () => {
    const user = userEvent.setup();
    const { onSent } = setup();
    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(fetch).not.toHaveBeenCalled();
    expect(onSent).not.toHaveBeenCalled();
  });

  it('clears the field via the Clear softkey', async () => {
    const user = userEvent.setup();
    setup();
    const box = screen.getByRole('textbox');
    await user.type(box, 'draft');
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(box).toHaveValue('');
  });
});
