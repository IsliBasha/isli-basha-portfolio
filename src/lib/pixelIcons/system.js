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

const EXPLORER_ICONS = {
  folder,
  'folder-open': folderOpen,
  briefcase,
  'globe-doc': globeDoc,
  'app-window': appWindow,
  wrench,
  'book-flask': bookFlask,
  'generic-exe': genericExe,
};

/* ---------------------------------------------------------------------------
   Shell glyphs — Start menu, Run dialog and the system tray.

   The first eight are application icons, not menu decorations: order 07 hangs
   them on the matching window titlebars, so each one has to survive on its own
   at 16px next to a navy caption, not just as a label's left margin.
   --------------------------------------------------------------------------- */

/** Notepad — the lined pad behind about.txt. The spiral row is what stops it
 *  reading as the same white page as resume.pdf at 16px. */
const notepad = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwkwkwkwkwkwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwBBBBBBBBBwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwBBBBBBBBBwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwBBBBBBBwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwBBBBBBBBBwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** MS-DOS Prompt — a black console with a white chevron prompt and a block
 *  cursor. The silver strip along the top is the window's caption seen edge-on. */
const dos = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kwkkkkkkkkkkdk.',
  '.kwkwwkkkkkkkdk.',
  '.kwkkwwkkkkkkdk.',
  '.kwkkkwwkkkkkdk.',
  '.kwkkwwkkkkkkdk.',
  '.kwkwwkkkkkkkdk.',
  '.kwkkkkkkkkkkdk.',
  '.kwkkkkwwwwkkdk.',
  '.kwkkkkkkkkkkdk.',
  '.kwkkkkkkkkkkdk.',
  '.kwkkkkkkkkkkdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** Envelope — contact.exe. The V of the flap runs the full width of the face;
 *  a shallower fold disappears into the outline at this size. */
const mail = [
  '................',
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwkwwwwwwwwkdk.',
  '.kwwkwwwwwwkwdk.',
  '.kwwwkwwwwkwwdk.',
  '.kwwwwkwwkwwwdk.',
  '.kwwwwwkkwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/** resume.pdf — a page carrying the red Acrobat label block. The block, not
 *  the page, is the recognisable part, so it takes a third of the height. */
const pdf = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwkkkkkkkkkwdk.',
  '.kwkrrrrrrrkwdk.',
  '.kwkrrrrrrrkwdk.',
  '.kwkRRRRRRRkwdk.',
  '.kwkkkkkkkkkwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwddddddddwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwddddddwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** minesweeper.exe — the mine on its unswept tile. Drawn as a tile rather
 *  than a bare mine so the icon reads as the game, not as an explosive. */
const mine = [
  'wwwwwwwwwwwwwwww',
  'wggggggkkggggggd',
  'wggggggkkggggggd',
  'wgggggkkkkgggggd',
  'wggggkkkkkkggggd',
  'wgggkwwkkkkkgggd',
  'wggkkwwkkkkkkggd',
  'wgkkkkkkkkkkkkgd',
  'wgkkkkkkkkkkkkgd',
  'wggkkkkkkkkkkggd',
  'wgggkkkkkkkkgggd',
  'wggggkkkkkkggggd',
  'wgggggkkkkgggggd',
  'wggggggkkggggggd',
  'wggggggkkggggggd',
  'dddddddddddddddd',
];

/** snake.exe — the snake mid-turn on its black playfield with the apple it is
 *  heading for. A straight body would read as a bar chart. */
const snake = [
  'wwwwwwwwwwwwwwww',
  'wkkkkkkkkkkkkkkd',
  'wkkkkkkkkkkkkkkd',
  'wkkkkkkkkkkkkkkd',
  'wkkllllllkkkkkkd',
  'wkkllllllkkrrkkd',
  'wkkllkkkkkkrrkkd',
  'wkkllkkkkkkkkkkd',
  'wkkllllllllkkkkd',
  'wkkkkkkkkllkkkkd',
  'wkkkkkkkkllkkkkd',
  'wkkkkkkkkkkkkkkd',
  'wkkkkkkkkkkkkkkd',
  'wkkkkkkkkkkkkkkd',
  'wkkkkkkkkkkkkkkd',
  'dddddddddddddddd',
];

/** SiteCounter.exe — a navy bar chart climbing left to right, sitting on a
 *  grey baseline so the bars have something to stand on. */
const stats = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwwwBBwwdk.',
  '.kwwwwwwwBBwwdk.',
  '.kwwwwBBwBBwwdk.',
  '.kwwwwBBwBBwwdk.',
  '.kwBBwBBwBBwwdk.',
  '.kwBBwBBwBBwwdk.',
  '.kwBBwBBwBBwwdk.',
  '.kwBBwBBwBBwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kddddddddddddk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** Display Properties — a CRT on its stand, screen filled with the same navy
 *  the titlebars use so it reads as "the desktop's own settings". */
const display = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kwgkkkkkkkkgdk.',
  '.kwgkBBBBBBkgdk.',
  '.kwgkBBBBBBkgdk.',
  '.kwgkBBBBBBkgdk.',
  '.kwgkBBBBBBkgdk.',
  '.kwgkkkkkkkkgdk.',
  '.kwggggggggggdk.',
  '.kddddddddddddk.',
  '....kkkkkkkk....',
  '....kwggggdk....',
  '....kddddddk....',
  '..kkkkkkkkkkkk..',
  '................',
];

/** Find — a magnifier with an aqua lens and a handle running to the bottom
 *  right, the one diagonal in the set. */
const find = [
  '....kkkkk.......',
  '..kkwwwwwkk.....',
  '..kwccccccwk....',
  '.kwcccccccck....',
  '.kwcccccccck....',
  '.kwcccccccck....',
  '.kwcccccccck....',
  '..kwcccccckk....',
  '..kkwwwwwkkk....',
  '....kkkkkkdk....',
  '.........kddk...',
  '..........kddk..',
  '...........kddk.',
  '............kdk.',
  '............kk..',
  '................',
];

/** Help — a navy question mark on a white card. */
const help = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwBBBBwwwdk.',
  '.kwwwBBwwBBwwdk.',
  '.kwwwBBwwBBwwdk.',
  '.kwwwwwwwBBwwdk.',
  '.kwwwwwwBBwwwdk.',
  '.kwwwwwBBwwwwdk.',
  '.kwwwwwBBwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwBBwwwwdk.',
  '.kwwwwwBBwwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** Run — a program window with a green launch arrow across its face. */
const run = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kBBBBBBBBBBBBk.',
  '.kBBBBBBBBBBBBk.',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kwgllgggggggdk.',
  '.kwgllllgggggdk.',
  '.kwgllllllgggdk.',
  '.kwgllllllllgdk.',
  '.kwgllllllgggdk.',
  '.kwgllllgggggdk.',
  '.kwgllgggggggdk.',
  '.kddddddddddddk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** Shut Down — a power ring broken at the top for its stem. Maroon down the
 *  right-hand arc so the ring reads as round rather than as a flat letter O. */
const shutdown = [
  '................',
  '......krrk......',
  '......krrk......',
  '...kkkkrrkkkk...',
  '..kkrrkrrkRRkk..',
  '..krrkgrrgkRRk..',
  '.kkrrkgrrgkRRkk.',
  '.krrkggrrggkRRk.',
  '.krrkggrrggkRRk.',
  '.krrkggggggkRRk.',
  '.krrkggggggkRRk.',
  '.kkrrkggggkRRkk.',
  '..krrrkggkRRRk..',
  '..kkrrrrRRRRkk..',
  '....kkkkkkkk....',
  '................',
];

/** Tray speaker, sound on — cone plus two arcs. */
const speaker = [
  '................',
  '................',
  '..........k.....',
  '........k.k.....',
  '.....kkkk.k.k...',
  '....kkwgk.k.k...',
  '..kkkwggk.k.k...',
  '..kwwgggk.k.k...',
  '..kwwgggk.k.k...',
  '..kkkwggk.k.k...',
  '....kkwgk.k.k...',
  '.....kkkk.k.k...',
  '........k.k.....',
  '..........k.....',
  '................',
  '................',
];

/** Tray speaker, sound off — the same cone with the arcs replaced by a red
 *  cross. Swapping the arcs out rather than dimming them keeps the two states
 *  distinguishable at 16px and without colour. */
const speakerMuted = [
  '................',
  '................',
  '................',
  '................',
  '.....kkkk.......',
  '....kkwgk.r...r.',
  '..kkkwggk..r.r..',
  '..kwwgggk...r...',
  '..kwwgggk..r.r..',
  '..kkkwggk.r...r.',
  '....kkwgk.......',
  '.....kkkk.......',
  '................',
  '................',
  '................',
  '................',
];

/** Programs group — a folder with a program window resting on its face. */
const programs = [
  '................',
  '.kkkkk..........',
  '.kwyyk..........',
  '.kwyykkkkkkkkkk.',
  '.kwyyyyyyyyyyyk.',
  '.kwyyykkkkkkyYk.',
  '.kwyyykBBBBkyYk.',
  '.kwyyykwwwwkyYk.',
  '.kwyyykwwwwkyYk.',
  '.kwyyykkkkkkyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kYYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/** Documents group — a folder with a lined page standing out of it. */
const folderDocs = [
  '................',
  '.kkkkk..........',
  '.kwyyk.kkkkkk...',
  '.kwyykkwwwwwkkk.',
  '.kwyyyykwwwwwwk.',
  '.kwyyyykwBBBBwk.',
  '.kwyyyykwwwwwwk.',
  '.kwyyyykwBBBBwk.',
  '.kwyyyykwwwwwwk.',
  '.kwyyyykkkkkkkk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kYYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
];

/**
 * The Start button's flag — the boot splash's 48x28 wave compressed onto the
 * 16-grid, so the two Windows flags on the site are one drawing at two sizes.
 * Four panes inside a black outline that steps with the wave, split by a 1px
 * black cross, each pane carrying a single column of its dark twin a pixel in
 * from its left edge, where the boot flag's fold turns away from the light.
 *
 * Two things did not survive the compression. The trail is gone: on this grid
 * its squares are single loose pixels of red in the taskbar's silver, which
 * reads as dirt on the button rather than as paint flying off a flag, and the
 * three columns it wants are the ones that keep each pane a legible block. The
 * crest glints are gone for the inverse reason — one white pixel on a silver
 * button reads as a hole in the paint, not as light on it.
 *
 * Nine colours, where every other icon in this file stays at six or under:
 * four panes, their four dark twins, and the outline. Six would mean dropping
 * the twins, and a flag with no fold on this grid is four flat squares in a
 * cross.
 */
const startFlag = [
  '............kkkk',
  '...kkkkk...klllk',
  'kkkrrrrkkkkllllk',
  'krRrrrrklLlllllk',
  'krRrrrrklLlllllk',
  'krRrrrrklLlllllk',
  'krRrrrrklLllkkkk',
  'krRkkkkklLlkyyyk',
  'kkkbbbbkkkkyyyyk',
  'kbBbbbbkyYyyyyyk',
  'kbBbbbbkyYyyyyyk',
  'kbBbbbbkyYyyyyyk',
  'kbBbbbbkyYyykkkk',
  'kbBkkkkkyYyk....',
  'kkk.....kkk.....',
  '................',
];

export const SHELL_ICONS = {
  notepad,
  dos,
  mail,
  pdf,
  mine,
  snake,
  stats,
  display,
  find,
  help,
  run,
  shutdown,
  speaker,
  'speaker-muted': speakerMuted,
  programs,
  'folder-docs': folderDocs,
  'start-flag': startFlag,
};

export default { ...EXPLORER_ICONS, ...SHELL_ICONS };
