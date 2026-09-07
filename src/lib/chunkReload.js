// Recorded in sessionStorage rather than in a module variable: the whole point
// is to survive the reload it triggers, and a module variable is reset by it.
export const STALE_CHUNK_KEY = 'isli-chunk-reloaded';

function reloadDocument() {
  window.location.reload();
}

/**
 * Reload once when a lazily loaded chunk cannot be fetched.
 *
 * Vite fires `vite:preloadError` on the window exactly when a hashed chunk
 * 404s, which is what a redeploy does to every tab that was already open: the
 * document in front of the visitor names chunk hashes that no longer exist on
 * the server, so the first click on resume.pdf or Shut Down… fetches nothing.
 * A reload picks up the new index and its new hashes, and the click works.
 *
 * Guarded, because the same event fires when a chunk is genuinely gone -- a
 * half-uploaded deploy, an offline device -- and an unguarded reload there is
 * an infinite loop on a page the visitor cannot leave. One attempt per
 * session; after that the error is left to propagate, and ChunkBoundary turns
 * it into a dialog over a desktop that still works.
 *
 * `target` and `reload` are injected so a test can drive this without
 * navigating the runner, the same seam StartMenu and ShutDown use.
 *
 * Returns the uninstaller.
 */
export function installStaleChunkReload({
  target = window,
  reload = reloadDocument,
} = {}) {
  const onPreloadError = () => {
    let alreadyTried;
    try {
      alreadyTried = window.sessionStorage.getItem(STALE_CHUNK_KEY) === '1';
      if (!alreadyTried) window.sessionStorage.setItem(STALE_CHUNK_KEY, '1');
    } catch {
      // Storage refused. Without somewhere to record the attempt there is no
      // way to tell the first reload from the fiftieth, so do not start: a
      // dialog over a live desktop beats a page that reloads for ever.
      return;
    }
    if (alreadyTried) return;
    reload();
  };

  target.addEventListener('vite:preloadError', onPreloadError);
  return () => target.removeEventListener('vite:preloadError', onPreloadError);
}
