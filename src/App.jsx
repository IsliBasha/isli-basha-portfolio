import { useIsMobile } from './nokia/useIsMobile.js';
import { DesktopApp } from './DesktopApp.jsx';
import { NokiaApp } from './nokia/NokiaApp.jsx';

// The site is two worlds, gated purely by viewport width:
//   > 768px  -> the Win95 desktop (DesktopApp)
//   <= 768px -> the Nokia 3310 mobile port (NokiaApp)
// Only one tree mounts at a time, so neither world can interfere with the other.
export default function App() {
  const isMobile = useIsMobile();
  return isMobile ? <NokiaApp /> : <DesktopApp />;
}
