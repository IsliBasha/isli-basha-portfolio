import { useCallback, useState } from 'react';
import './nokia.css';
import { useHashRoute } from './useHashRoute.js';
import { useClock } from '../hooks/useClock.js';
import { Boot } from './screens/Boot.jsx';
import { Idle } from './screens/Idle.jsx';
import { Menu } from './screens/Menu.jsx';
import { ComingSoon } from './screens/ComingSoon.jsx';
import { About } from './screens/About.jsx';
import { WorkList } from './screens/WorkList.jsx';
import { WorkDetail } from './screens/WorkDetail.jsx';
import { Messages } from './screens/Messages.jsx';
import { Delivery } from './screens/Delivery.jsx';
import { Resume } from './screens/Resume.jsx';
import { Counter } from './screens/Counter.jsx';

const BOOT_FLAG = 'nokia_booted';
// #/work/:i detail routes carry the project index in the hash.
const WORK_DETAIL = /^\/work\/(\d+)$/;

function readBooted() {
  try {
    return sessionStorage.getItem(BOOT_FLAG) === '1';
  } catch {
    return false;
  }
}

export function NokiaApp() {
  const { route, navigate, replace, back } = useHashRoute();
  const time = useClock();
  const [booted, setBooted] = useState(readBooted);

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_FLAG, '1');
    } catch {
      /* private mode — boot just won't be remembered */
    }
    setBooted(true);
  }, []);

  const workDetailMatch = route.match(WORK_DETAIL);

  let screen;
  if (route === '/' && !booted) {
    screen = <Boot onDone={finishBoot} />;
  } else if (route === '/') {
    screen = <Idle time={time} onMenu={() => navigate('/menu')} />;
  } else if (route === '/menu') {
    screen = <Menu time={time} onSelect={(r) => navigate(r)} onBack={back} />;
  } else if (route === '/about') {
    screen = <About onBack={back} />;
  } else if (route === '/work') {
    screen = <WorkList onOpen={(i) => navigate(`/work/${i}`)} onBack={back} />;
  } else if (workDetailMatch) {
    // Paging replaces the hash so Back always returns to the list, not the
    // previously viewed project.
    const index = Number(workDetailMatch[1]);
    screen = (
      <WorkDetail
        index={index}
        onPage={(i) => replace(`/work/${i}`)}
        onBack={back}
      />
    );
  } else if (route === '/messages') {
    screen = (
      <Messages onSent={() => navigate('/messages/sent')} onBack={back} />
    );
  } else if (route === '/messages/sent') {
    screen = <Delivery onDone={() => navigate('/menu')} />;
  } else if (route === '/resume') {
    screen = <Resume onBack={back} />;
  } else if (route === '/counter') {
    screen = <Counter onBack={back} />;
  } else if (route === '/games') {
    // Games arrive in Phase 3 — keep the placeholder so the menu never dead-ends.
    screen = <ComingSoon title="6 Games" context={time} onBack={back} />;
  } else {
    // Unknown route — fall back to idle.
    screen = <Idle time={time} onMenu={() => navigate('/menu')} />;
  }

  return (
    <div className="nokia-root">
      {screen}
      <div className="nk-grid" aria-hidden="true" />
      <div className="nk-flash" aria-hidden="true" />
    </div>
  );
}
