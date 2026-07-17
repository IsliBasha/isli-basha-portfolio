import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHighScore, __TEST__ } from './useHighScore.js';

const { STORAGE_KEY } = __TEST__;

describe('useHighScore', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('defaults to zero when nothing is stored', () => {
    const { result } = renderHook(() => useHighScore('snake'));
    expect(result.current.highScore).toBe(0);
  });

  it('restores a stored score on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ snake: 42 }));
    const { result } = renderHook(() => useHighScore('snake'));
    expect(result.current.highScore).toBe(42);
  });

  it('records a new score that beats the stored high score', () => {
    const { result } = renderHook(() => useHighScore('snake'));
    act(() => result.current.recordScore(10));
    expect(result.current.highScore).toBe(10);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.snake).toBe(10);
  });

  it('ignores a score that does not beat the stored high score', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ snake: 42 }));
    const { result } = renderHook(() => useHighScore('snake'));
    act(() => result.current.recordScore(10));
    expect(result.current.highScore).toBe(42);
  });

  it('keeps each game id in its own slot', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ spaceImpact: 99 }));
    const { result } = renderHook(() => useHighScore('snake'));
    act(() => result.current.recordScore(5));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual({ spaceImpact: 99, snake: 5 });
  });
});
