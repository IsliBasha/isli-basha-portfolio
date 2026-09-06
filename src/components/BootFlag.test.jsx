import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BootFlag } from './BootFlag.jsx';
import {
  FRAMES,
  FLAG_WIDTH,
  FLAG_HEIGHT,
  validateFrames,
} from '../lib/bootFlagFrames.js';
import { PALETTE, TRANSPARENT } from '../lib/pixelIcons/palette.js';

function svgsFor(container) {
  return [...container.querySelectorAll('svg')];
}

describe('boot flag frames', () => {
  it('draws three sound frames', () => {
    expect(validateFrames()).toEqual([]);
  });

  it('reports what drifted rather than just failing', () => {
    const short = FRAMES.map((rows) => rows.slice(0, FLAG_HEIGHT - 1));
    expect(validateFrames(short)).toContain(
      `frame 1 is ${FLAG_HEIGHT - 1} rows, expected ${FLAG_HEIGHT}`,
    );

    const ragged = FRAMES.map((rows) => [...rows]);
    ragged[1][3] = ragged[1][3].slice(0, -1);
    expect(validateFrames(ragged)).toContain(
      `frame 2 row 3 is ${FLAG_WIDTH - 1} chars, expected ${FLAG_WIDTH}`,
    );

    // Two identical frames animate to a dead stop while every count and every
    // fill in this file stays exactly as it was.
    expect(validateFrames([FRAMES[0], FRAMES[0], FRAMES[2]])).toContain(
      'frames 1 and 2 are identical',
    );

    const empty = Array.from({ length: FLAG_HEIGHT }, () => TRANSPARENT.repeat(FLAG_WIDTH));
    const problems = validateFrames([empty, FRAMES[1], FRAMES[2]]);
    expect(problems.some((p) => p.startsWith('frame 1 paints'))).toBe(true);
    expect(problems).toContain('frame 1 never uses "r"');
  });

  // The paint floor and the required keys used to run on frame 1 alone, which
  // left the two frames that ARE the wave unchecked: an emptied frame 3 still
  // rendered, still differed from the others, and still passed.
  it('holds every frame to the paint floor, not just the first', () => {
    const empty = Array.from({ length: FLAG_HEIGHT }, () => TRANSPARENT.repeat(FLAG_WIDTH));

    const blankSecond = validateFrames([FRAMES[0], empty, FRAMES[2]]);
    expect(blankSecond.some((p) => p.startsWith('frame 2 paints'))).toBe(true);
    expect(blankSecond).toContain('frame 2 never uses "r"');

    const blankThird = validateFrames([FRAMES[0], FRAMES[1], empty]);
    expect(blankThird.some((p) => p.startsWith('frame 3 paints'))).toBe(true);
    expect(blankThird).toContain('frame 3 never uses "k"');
  });

  // A stray comma in a 28-row literal leaves a hole. The validator has to name
  // it like any other drift — a TypeError out of the check that exists to
  // report drift tells the reader nothing about which frame broke.
  it('reports a frame that is not an array instead of throwing', () => {
    for (const [label, frames] of [
      ['a hole', [FRAMES[0], , FRAMES[2]]], // eslint-disable-line no-sparse-arrays
      ['undefined', [FRAMES[0], undefined, FRAMES[2]]],
      ['a bare string', [FRAMES[0], 'not a frame', FRAMES[2]]],
    ]) {
      expect(() => validateFrames(frames), label).not.toThrow();
      expect(validateFrames(frames), label).toContain('frame 2 is not an array of rows');
    }
  });

  // The same stray comma one level down leaves a hole in a frame's rows, and a
  // row that came back a number reaches row.length. A forEach skips the hole
  // without a word and throws on the number — both have to come back named.
  it('reports a hole and a non-string row inside a frame', () => {
    const holed = [...FRAMES[0]];
    delete holed[5];
    expect(() => validateFrames([holed, FRAMES[1], FRAMES[2]]), 'a hole').not.toThrow();
    expect(validateFrames([holed, FRAMES[1], FRAMES[2]]), 'a hole').toContain(
      'frame 1 row 5 is not a string',
    );

    const numeric = [...FRAMES[1]];
    numeric[7] = FLAG_WIDTH;
    expect(() => validateFrames([FRAMES[0], numeric, FRAMES[2]]), 'a number').not.toThrow();
    expect(validateFrames([FRAMES[0], numeric, FRAMES[2]]), 'a number').toContain(
      'frame 2 row 7 is not a string',
    );
  });

  it('moves the wave and the trail between every pair of frames', () => {
    for (let i = 0; i < FRAMES.length; i += 1) {
      const next = FRAMES[(i + 1) % FRAMES.length];
      expect(FRAMES[i].join('\n')).not.toBe(next.join('\n'));
    }
  });
});

describe('BootFlag', () => {
  it('stacks one svg per frame, each on the 48x28 grid', () => {
    const { container } = render(<BootFlag />);
    const svgs = svgsFor(container);

    expect(svgs).toHaveLength(3);
    svgs.forEach((svg, i) => {
      expect(svg.getAttribute('viewBox')).toBe(`0 0 ${FLAG_WIDTH} ${FLAG_HEIGHT}`);
      expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
      expect(svg).toHaveClass('boot-flag__frame', `boot-flag__frame--${i + 1}`);
    });
  });

  it('is decorative — the splash already says "Starting Windows 95..."', () => {
    const { container } = render(<BootFlag />);
    expect(container.querySelector('.boot-flag').getAttribute('aria-hidden')).toBe('true');
  });

  it('paints every rect one row tall in a palette colour', () => {
    const { container } = render(<BootFlag />);
    const fills = new Set(Object.values(PALETTE));
    const rects = [...container.querySelectorAll('rect')];

    expect(rects.length).toBeGreaterThan(0);
    for (const rect of rects) {
      expect(rect.getAttribute('height')).toBe('1');
      expect(fills.has(rect.getAttribute('fill'))).toBe(true);
    }
  });

  // 677 painted pixels per frame merge to 245, 216 and 206 rects. The floor is
  // the point: a change that stops merging runs, or one that drops a frame's
  // content, still renders and would pass every other test here.
  it('merges each frame into more than 60 rects and fewer than one per pixel', () => {
    const { container } = render(<BootFlag />);
    for (const [i, svg] of svgsFor(container).entries()) {
      const rects = svg.querySelectorAll('rect').length;
      const painted = [...FRAMES[i].join('')].filter((ch) => ch !== TRANSPARENT).length;
      expect(rects).toBeGreaterThan(60);
      expect(rects).toBeLessThan(painted);
    }
  });

  it('paints each frame back to its own map', () => {
    const hexToKey = new Map(Object.entries(PALETTE).map(([key, hex]) => [hex, key]));
    const { container } = render(<BootFlag />);

    svgsFor(container).forEach((svg, i) => {
      const grid = Array.from({ length: FLAG_HEIGHT }, () =>
        Array(FLAG_WIDTH).fill(TRANSPARENT),
      );
      for (const rect of svg.querySelectorAll('rect')) {
        const x = Number(rect.getAttribute('x'));
        const y = Number(rect.getAttribute('y'));
        const width = Number(rect.getAttribute('width'));
        const key = hexToKey.get(rect.getAttribute('fill'));
        for (let n = 0; n < width; n += 1) grid[y][x + n] = key;
      }
      expect(grid.map((row) => row.join('')), `frame ${i + 1} does not round-trip`).toEqual(
        FRAMES[i],
      );
    });
  });
});
