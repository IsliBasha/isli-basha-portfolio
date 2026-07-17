import { describe, it, expect } from 'vitest';
import { downsample, toGrayscale, atkinsonDither, toInkRgba, DITHER_INK } from './dither.js';

function solidImage(width, height, [r, g, b, a]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return { width, height, data };
}

describe('downsample', () => {
  it('shrinks to the target width while preserving aspect ratio', () => {
    const src = solidImage(100, 50, [10, 20, 30, 255]);
    const out = downsample(src, 20);
    expect(out.width).toBe(20);
    expect(out.height).toBe(10);
  });

  it('samples from the nearest source pixel', () => {
    const width = 4;
    const height = 1;
    const data = new Uint8ClampedArray(width * height * 4);
    // Pixel 0 white, pixel 3 black — everything else white.
    for (let i = 0; i < width; i += 1) {
      const v = i === 3 ? 0 : 255;
      data[i * 4] = v;
      data[i * 4 + 1] = v;
      data[i * 4 + 2] = v;
      data[i * 4 + 3] = 255;
    }
    const out = downsample({ width, height, data }, 2);
    // Nearest-neighbor at half width: output pixel 1 maps to source pixel 2 (white),
    // not the black pixel 3 — locks in the exact sampling rule.
    expect(out.data[1 * 4]).toBe(255);
  });
});

describe('toGrayscale', () => {
  it('converts pure white to 255 and pure black to 0', () => {
    const white = solidImage(1, 1, [255, 255, 255, 255]);
    const black = solidImage(1, 1, [0, 0, 0, 255]);
    expect(toGrayscale(white)[0]).toBeCloseTo(255);
    expect(toGrayscale(black)[0]).toBeCloseTo(0);
  });
});

describe('atkinsonDither', () => {
  it('marks a pixel below threshold as ink (0) and above as clear (1)', () => {
    const gray = new Float32Array([10, 240]);
    const bits = atkinsonDither(gray, 2, 1);
    expect(bits[0]).toBe(0);
    expect(bits[1]).toBe(1);
  });

  it('diffuses error to in-bounds neighbors', () => {
    // Pixel (0,0) = 50 quantizes to 0 (ink) with leftover error (50-0)/8,
    // which should push neighbor (1,0) above its starting mid-gray value.
    const width = 3;
    const height = 3;
    const gray = new Float32Array(width * height).fill(127);
    gray[0] = 50;
    const bits = atkinsonDither(gray, width, height);
    expect(bits[0]).toBe(0); // quantized to ink
    expect(gray[1]).toBeGreaterThan(127);
  });

  it('never writes outside the bitmap for an edge pixel', () => {
    const gray = new Float32Array([200]);
    expect(() => atkinsonDither(gray, 1, 1)).not.toThrow();
  });
});

describe('toInkRgba', () => {
  it('renders ink pixels opaque in the ink color and clear pixels fully transparent', () => {
    const bits = new Uint8Array([0, 1]);
    const rgba = toInkRgba(bits);
    expect([rgba[0], rgba[1], rgba[2], rgba[3]]).toEqual([
      DITHER_INK.r,
      DITHER_INK.g,
      DITHER_INK.b,
      255,
    ]);
    expect(rgba[7]).toBe(0); // second pixel's alpha byte
  });
});
