import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import './index.css';
import App from './App.jsx';
import { applyStoredWallpaper } from './hooks/useDisplaySettings.js';

inject();

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
