import { CATEGORY_ICONS, ALL_ICON } from '../lib/pixelIcons/categories.js';

// The six entries in the My Work sidebar, in the order they are shown.
//
// Built from CATEGORY_ICONS rather than written out again, so there is nowhere
// left to mistype an icon id: the ids live in one file that the icon tests
// check against the registry. Its own module rather than a second export from
// MyWorkExplorer.jsx because Fast Refresh only works on files that export
// components, and eslint enforces that.

const CATEGORY_LABELS = {
  work: 'Work',
  web: 'Web',
  app: 'App',
  tool: 'Tool',
  research: 'Research',
};

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: ALL_ICON },
  ...Object.entries(CATEGORY_ICONS).map(([id, icon]) => ({
    id,
    label: CATEGORY_LABELS[id],
    icon,
  })),
];
