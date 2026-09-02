// Every `kind` AppGlyph draws dedicated artwork for. A kind outside this list
// still renders -- AppGlyph falls back to a generic application window -- but
// this is what callers and tests enumerate against.
//
// It lives here rather than in AppGlyph.jsx because a file that exports both a
// component and a constant breaks Vite's Fast Refresh
// (react-refresh/only-export-components).
export const GLYPH_KINDS = [
  'about',
  'projects',
  'stack',
  'contact',
  'resume',
  'minesweeper',
  'stats',
  'snake',
  'mywork',
];
