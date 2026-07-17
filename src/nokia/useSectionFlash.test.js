import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSectionFlash } from './useSectionFlash.js';

describe('useSectionFlash', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is off on mount even when ready', () => {
    const { result } = renderHook(() => useSectionFlash('/menu', true));
    expect(result.current).toBe(false);
  });

  it('turns on when the route changes while ready, then clears after 80ms', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ route, ready }) => useSectionFlash(route, ready),
      { initialProps: { route: '/menu', ready: true } },
    );
    rerender({ route: '/about', ready: true });
    expect(result.current).toBe(true);
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current).toBe(false);
  });

  it('does not flash while not ready, even if the route changes', () => {
    const { result, rerender } = renderHook(
      ({ route, ready }) => useSectionFlash(route, ready),
      { initialProps: { route: '/', ready: false } },
    );
    rerender({ route: '/menu', ready: false });
    expect(result.current).toBe(false);
  });

  it('does not flash for the transition that flips ready to true on the same route', () => {
    const { result, rerender } = renderHook(
      ({ route, ready }) => useSectionFlash(route, ready),
      { initialProps: { route: '/', ready: false } },
    );
    rerender({ route: '/', ready: true });
    expect(result.current).toBe(false);
  });
});
