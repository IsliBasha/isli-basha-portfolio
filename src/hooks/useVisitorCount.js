import { useEffect, useState } from 'react';

function getOrCreateSessionId() {
  const KEY = 'portfolio_sid';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export function useVisitorCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getOrCreateSessionId();

    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.count != null) setCount(Number(data.count));
      })
      .catch(() => {}); // counter is decorative — silent on error

    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
