import { useCallback, useMemo, useState } from 'react';
import { WindowStackContext } from './windowStackContext.js';

export function WindowStackProvider({
  children,
  initialOrder = [],
  initialClosed = [],
}) {
  const [order, setOrder] = useState(initialOrder);
  const [hidden, setHidden] = useState(() => new Map());
  const [closed, setClosed] = useState(() => new Set(initialClosed));
  const [maximized, setMaximized] = useState(() => new Set());
  const [titles, setTitles] = useState(() => new Map());

  const bringToFront = useCallback((id) => {
    setOrder((prev) => {
      const without = prev.filter((x) => x !== id);
      return [...without, id];
    });
    setHidden((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    setClosed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const hide = useCallback((id, title = id) => {
    setHidden((prev) => {
      if (prev.has(id)) return prev;
      const next = new Map(prev);
      next.set(id, { title });
      return next;
    });
  }, []);

  const close = useCallback((id) => {
    setClosed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setHidden((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleMaximize = useCallback((id) => {
    setMaximized((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const registerTitle = useCallback((id, title) => {
    setTitles((prev) => {
      if (prev.get(id) === title) return prev;
      const next = new Map(prev);
      next.set(id, title);
      return next;
    });
  }, []);

  const getZ = useCallback(
    (id) => {
      const idx = order.indexOf(id);
      if (idx < 0) return 10;
      return 10 + idx;
    },
    [order],
  );

  const isHidden = useCallback((id) => hidden.has(id), [hidden]);
  const isClosed = useCallback((id) => closed.has(id), [closed]);
  const isMaximized = useCallback((id) => maximized.has(id), [maximized]);

  const hiddenWindows = useMemo(
    () => Array.from(hidden, ([id, meta]) => ({ id, title: meta.title })),
    [hidden],
  );

  const openWindows = useMemo(() => {
    // Stable display order: follow the original initialOrder so taskbar
    // entries don't shuffle every time the user clicks a different window.
    const activeId = [...order]
      .reverse()
      .find((id) => !hidden.has(id) && !closed.has(id));

    return initialOrder
      .filter((id) => !closed.has(id))
      .map((id) => ({
        id,
        title: titles.get(id) ?? hidden.get(id)?.title ?? id,
        hidden: hidden.has(id),
        active: id === activeId,
      }));
  }, [initialOrder, order, hidden, closed, titles]);

  const value = useMemo(
    () => ({
      bringToFront,
      hide,
      close,
      toggleMaximize,
      registerTitle,
      getZ,
      isHidden,
      isClosed,
      isMaximized,
      hiddenWindows,
      openWindows,
    }),
    [
      bringToFront,
      hide,
      close,
      toggleMaximize,
      registerTitle,
      getZ,
      isHidden,
      isClosed,
      isMaximized,
      hiddenWindows,
      openWindows,
    ],
  );

  return (
    <WindowStackContext.Provider value={value}>
      {children}
    </WindowStackContext.Provider>
  );
}
