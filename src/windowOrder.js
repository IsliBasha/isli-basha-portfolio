// The window registry: every id DesktopApp mounts a <Window> for, in the
// z-order the stack starts in, plus the ones that start closed.
//
// `stats` is the one window missing from INITIALLY_CLOSED on purpose —
// SiteCounter.exe is open on the desktop when the machine finishes booting,
// the way a Win95 box came up with something already running.
//
// It lives in its own module rather than in DesktopApp.jsx because a file that
// exports both a component and a constant breaks Vite's Fast Refresh
// (react-refresh/only-export-components), the same reason glyphKinds.js exists.
export const WINDOW_ORDER = [
  'about',
  'stack',
  'contact',
  'stats',
  'resume',
  'minesweeper',
  'snake',
  'mywork',
  'display',
];

export const INITIALLY_CLOSED = [
  'about',
  'stack',
  'contact',
  'resume',
  'minesweeper',
  'snake',
  'mywork',
  'display',
];
