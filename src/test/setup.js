import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom ships a real fetch and resolves a relative URL against the test
// origin, so `/api/visit` was a genuine outbound connection attempt on every
// render(<App />): SiteCounter.exe is the one window that does not start
// closed, and useVisitorCount posts from its mount effect. Nothing here mocked
// it, which put a socket per test between this suite and a machine's DNS.
//
// The default refuses instead, the way an offline browser does — useVisitorCount
// catches it and the counter keeps reading Offline. A test that wants a
// response replaces globalThis.fetch itself; this only decides what an
// unmocked call does.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((input) => {
      const url = typeof input === 'string' ? input : (input?.url ?? String(input));
      return Promise.reject(
        new Error(`fetch(${url}) was not stubbed — tests do not reach the network`),
      );
    }),
  );
});
