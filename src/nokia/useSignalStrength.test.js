import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSignalStrength } from './useSignalStrength.js';

describe('useSignalStrength', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts at 4 bars', () => {
    const { result } = renderHook(() => useSignalStrength());
    expect(result.current).toBe(4);
  });

  it('does not shift when the roll does not favor a change', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9); // >= SHIFT_CHANCE, no shift
    const { result } = renderHook(() => useSignalStrength());
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current).toBe(4);
  });

  it('shifts down by exactly one bar when the roll favors a decrease', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1) // < SHIFT_CHANCE, shift happens
      .mockReturnValueOnce(0.1); // < 0.5, delta = -1
    const { result } = renderHook(() => useSignalStrength());
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current).toBe(3);
  });

  it('shifts up by exactly one bar when the roll favors an increase', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1).mockReturnValueOnce(0.1) // tick 1: down to 3
      .mockReturnValueOnce(0.1).mockReturnValueOnce(0.9); // tick 2: up to 4
    const { result } = renderHook(() => useSignalStrength());
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current).toBe(3);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current).toBe(4);
  });

  it('never drops below 2 bars', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // always shift, always delta -1
    const { result } = renderHook(() => useSignalStrength());
    act(() => {
      vi.advanceTimersByTime(4000 * 5);
    });
    expect(result.current).toBe(2);
  });
});
