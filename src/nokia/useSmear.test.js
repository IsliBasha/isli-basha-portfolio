import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSmear } from './useSmear.js';

describe('useSmear', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is null on mount', () => {
    const { result } = renderHook(() => useSmear(0));
    expect(result.current).toBeNull();
  });

  it('reports the outgoing index when focus moves, then clears after 150ms', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ focus }) => useSmear(focus), {
      initialProps: { focus: 0 },
    });
    rerender({ focus: 2 });
    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBeNull();
  });

  it('tracks the latest outgoing index across rapid focus changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ focus }) => useSmear(focus), {
      initialProps: { focus: 0 },
    });
    rerender({ focus: 1 });
    rerender({ focus: 2 });
    expect(result.current).toBe(1);
  });
});
