import { describe, it, expect } from 'vitest';
import { computeResize, MIN_WIDTH, MIN_HEIGHT } from './resizeWindow.js';

describe('computeResize', () => {
  it('grows width when dragging the right edge outward', () => {
    const next = computeResize({
      edge: 'right',
      startWidth: 400,
      startHeight: 300,
      deltaX: 50,
      deltaY: 0,
    });
    expect(next).toEqual({ width: 450, height: 300 });
  });

  it('grows height when dragging the bottom edge downward', () => {
    const next = computeResize({
      edge: 'bottom',
      startWidth: 400,
      startHeight: 300,
      deltaX: 0,
      deltaY: 80,
    });
    expect(next).toEqual({ width: 400, height: 380 });
  });

  it('grows both dimensions when dragging the bottom-right corner', () => {
    const next = computeResize({
      edge: 'corner',
      startWidth: 400,
      startHeight: 300,
      deltaX: 25,
      deltaY: 60,
    });
    expect(next).toEqual({ width: 425, height: 360 });
  });

  it('clamps width to MIN_WIDTH', () => {
    const next = computeResize({
      edge: 'right',
      startWidth: 220,
      startHeight: 300,
      deltaX: -500,
      deltaY: 0,
    });
    expect(next.width).toBe(MIN_WIDTH);
    expect(next.height).toBe(300);
  });

  it('clamps height to MIN_HEIGHT', () => {
    const next = computeResize({
      edge: 'bottom',
      startWidth: 400,
      startHeight: 200,
      deltaX: 0,
      deltaY: -500,
    });
    expect(next.height).toBe(MIN_HEIGHT);
    expect(next.width).toBe(400);
  });

  it('does not change non-resized dimension on right edge', () => {
    const next = computeResize({
      edge: 'right',
      startWidth: 400,
      startHeight: 300,
      deltaX: 50,
      deltaY: 999,
    });
    expect(next.height).toBe(300);
  });

  it('does not change non-resized dimension on bottom edge', () => {
    const next = computeResize({
      edge: 'bottom',
      startWidth: 400,
      startHeight: 300,
      deltaX: 999,
      deltaY: 50,
    });
    expect(next.width).toBe(400);
  });

  it('exposes sensible MIN constants', () => {
    expect(MIN_WIDTH).toBeGreaterThan(0);
    expect(MIN_HEIGHT).toBeGreaterThan(0);
  });
});
