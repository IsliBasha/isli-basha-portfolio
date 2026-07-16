import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHashRoute } from './useHashRoute.js';

describe('useHashRoute', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('defaults to "/" when there is no hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('/');
  });

  it('reads the current hash on mount', () => {
    window.location.hash = '#/about';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toBe('/about');
  });

  it('navigate() updates the hash and the route', () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      result.current.navigate('/work/3');
    });
    expect(window.location.hash).toBe('#/work/3');
    expect(result.current.route).toBe('/work/3');
  });

  it('normalizes routes passed with or without a leading slash or hash', () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      result.current.navigate('menu');
    });
    expect(result.current.route).toBe('/menu');
    act(() => {
      result.current.navigate('#/games');
    });
    expect(result.current.route).toBe('/games');
  });

  it('responds to external hashchange events', () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = '#/messages';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current.route).toBe('/messages');
  });

  it('back() calls history.back()', () => {
    const spy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      result.current.back();
    });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
