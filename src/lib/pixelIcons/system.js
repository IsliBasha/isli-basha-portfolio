// System icons: the shell furniture and the five project-category icons the
// explorer needs. Order 04 appends its shell glyphs here.
//
// Each map is 16 rows of 16 characters over the keys in palette.js. They are
// drawn to one rule so a row of them reads as one set: a 1px black outline,
// light coming from the top-left (a `w` column down the left edge, a `d`
// column down the right), and flat fills in between — no gradients, no
// anti-aliasing, nothing a 1995 VGA palette could not have shown.

/** Closed folder — the "All" category, and the shape everything else varies. */
const folder = [
  '................',
  '.kkkkk..........',
  '.kwyyk..........',
  '.kwyykkkkkkkkkk.',
  '.kwyyyyyyyyyyyk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kYYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/**
 * Open folder — the selected "All" category. The back plate stays olive and
 * the front flap swings out to the right in bright yellow, which is the only
 * cue that survives at 16px; a lighter fill alone would not read as open.
 */
const folderOpen = [
  '................',
  '.kkkkk..........',
  '.kwYYk..........',
  '.kwYYkkkkkkkkkk.',
  '.kwYYYYYYYYYYYk.',
  '.kwYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '..kyyyyyyyyyyykk',
  '..kyyyyyyyyyyyyk',
  '...kyyyyyyyyyyyk',
  '...kyyyyyyyyyyyk',
  '....kyyyyyyyyyyk',
  '....kyyyyyyyyyyk',
  '....kkkkkkkkkkkk',
  '................',
  '................',
];

/** Briefcase — the "Work" category: employed and client work. */
const briefcase = [
  '................',
  '................',
  '.....kkkkkk.....',
  '.....k....k.....',
  '.kkkkkkkkkkkkkk.',
  '.kwrrrrrrrrrrRk.',
  '.kwrrrrrrrrrrRk.',
  '.kwrrrrrrrrrrRk.',
  '.kkkkkkyykkkkkk.',
  '.kwrrrrrrrrrrRk.',
  '.kwrrrrrrrrrrRk.',
  '.kwrrrrrrrrrrRk.',
  '.kRRRRRRRRRRRRk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/**
 * Page with a globe — the "Web" category: sites that are live on the net.
 *
 * The globe is a blue-rimmed aqua disc with a landmass and one equator line.
 * An earlier draft used a dark disc crossed by bright meridians, which at 32px
 * read as a plus sign in a box rather than a sphere: at this size the rim is
 * what makes it round, not the grid lines.
 */
const globeDoc = [
  '................',
  '..kkkkkkkkkkkk..',
  '..kwwwwwwwwwwk..',
  '..kwwwbbbbwwwk..',
  '..kwwbccccbwwk..',
  '..kwbcccLLcbwk..',
  '..kwbccLLLcbwk..',
  '..kwbbbbbbbbwk..',
  '..kwbccLLccbwk..',
  '..kwwbccccbwwk..',
  '..kwwwbbbbwwwk..',
  '..kwwwwwwwwwwk..',
  '..kwddddddwwwk..',
  '..kwddddddddwk..',
  '..kkkkkkkkkkkk..',
  '................',
];

/** Application window — the "App" category: things a person launches. */
const appWindow = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kBBBBBBBBBBggk.',
  '.kBBBBBBBBBBggk.',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kwggggggggggdk.',
  '.kwggkkkkkkggdk.',
  '.kwggkwwwwkggdk.',
  '.kwggkwwwwkggdk.',
  '.kwggkkkkkkggdk.',
  '.kwggggggggggdk.',
  '.kwggggggggggdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/**
 * Open-end wrench — the "Tool" category: things other developers run.
 *
 * The jaw is four rows deep with a three-pixel gap between the prongs. A
 * shallower jaw, which is what the first draft had, closes up at 32px and the
 * whole icon reads as a zigzag; the gap is the entire silhouette.
 */
const wrench = [
  '.kkk...kkk......',
  '.kwk...kdk......',
  '.kwk...kdk......',
  '.kwk...kdk......',
  '.kwkkkkkdk......',
  '.kwgggggdk......',
  '.kwgggggdk......',
  '..kwgggdk.......',
  '...kwggdk.......',
  '....kwggdk......',
  '.....kwggdk.....',
  '......kwggdk....',
  '.......kwggdk...',
  '........kwggdk..',
  '........kkkkkk..',
  '................',
];

/**
 * Flask standing on a book — the "Research" category. Two objects rather than
 * one because a flask alone reads as chemistry and a book alone as reading;
 * the pair is what says "study".
 */
const bookFlask = [
  '..........kkkk..',
  '..........kwwk..',
  '..........kwwk..',
  '..........kwwk..',
  '.........kwwwwk.',
  '........kwwwwwwk',
  '........kwllllwk',
  '........kllllllk',
  '........kkkkkkkk',
  'kkkkkkkkkk......',
  'kBbbbbbbbk......',
  'kBbbbbbbbk......',
  'kBbbbbbbbk......',
  'kBbbbbbbbk......',
  'kBwwwwwwwk......',
  'kkkkkkkkkk......',
];

/**
 * Plain program window — what getIcon() falls back to. Deliberately the least
 * interesting shape in the set: it should look like "no icon was found",
 * never like a category.
 */
const genericExe = [
  '................',
  '................',
  '..kkkkkkkkkkkk..',
  '..kBBBBBBBBBBk..',
  '..kBBBBBBBBBBk..',
  '..kkkkkkkkkkkk..',
  '..kwggggggggdk..',
  '..kwggggggggdk..',
  '..kwggggggggdk..',
  '..kwggggggggdk..',
  '..kwggggggggdk..',
  '..kwggggggggdk..',
  '..kddddddddddk..',
  '..kkkkkkkkkkkk..',
  '................',
  '................',
];

export default {
  folder,
  'folder-open': folderOpen,
  briefcase,
  'globe-doc': globeDoc,
  'app-window': appWindow,
  wrench,
  'book-flask': bookFlask,
  'generic-exe': genericExe,
};
