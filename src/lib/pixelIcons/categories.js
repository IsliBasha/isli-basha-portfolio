// Which icon each project category is drawn with.
//
// This is the only place a category icon id is written down. MyWorkExplorer
// builds its sidebar from it and pixelIcons.test.js asserts every value here
// resolves to a registered icon, so a typo fails the suite instead of quietly
// painting the generic-exe placeholder six times over.
//
// Keys must match the categories used in src/data/projects.js.

export const CATEGORY_ICONS = {
  work: 'briefcase',
  web: 'globe-doc',
  app: 'app-window',
  tool: 'wrench',
  research: 'book-flask',
};

// "All" is not a category any project carries; it is the unfiltered view, and
// the one sidebar entry that changes icon when it is the active filter.
export const ALL_ICON = 'folder';
export const ALL_OPEN_ICON = 'folder-open';
