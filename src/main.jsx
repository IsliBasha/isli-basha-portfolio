import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import './index.css';
import App from './App.jsx';
import { applyStoredWallpaper } from './hooks/useDisplaySettings.js';
import { installStaleChunkReload } from './lib/chunkReload.js';

inject();

// Before the app mounts, so a stale tab is fixed by the reload rather than by
// the visitor: a redeploy renames every hashed chunk, and the four lazy
// windows in this build fetch names that are no longer on the server.
installStaleChunkReload();

// Before the first render, not in an effect: an effect runs after paint, so a
// reload would show the default clouds for a frame and then swap to the chosen
// wallpaper. Display Properties' own hook only runs while that window is open.
//
// Wrapped because this is the last statement before the app mounts: a wallpaper
// is not worth a blank page, whatever a browser decides to throw here.
try {
  applyStoredWallpaper();
} catch {
  /* keep the default wallpaper and boot */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
