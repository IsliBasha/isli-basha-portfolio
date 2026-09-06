import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVisitorCount, __resetSessionId } from './useVisitorCount.js';

const SESSION_KEY = 'portfolio_sid';

/** The `sessionId` the hook actually posted to /api/visit. */
function postedSessionId() {
  const [, init] = globalThis.fetch.mock.calls[0];
  return JSON.parse(init.body).sessionId;
}

beforeEach(() => {
  __resetSessionId();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.sessionStorage.clear();
});

describe('useVisitorCount session id', () => {
  it('reuses the id sessionStorage already holds', () => {
    window.sessionStorage.setItem(SESSION_KEY, 'previous-visit');

    renderHook(() => useVisitorCount());

    expect(postedSessionId()).toBe('previous-visit');
  });

  it('survives a sessionStorage that refuses to be read', () => {
    // Safari's private mode and a blocked third-party context both answer a
    // plain getItem with this. It used to escape the mount effect of
    // SiteCounter.exe, which is the one window open when the desktop boots,
    // and there is no error boundary above a hook: the whole desktop went.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    let count;
    expect(() => {
      count = renderHook(() => useVisitorCount()).result.current;
    }).not.toThrow();

    expect(count).toBeNull();
    expect(postedSessionId()).toEqual(expect.any(String));
  });

  it('counts a tab whose storage refuses the write as one visitor, not two', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    renderHook(() => useVisitorCount());
    const first = postedSessionId();
    renderHook(() => useVisitorCount());
    const [, second] = globalThis.fetch.mock.calls.map(
      ([, init]) => JSON.parse(init.body).sessionId,
    );

    expect(first).toBe(second);
  });

  it('makes an id up when crypto.randomUUID is not there to make one', () => {
    // randomUUID exists only in a secure context; an http:// preview of this
    // build has `crypto` without it, and reading it there is a TypeError.
    vi.stubGlobal('crypto', {});

    expect(() => renderHook(() => useVisitorCount())).not.toThrow();

    expect(postedSessionId()).toMatch(/^sid-/);
    vi.unstubAllGlobals();
  });
});
