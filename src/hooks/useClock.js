import { useEffect, useState } from 'react';

const formatHHMM = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export function useClock() {
  const [time, setTime] = useState(() => formatHHMM(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatHHMM(new Date()));
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return time;
}
