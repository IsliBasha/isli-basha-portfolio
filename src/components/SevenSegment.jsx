// The two LED readouts on the Minesweeper status bar. Drawn as SVG rectangles
// rather than set in a seven-segment webfont: a font would be a third family
// on a site whose whole type contract is Mono for chrome and Sans for prose,
// and at 24px a hinted glyph lands its strokes on fractional pixels while
// these rects sit on the grid.

const LIT = '#ff0000';
const UNLIT = '#400000';

// Every stroke a digit can light, in the usual clockwise-from-top order.
// x, y, width, height are in the per-digit 12x21 cell below.
const SEGMENTS = {
  a: [2, 0, 8, 3],
  b: [9, 2, 3, 8],
  c: [9, 11, 3, 8],
  d: [2, 18, 8, 3],
  e: [0, 11, 3, 8],
  f: [0, 2, 3, 8],
  g: [2, 9, 8, 3],
};

const SEGMENT_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const GLYPHS = {
  0: 'abcdef',
  1: 'bc',
  2: 'abged',
  3: 'abgcd',
  4: 'fgbc',
  5: 'afgcd',
  6: 'afgedc',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcfgd',
  '-': 'g',
};

const CELL_WIDTH = 12;
const CELL_HEIGHT = 21;
const CELL_GAP = 2;
const PADDING = 2;

/**
 * Format a value the way the real counters did: a fixed number of digit cells,
 * zero-padded, clamped to what the display can physically show. A negative
 * count (over-flagging on a full board) spends its leading cell on a minus and
 * pads the rest, so the readout never grows a fourth digit mid-game.
 *
 * Not exported: a second export from a file that also exports a component
 * breaks Fast Refresh for the whole module. The formatted string is on every
 * digit cell as `data-digit`, which is what the tests read.
 */
function formatSegments(value, digits) {
  const max = 10 ** digits - 1;
  const min = -(10 ** (digits - 1) - 1);
  const clamped = Math.max(min, Math.min(max, Math.trunc(Number(value) || 0)));
  if (clamped < 0) {
    return `-${String(-clamped).padStart(digits - 1, '0')}`;
  }
  return String(clamped).padStart(digits, '0');
}

/**
 * A red-on-black LED counter.
 *
 * Unlit segments are painted rather than omitted — a real display shows the
 * dark strokes of the digits it is not making, and without them a `1` reads as
 * a stray line instead of a numeral in a slot.
 */
export function SevenSegment({ value, digits = 3 }) {
  const text = formatSegments(value, digits);
  const width = PADDING * 2 + digits * CELL_WIDTH + (digits - 1) * CELL_GAP;
  const height = PADDING * 2 + CELL_HEIGHT;

  return (
    <span className="seven-seg">
      <svg
        className="seven-seg__display"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="0" y="0" width={width} height={height} fill="#000000" />
        {[...text].map((char, index) => {
          const lit = GLYPHS[char] ?? '';
          const originX = PADDING + index * (CELL_WIDTH + CELL_GAP);
          return (
            <g key={index} data-digit={char} transform={`translate(${originX} ${PADDING})`}>
              {SEGMENT_ORDER.map((name) => {
                const [x, y, w, h] = SEGMENTS[name];
                const on = lit.includes(name);
                return (
                  <rect
                    key={name}
                    data-seg={name}
                    data-lit={on ? 'true' : 'false'}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={on ? LIT : UNLIT}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      {/* The digits as text for a screen reader and for anything that reads the
          counter's textContent — the rectangles above carry no reading. */}
      <span className="seven-seg__value">{text}</span>
    </span>
  );
}
