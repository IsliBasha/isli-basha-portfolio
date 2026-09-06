// Game icons: the four Minesweeper faces plus the flag and the mine the board
// draws in a cell. Kept apart from system.js so the shell order and this one
// never touch the same lines.
//
// The two cell glyphs register as `ms-flag` and `ms-mine`: system.js already
// owns `mine` for the minesweeper.exe app icon, and index.js merges games over
// system, so a shared id would swap the Start menu's icon for the board's.
//
// Same rule as system.js — 16 rows of 16 characters over the keys in
// palette.js, a 1px black outline, light from the top-left. The faces share
// one disc so a swap between them reads as an expression change and not as a
// different button: only the pixels inside the outline move.

/** The 14px yellow disc every face is drawn inside. */
const FACE_ROWS = [
  '................',
  '.....kkkkkk.....',
  '...kkyyyyyykk...',
  '..kyyyyyyyyyyk..',
  '..kyyyyyyyyyyk..',
  '.kyyyyyyyyyyyyk.',
  '.kyyyyyyyyyyyyk.',
  '.kyyyyyyyyyyyyk.',
  '.kyyyyyyyyyyyyk.',
  '.kyyyyyyyyyyyyk.',
  '.kyyyyyyyyyyyyk.',
  '..kyyyyyyyyyyk..',
  '..kyyyyyyyyYYk..',
  '...kkyyyyYYkk...',
  '.....kkkkkk.....',
  '................',
];

/**
 * Draw features into the shared disc. `rows` is a sparse map of row index to
 * the 16-character line that replaces it, which keeps each face to the four or
 * five lines that actually differ — a full second copy of the disc per face
 * drifts a pixel at a time and nothing catches it.
 */
function face(rows) {
  return FACE_ROWS.map((row, y) => rows[y] ?? row);
}

/** Resting face: two square eyes and a wide smile. */
const faceIdle = face({
  6: '.kyyykkyykkyyyk.',
  7: '.kyyykkyykkyyyk.',
  10: '.kyykyyyyyykyyk.',
  11: '..kyykkkkkkyyk..',
});

/** The "oh" face Win95 pulled while a cell was held down. */
const faceO = face({
  6: '.kyyykkyykkyyyk.',
  7: '.kyyykkyykkyyyk.',
  9: '.kyyyykkkkyyyyk.',
  10: '.kyyyykyykyyyyk.',
  11: '..kyyykyykyyyk..',
  12: '..kyyykkkkyyyk..',
});

/** Win: the sunglasses. The lenses taper so the band reads as two lenses. */
const faceWin = face({
  6: '.kykkkkkkkkkkyk.',
  7: '.kykkkkyykkkkyk.',
  8: '.kyykkyyyykkyyk.',
  10: '.kyykyyyyyykyyk.',
  11: '..kyykkkkkkyyk..',
});

/** Loss: X eyes over a flat mouth with the corners turned down. */
const faceDead = face({
  5: '.kyykykyykykyyk.',
  6: '.kyyykyyyykyyyk.',
  7: '.kyykykyykykyyk.',
  10: '.kyyykkkkkkyyyk.',
  11: '..kykyyyyyykyk..',
});

/**
 * The flag a right-click plants. Red pennant on a black staff with a stepped
 * base — at 16px a solid triangle reads better than an outlined one, so the
 * maroon lower half is the only shading it gets.
 */
const flag = [
  '................',
  '................',
  '........k.......',
  '......rrk.......',
  '....rrrrk.......',
  '..rrrrrrk.......',
  '....RRRRk.......',
  '......RRk.......',
  '........k.......',
  '........k.......',
  '........k.......',
  '......kkkkk.....',
  '.....kkkkkkk....',
  '................',
  '................',
  '................',
];

/**
 * The mine under it. Four spikes and a white glint at ten o'clock; the gray
 * pixels on the lower right are the only thing that makes the ball read as a
 * sphere rather than a blob at this size.
 */
const mine = [
  '................',
  '................',
  '.......kk.......',
  '.......kk.......',
  '......kkkk......',
  '.....kwwkkk.....',
  '....kkwkkkkk....',
  '..kkkkkkkkkkkk..',
  '..kkkkkkkkkkkk..',
  '....kkkkkddk....',
  '.....kkkddk.....',
  '......kkkk......',
  '.......kk.......',
  '.......kk.......',
  '................',
  '................',
];

export default {
  'face-idle': faceIdle,
  'face-o': faceO,
  'face-win': faceWin,
  'face-dead': faceDead,
  'ms-flag': flag,
  'ms-mine': mine,
};
