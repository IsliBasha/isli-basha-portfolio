import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SevenSegment } from './SevenSegment.jsx';

const LIT = '#ff0000';
const UNLIT = '#400000';

/** The segment letters a rendered digit cell has lit, in a-to-g order. */
function litSegments(group) {
  return [...group.querySelectorAll('rect[data-lit="true"]')]
    .map((rect) => rect.getAttribute('data-seg'))
    .sort()
    .join('');
}

function digitGroups(container) {
  return [...container.querySelectorAll('g[data-digit]')];
}

/** What the display is showing, read back off the digit cells themselves. */
function shown(value, digits = 3) {
  const { container } = render(<SevenSegment value={value} digits={digits} />);
  return digitGroups(container)
    .map((group) => group.getAttribute('data-digit'))
    .join('');
}

describe('SevenSegment formatting', () => {
  it('zero-pads to the requested number of digits', () => {
    expect(shown(7)).toBe('007');
    expect(shown(0)).toBe('000');
  });

  it('clamps at the largest value the digits can show', () => {
    expect(shown(1000)).toBe('999');
    expect(shown(999)).toBe('999');
  });

  // Over-flagging a board drives the mine counter below zero, and the real
  // display spent its leading cell on a minus rather than growing a fourth.
  it('spends the leading cell on a minus for a negative value', () => {
    expect(shown(-1)).toBe('-01');
    expect(shown(-99)).toBe('-99');
    expect(shown(-1000)).toBe('-99');
  });

  it('never renders a fraction or a NaN as digits', () => {
    expect(shown(12.7)).toBe('012');
    expect(shown(Number.NaN)).toBe('000');
  });
});

describe('SevenSegment', () => {
  it('renders one digit cell per digit', () => {
    const { container } = render(<SevenSegment value={10} digits={3} />);
    expect(digitGroups(container)).toHaveLength(3);
    expect(digitGroups(container).map((g) => g.getAttribute('data-digit'))).toEqual([
      '0',
      '1',
      '0',
    ]);
  });

  it('lights the six outer strokes for a zero and leaves the middle bar dark', () => {
    const { container } = render(<SevenSegment value={0} digits={1} />);
    const [zero] = digitGroups(container);

    expect(litSegments(zero)).toBe('abcdef');
    expect(zero.querySelector('rect[data-seg="g"]').getAttribute('data-lit')).toBe('false');
  });

  it('lights all seven strokes for an eight', () => {
    const { container } = render(<SevenSegment value={8} digits={1} />);
    expect(litSegments(digitGroups(container)[0])).toBe('abcdefg');
  });

  it('lights only the middle bar for a minus', () => {
    const { container } = render(<SevenSegment value={-1} digits={3} />);
    const [minus] = digitGroups(container);

    expect(minus.getAttribute('data-digit')).toBe('-');
    expect(litSegments(minus)).toBe('g');
  });

  // A display that simply omitted its dark strokes would read as a floating
  // "1" rather than a numeral sitting in a slot.
  it('paints the unlit strokes instead of omitting them', () => {
    const { container } = render(<SevenSegment value={1} digits={1} />);
    const rects = [...digitGroups(container)[0].querySelectorAll('rect')];

    expect(rects).toHaveLength(7);
    expect(rects.filter((r) => r.getAttribute('fill') === LIT)).toHaveLength(2);
    expect(rects.filter((r) => r.getAttribute('fill') === UNLIT)).toHaveLength(5);
  });

  // The rectangles carry no reading, so the value has to exist as text for a
  // screen reader and for anything asserting on the counter's textContent.
  it('exposes the value as text alongside the silent SVG', () => {
    const { container } = render(<SevenSegment value={10} digits={3} />);

    expect(container.querySelector('.seven-seg__value').textContent).toBe('010');
    expect(container.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });

  it('draws on a black field with crisp edges', () => {
    const { container } = render(<SevenSegment value={0} digits={3} />);
    const svg = container.querySelector('svg');

    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
    expect(svg.querySelector('rect').getAttribute('fill')).toBe('#000000');
  });
});
