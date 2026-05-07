import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useWindowPosition,
  clearWindowPositions,
  __TEST__,
} from './useWindowPosition.js';

const { STORAGE_KEY } = __TEST__;

describe('useWindowPosition', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns zero offset when nothing is stored', () => {
    const { result } = renderHook(() => useWindowPosition('about'));
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('persists saved positions to localStorage and returns them on next mount', () => {
    const { result } = renderHook(() => useWindowPosition('about'));
    act(() => {
      result.current.savePosition({ x: 42, y: -8 });
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw)).toEqual({ about: { x: 42, y: -8 } });

    const next = renderHook(() => useWindowPosition('about'));
    expect(next.result.current.offset).toEqual({ x: 42, y: -8 });
  });

  it('keeps positions for other ids when saving one', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ projects: { x: 10, y: 20 } }),
    );
    const { result } = renderHook(() => useWindowPosition('about'));
    act(() => {
      result.current.savePosition({ x: 5, y: 5 });
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual({
      projects: { x: 10, y: 20 },
      about: { x: 5, y: 5 },
    });
  });

  it('falls back to zero offset when stored payload is malformed', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const { result } = renderHook(() => useWindowPosition('about'));
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('does not write when disabled (mobile)', () => {
    const { result } = renderHook(() =>
      useWindowPosition('about', { enabled: false }),
    );
    act(() => {
      result.current.savePosition({ x: 99, y: 99 });
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clearWindowPositions wipes the storage key', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ about: { x: 1, y: 2 } }));
    clearWindowPositions();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('persists size alongside position via saveSize', () => {
    const { result } = renderHook(() => useWindowPosition('about'));
    act(() => {
      result.current.savePosition({ x: 5, y: 5 });
      result.current.saveSize({ width: 420, height: 300 });
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.about).toEqual({
      x: 5,
      y: 5,
      width: 420,
      height: 300,
    });
  });

  it('restores stored size on next mount', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ about: { x: 0, y: 0, width: 480, height: 320 } }),
    );
    const { result } = renderHook(() => useWindowPosition('about'));
    expect(result.current.size).toEqual({ width: 480, height: 320 });
  });

  it('returns null size when nothing is stored', () => {
    const { result } = renderHook(() => useWindowPosition('about'));
    expect(result.current.size).toBeNull();
  });
});
