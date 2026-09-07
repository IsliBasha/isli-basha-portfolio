// Per-project icons, keyed by the project id in src/data/projects.js.
// Empty on purpose: order 08 fills this file. Until then every project falls
// back to its category icon from system.js, which is why the `icon` field
// holds a category id rather than a project id today.
//
// Ids added here must not collide with system.js or games.js — pixelIcons.test.js
// fails the build if two registries claim the same id.

export default {};
