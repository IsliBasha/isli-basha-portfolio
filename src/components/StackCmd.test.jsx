import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StackCmd } from './StackCmd.jsx';

function jsonResponse(data, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(data) });
}

const STATS_FIXTURE = {
  repos: 23,
  followers: 2,
  stars: 0,
  forks: 0,
  issues: 11,
  commits: '1,150',
  loc: '46,000',
  locAdd: '55,200',
  locDel: '9,200',
};

function setViewportWidth(width) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

describe('StackCmd terminal', () => {
  const originalFetch = global.fetch;
  const originalWidth = window.innerWidth;

  beforeEach(() => {
    global.fetch = vi.fn(() => jsonResponse(STATS_FIXTURE));
    setViewportWidth(1440);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setViewportWidth(originalWidth);
  });

  it('still handles existing synchronous commands (regression check)', async () => {
    const user = userEvent.setup();
    render(<StackCmd />);
    const input = screen.getByRole('textbox');
    // Boot banner already shows this line once; running `ver` must add a second occurrence.
    await user.type(input, 'ver{Enter}');
    await waitFor(() => {
      expect(screen.getAllByText(/Microsoft\(R\) Windows 95/)).toHaveLength(2);
    });
  });

  it('shows a pending line immediately after running neofetch', async () => {
    const user = userEvent.setup();
    render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');
    expect(screen.getByText(/Fetching GitHub stats/i)).toBeInTheDocument();
  });

  it('calls /api/neofetch and renders the resolved stats', async () => {
    const user = userEvent.setup();
    render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/neofetch');
    });

    expect(await screen.findByText(/23/)).toBeInTheDocument();
    expect(await screen.findByText(/1,150/)).toBeInTheDocument();
    expect(await screen.findByText(/46,000/)).toBeInTheDocument();
  });

  it('shows a friendly error line when the fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network down')));
    const user = userEvent.setup();
    render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');

    expect(await screen.findByText(/failed to fetch github stats/i)).toBeInTheDocument();
  });

  it('shows a friendly error line when the API responds with a non-ok status', async () => {
    global.fetch = vi.fn(() => jsonResponse({ error: 'bad' }, false));
    const user = userEvent.setup();
    render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');

    expect(await screen.findByText(/failed to fetch github stats/i)).toBeInTheDocument();
  });

  it('renders the ASCII art as an image on desktop-width viewports', async () => {
    setViewportWidth(1440);
    const user = userEvent.setup();
    const { container } = render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');

    const img = await waitFor(() => {
      const el = container.querySelector('img[src="/neofetch-art.svg"]');
      expect(el).toBeInTheDocument();
      return el;
    });
    expect(img).toBeInTheDocument();
  });

  it('renders the art image and system info side by side, not stacked', async () => {
    setViewportWidth(1440);
    const user = userEvent.setup();
    const { container } = render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');

    const block = await waitFor(() => {
      const el = container.querySelector('.stack-cmd__neofetch');
      expect(el).toBeInTheDocument();
      return el;
    });
    // Real neofetch layout: art and stats live in the same flex row,
    // not as separate stacked lines.
    expect(block.querySelector('img[src="/neofetch-art.svg"]')).toBeInTheDocument();
    expect(block.textContent).toContain('IsliBasha@github');
    expect(block.textContent).toContain('23');
  });

  it('omits the ASCII art image on mobile-width viewports, but still shows stats', async () => {
    setViewportWidth(375);
    const user = userEvent.setup();
    const { container } = render(<StackCmd />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'neofetch{Enter}');

    expect(await screen.findByText(/23/)).toBeInTheDocument();
    expect(container.querySelector('img[src="/neofetch-art.svg"]')).not.toBeInTheDocument();
  });
});
