// The three wave frames of the boot splash flag. Data, not chrome: it sits
// beside bootChime.js because the splash owns both, and out of the icon
// registry in pixelIcons/ because that registry is 16x16 by contract and this
// is 48x28.
import { PALETTE, TRANSPARENT } from './pixelIcons/palette.js';

export const FLAG_WIDTH = 48;
export const FLAG_HEIGHT = 28;

// Every frame must carry enough paint to be a flag rather than a stray rect,
// and one pixel of each pane colour plus the outline. Both numbers are floors,
// not targets: the drawn frames sit at 677 painted pixels each.
const MIN_PAINTED = 120;
const REQUIRED_KEYS = ['r', 'l', 'b', 'y', 'k'];

/**
 * The waving flag on the boot splash, drawn as three 48x28 pixel maps over the
 * icon palette in palette.js — the same 16 VGA colours and the same `.` for
 * "leave this pixel empty", so the splash teal shows through.
 *
 * Right two thirds: four panes (`r` red, `l` lime over `b` blue, `y` yellow)
 * inside a black outline that follows the wave, with each pane's dark twin
 * (`R L B Y`) down the columns the fold pushes away from the light and a
 * single `w` glint on each crest. Left third: the trail, squares of 1, 2 and
 * 3 pixels flying off to the left, smaller and sparser with distance.
 *
 * Between frames the wave advances one column and every trail square drifts
 * one pixel left, so swapping the three in order reads as one flag flapping
 * rather than three drawings. The swap is done with opacity in boot.css: the
 * wave lives in the maps, so nothing has to be transformed to make it move.
 */
export const FRAMES = [
  [
    '................................................',
    '...........................................kkk..',
    '.........................................kklllk.',
    '........ll................kkkkkk........klllwlk.',
    '........ll...............krrrrrkkk.....kllllllk.',
    '.................k.....kkrrrwrrkklkk.kklllllllk.',
    '............rrr..kkkkkkrrrrrrrrkkllLkLLlllllllk.',
    '............rrr..krRRRRrrrrrrrrkkllLLLLlllllllk.',
    '...l........rrr..krRRRRrrrrrrrrkkllLLLLlllllllk.',
    '.................krRRRRrrrrrrrrkkllLLLLlllllllk.',
    '.................krRRRRrrrrrrrrkkllLLLLlllllllk.',
    '.......rr........krRRRRrrrrrrrrkkllLLLLllllkkkk.',
    '..b....rr........krRRRRrrrrrrrrkkllLLLLllkkyyyk.',
    '.................krRRRRrrrkkkkkkkllLLLLlkyyyyyk.',
    '.............bbb.krRRRRrrkbbbbbkkklLLLLkyyyywyk.',
    '.............bbb.krRRRRkkbbbbbbkkykkLkkyyyyyyyk.',
    '..r..........bbb.kkkkkkbbbbbwbbkkyyYkYYyyyyyyyk.',
    '.................kbBBBBbbbbbbbbkkyyYYYYyyyyyyyk.',
    '.........yy......kbBBBBbbbbbbbbkkyyYYYYyyyyyyyk.',
    '.........yy......kbBBBBbbbbbbbbkkyyYYYYyyyyyyyk.',
    '.................kbBBBBbbbbbbbbkkyyYYYYyyyyYYYk.',
    '............lll..kbBBBBbbbbbbbbkkyyYYYYyyYYkkkk.',
    '....y.......lll..kbBBBBbbbBBBBBkkyyYYYYyYkk...k.',
    '............lll..kbBBBBbbBkkkkkkkYyYYYYYk.......',
    '.................kbBBBBBBk......kkYYYYYk........',
    '......bb.........kBBBBBkk.........kkYkk.........',
    '......bb..........kkkkk.............k...........',
    '................................................',
  ],
  [
    '................................................',
    '..........................................kkk...',
    '........................................kklllkk.',
    '.......ll................kkkkkk........klllwllk.',
    '.......ll................krrrrrkk......kllllllk.',
    '......................kkkrrwrrrkkkkkkkklllllllk.',
    '...........rrr...kkkkkrrrrrrrrrkklLLLLllllllllk.',
    '...........rrr...kRRRRrrrrrrrrrkklLLLLllllllllk.',
    '..l........rrr...kRRRRrrrrrrrrrkklLLLLllllllllk.',
    '.................kRRRRrrrrrrrrrkklLLLLllllllllk.',
    '.................kRRRRrrrrrrrrrkklLLLLllllllllk.',
    '......rr.........kRRRRrrrrrrrrrkklLLLLllllkkklk.',
    '.b....rr.........kRRRRrrrrrrrrrkklLLLLllkkyyykk.',
    '.................kRRRRrrrkkkkkkkklLLLLlkyyyyyyk.',
    '............bbb..kRRRRrrrbbbbbbkklLLLLlyyyywyyk.',
    '............bbb..kRRRRkkkbbbbbbkkkkkkkkyyyyyyyk.',
    '.r..........bbb..kkkkkbbbbbwbbbkkyYYYYyyyyyyyyk.',
    '.................kBBBBbbbbbbbbbkkyYYYYyyyyyyyyk.',
    '........yy.......kBBBBbbbbbbbbbkkyYYYYyyyyyyyyk.',
    '........yy.......kBBBBbbbbbbbbbkkyYYYYyyyyyyyyk.',
    '.................kBBBBbbbbbbbbbkkyYYYYyyyyYYYyk.',
    '...........lll...kBBBBbbbbbbbbbkkyYYYYyyYYkkkYk.',
    '...y.......lll...kBBBBbbbBBBBBBkkyYYYYyYkk...kk.',
    '...........lll...kBBBBbbbkkkkkkkkyYYYYyk........',
    '.................kBBBBBBk......kkYYYYYk.........',
    '.....bb..........kBBBBkkk........kkkkkk.........',
    '.....bb..........kkkkk..........................',
    '................................................',
  ],
  [
    '................................................',
    '.........................................kkk....',
    '.......................................kklllkk..',
    '......ll.................kkkkk.........kllwlllk.',
    '......ll................krrrrrkk......klllllllk.',
    '.....................kkkrrwrrrrkkkkkkkllllllllk.',
    '..........rrr....kkkkrrrrrrrrrrkkLLLLlllllllllk.',
    '..........rrr....kRRRrrrrrrrrrrkkLLLLlllllllllk.',
    '.l........rrr....kRRRrrrrrrrrrrkkLLLLlllllllllk.',
    '.................kRRRrrrrrrrrrrkkLLLLlllllllllk.',
    '.................kRRRrrrrrrrrrrkkLLLLlllllllllk.',
    '.....rr..........kRRRrrrrrrrrrrkkLLLLllllkkkllk.',
    'b....rr..........kRRRrrrrrrrrrrkkLLLLllkkyyykkk.',
    '.................kRRRrrrrkkkkkrkkLLLLllyyyyyyyk.',
    '...........bbb...kRRRrrrkbbbbbkkkLLLLlkyyywyyyk.',
    '...........bbb...kRRRkkkbbbbbbbkkkkkkkyyyyyyyyk.',
    'r..........bbb...kkkkbbbbbwbbbbkkYYYYyyyyyyyyyk.',
    '.................kBBBbbbbbbbbbbkkYYYYyyyyyyyyyk.',
    '.......yy........kBBBbbbbbbbbbbkkYYYYyyyyyyyyyk.',
    '.......yy........kBBBbbbbbbbbbbkkYYYYyyyyyyyyyk.',
    '.................kBBBbbbbbbbbbbkkYYYYyyyyYYYyyk.',
    '..........lll....kBBBbbbbbbbbbbkkYYYYyyYYkkkYYk.',
    '..y.......lll....kBBBbbbbBBBBBbkkYYYYyykk...kkk.',
    '..........lll....kBBBbbbBkkkkkBkkYYYYyk.......k.',
    '.................kBBBBBBk.....kkkYYYYYk.........',
    '....bb...........kBBBkkk........kkkkkk..........',
    '....bb...........kkkk...........................',
    '................................................',
  ],
];

/**
 * Everything about the three maps that has to hold for them to animate as one
 * flag, reported as a list of problems so a failure names what drifted. Hand
 * edits to a 48x28 map go wrong a character at a time — one row a pixel short
 * shears everything below it, and two identical frames stop the wave dead
 * without changing anything a rect count would see.
 *
 * Returns `[]` when the frames are sound.
 */
export function validateFrames(frames = FRAMES) {
  const problems = [];

  if (frames.length !== 3) {
    problems.push(`expected 3 frames, got ${frames.length}`);
    return problems;
  }

  // Indexed rather than forEach: a stray comma in the data above leaves a hole,
  // and forEach skips holes — the frame that went missing would be the one
  // frame nothing checked.
  for (let i = 0; i < frames.length; i += 1) {
    const rows = frames[i];
    const label = `frame ${i + 1}`;

    // Reported, not thrown: every other problem here comes back as a string,
    // and a validator that throws on the worst input is one the caller cannot
    // list the damage from.
    if (!Array.isArray(rows)) {
      problems.push(`${label} is not an array of rows`);
      continue;
    }

    if (rows.length !== FLAG_HEIGHT) {
      problems.push(`${label} is ${rows.length} rows, expected ${FLAG_HEIGHT}`);
    }
    // Indexed here for the same reason as the frames above, one level down: a
    // stray comma leaves a hole a forEach walks straight past, and a row that
    // is not a string reaches `row.length` and throws out of the check whose
    // whole job is to name what drifted.
    for (let y = 0; y < rows.length; y += 1) {
      const row = rows[y];
      if (typeof row !== 'string') {
        problems.push(`${label} row ${y} is not a string`);
        continue;
      }

      if (row.length !== FLAG_WIDTH) {
        problems.push(`${label} row ${y} is ${row.length} chars, expected ${FLAG_WIDTH}`);
      }
      for (const ch of row) {
        if (ch !== TRANSPARENT && !Object.hasOwn(PALETTE, ch)) {
          problems.push(`${label} row ${y} uses "${ch}", which is not a palette key`);
          break;
        }
      }
    }

    // Per frame, not on frame 1 alone: frames 2 and 3 are the wave, and a
    // paste that emptied either of them would animate as one flag and two
    // blanks with every other count in this file unchanged.
    const flat = rows.join('');
    const painted = [...flat].filter((ch) => ch !== TRANSPARENT).length;
    if (painted < MIN_PAINTED) {
      problems.push(`${label} paints ${painted} pixels, expected at least ${MIN_PAINTED}`);
    }
    for (const key of REQUIRED_KEYS) {
      if (!flat.includes(key)) problems.push(`${label} never uses "${key}"`);
    }
  }

  for (let i = 0; i < frames.length; i += 1) {
    if (!Array.isArray(frames[i])) continue;
    for (let j = i + 1; j < frames.length; j += 1) {
      if (!Array.isArray(frames[j])) continue;
      if (frames[i].join('\n') === frames[j].join('\n')) {
        problems.push(`frames ${i + 1} and ${j + 1} are identical`);
      }
    }
  }

  return problems;
}
