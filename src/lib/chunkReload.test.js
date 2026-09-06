import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { installStaleChunkReload, STALE_CHUNK_KEY } from './chunkReload.js';

const here = dirname(fileURLToPath(import.meta.url));
const mainSource = readFileSync(resolve(here, '../main.jsx'), 'utf8');

let uninstall = () => {};

/** Vite dispatches this on the window when a hashed chunk cannot be fetched. */
const firePreloadError = () =>
  window.dispatchEvent(new Event('vite:preloadError'));

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  uninstall();
  uninstall = () => {};
  vi.restoreAllMocks();
  window.sessionStorage.clear();
});

describe('reloading a tab whose chunks were redeployed away', () => {
  it('reloads on the first preload error', () => {
    const reload = vi.fn();
    uninstall = installStaleChunkReload({ reload });

    firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(STALE_CHUNK_KEY)).toBe('1');
  });

  it('reloads once per session, not once per failed chunk', () => {
    // Four surfaces are lazy, and a deploy takes all four chunks at once. An
    // unguarded listener reloads on the first, the reloaded page fails the
    // same way if the chunk is genuinely gone, and the tab never settles.
    const reload = vi.fn();
    uninstall = installStaleChunkReload({ reload });

    firePreloadError();
    firePreloadError();
    firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('remembers across the reload it triggered, not just across one listener', () => {
    // The flag is in sessionStorage rather than a module variable because the
    // reload wipes the module. Standing in for the reloaded page here.
    const reload = vi.fn();
    installStaleChunkReload({ reload })();
    window.sessionStorage.setItem(STALE_CHUNK_KEY, '1');
    uninstall = installStaleChunkReload({ reload });

    firePreloadError();

    expect(reload).not.toHaveBeenCalled();
  });

  it('does not reload at all when storage refuses to remember', () => {
    // No flag means no way to tell the first reload from the fiftieth. A
    // dialog from ChunkBoundary over a live desktop beats an endless loop.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    const reload = vi.fn();
    uninstall = installStaleChunkReload({ reload });

    expect(() => firePreloadError()).not.toThrow();

    expect(reload).not.toHaveBeenCalled();
  });

  it('stops listening once uninstalled', () => {
    const reload = vi.fn();
    installStaleChunkReload({ reload })();

    firePreloadError();

    expect(reload).not.toHaveBeenCalled();
  });

  it('is installed by main.jsx, where the app actually boots', () => {
    // The listener is only worth anything if it is registered before the first
    // click that can fail. Read the entry point back rather than trusting it.
    expect(mainSource).toMatch(
      /import \{ installStaleChunkReload \} from '\.\/lib\/chunkReload\.js';/,
    );
    expect(mainSource).toMatch(/^installStaleChunkReload\(\);$/m);
  });
});
