import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Builder worktrees live at .claude/worktrees/<name> — full checkouts of
    // other branches. Without this the run collects their suites too and
    // reports another branch's failures against this one.
    exclude: [...configDefaults.exclude, '.claude/**'],
    setupFiles: ['./src/test/setup.js'],
    css: false,
    // Node >= 25 ships its own `localStorage` global that reads as `undefined`
    // unless --localstorage-file is passed. Because the key already exists on
    // globalThis, the jsdom environment refuses to overwrite it and every
    // localStorage-backed test (window positions, Nokia high scores) breaks.
    // Turning the built-in off lets jsdom install the real Storage object.
    execArgv: ['--no-experimental-webstorage'],
  },
});
