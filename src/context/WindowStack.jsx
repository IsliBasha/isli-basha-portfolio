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

  // Only ids the desktop actually renders may enter the stack. The Start menu
  // and the Run box can both name ids the desktop does not render (e.g. a typo,
  // or a launcher for a window that was removed), and an unknown id pushed onto
  // `order` sits at the top of it:
  // getZ hands the phantom the highest z-index on the desktop and every real
  // window is then measured against a stacking slot nothing occupies.
  const bringToFront = useCallback(
    (id) => {
      if (!initialOrder.includes(id)) return;
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
    },
    [initialOrder],
  );

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

  // The topmost window that is neither minimized nor closed. Drives both the
  // pressed taskbar task and the active/inactive titlebar colour.
  //
  // The initialOrder test is belt and braces: bringToFront now refuses an id
  // the desktop does not render, so nothing unknown reaches `order` in the
  // first place. It stays because electing a phantom is the expensive failure
  // -- every real window would match `activeId !== id`, leaving the desktop
  // with no active titlebar and no pressed taskbar task to click back.
  const activeId = useMemo(
    () =>
      [...order]
        .reverse()
        .find(
          (id) =>
            initialOrder.includes(id) && !hidden.has(id) && !closed.has(id),
        ) ?? null,
    [initialOrder, order, hidden, closed],
  );

  const openWindows = useMemo(() => {
    // Stable display order: follow the original initialOrder so taskbar
    // entries don't shuffle every time the user clicks a different window.
    return initialOrder
      .filter((id) => !closed.has(id))
      .map((id) => ({
        id,
        title: titles.get(id) ?? hidden.get(id)?.title ?? id,
        hidden: hidden.has(id),
        active: id === activeId,
      }));
  }, [initialOrder, activeId, hidden, closed, titles]);

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
      activeId,
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
      activeId,
    ],
  );

  return (
    <WindowStackContext.Provider value={value}>
      {children}
    </WindowStackContext.Provider>
  );
}
