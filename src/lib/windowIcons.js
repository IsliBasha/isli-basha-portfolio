// Window id -> the 16-unit PixelIcon that stands for it, everywhere the shell
// draws a picture of a window: the titlebar and the taskbar button.
//
// One map rather than two lists. The taskbar was still handing its button the
// window id as an AppGlyph `kind` and scaling the 32-unit artwork to 16, so
// about.txt wore a Notepad page in its titlebar and a differently-drawn one
// on the taskbar three inches below it -- and `display`, which AppGlyph has
// no artwork for, wore the generic-application fallback there.
//
// Its own module because DesktopApp.jsx exports a component, and a file that
// exports both a component and a constant breaks Vite's Fast Refresh
// (react-refresh/only-export-components) -- the same reason windowOrder.js
// and glyphKinds.js exist.
export const WINDOW_ICONS = Object.freeze({
  about: 'notepad',
  stack: 'dos',
  contact: 'mail',
  stats: 'stats',
  resume: 'pdf',
  minesweeper: 'mine',
  snake: 'snake',
  mywork: 'folder',
  display: 'display',
});
