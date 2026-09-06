// What the Run dialog will accept as the name of something on this machine.
//
// Every alias resolves to a WindowStack id. The ids are the same ones the
// Start menu and the desktop shortcuts use, so a name that opens a window here
// opens the same window everywhere.

const ALIASES = [
  ['about.txt', 'about'],
  ['notepad', 'about'],
  ['cmd', 'stack'],
  ['command', 'stack'],
  ['ms-dos prompt', 'stack'],
  ['contact.exe', 'contact'],
  ['mail', 'contact'],
  ['resume.pdf', 'resume'],
  ['resume', 'resume'],
  ['minesweeper.exe', 'minesweeper'],
  ['winmine', 'minesweeper'],
  ['snake.exe', 'snake'],
  ['my work', 'mywork'],
  ['explorer', 'mywork'],
  ['projects', 'mywork'],
  ['sitecounter.exe', 'stats'],
  ['display', 'display'],
  ['display properties', 'display'],
];

/**
 * Alias -> window id. Every `.exe` alias is registered a second time without
 * the extension, because DOS never made anyone type it and a Run box that
 * rejects `snake` while accepting `snake.exe` would read as broken.
 *
 * Null-prototype: the typed string reaches this map directly, and on a plain
 * object `TARGETS['constructor']` answers with a function that is not a
 * window id.
 */
export const RUN_TARGETS = ALIASES.reduce((acc, [alias, id]) => {
  acc[alias] = id;
  if (alias.endsWith('.exe')) acc[alias.slice(0, -'.exe'.length)] = id;
  return acc;
}, Object.create(null));

/**
 * Resolve what the user typed to a window id, or null when nothing matches.
 *
 * Case and surrounding whitespace are ignored: Win95 matched paths that way,
 * and `SNAKE.EXE` with a trailing space is what a keyboard actually produces.
 */
export function resolveRunTarget(input) {
  if (typeof input !== 'string') return null;
  const key = input.trim().toLowerCase();
  if (!key) return null;
  return Object.hasOwn(RUN_TARGETS, key) ? RUN_TARGETS[key] : null;
}
