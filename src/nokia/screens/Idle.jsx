import { NokiaShell, StatusHeader } from '../NokiaShell.jsx';
import { bio } from '../../data/bio.js';

// 02 IDLE — name as carrier text, title beneath, live clock in the header,
// blinking "press Menu". Tap anywhere or the Menu softkey opens the menu.
export function Idle({ time, onMenu }) {
  const [first, ...rest] = bio.name.toUpperCase().split(' ');
  const last = rest.join(' ');

  return (
    <NokiaShell
      header={<StatusHeader time={time} />}
      centerKey={{ label: 'Menu', action: onMenu }}
      onContentClick={onMenu}
      className="nk-screen--idle"
    >
      <div className="nk-idle">
        <div className="nk-idle__name">
          <span>{first}</span>
          {last && <span>{last}</span>}
        </div>
        <div className="nk-idle__title">{bio.title}</div>
        <div className="nk-idle__press">press Menu</div>
      </div>
    </NokiaShell>
  );
}
