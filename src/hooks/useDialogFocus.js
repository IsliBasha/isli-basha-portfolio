import { useCallback, useEffect, useRef } from 'react';

// Everything a Win95 dialog ever puts in front of the user. `[tabindex]` is in
// the list for the container-shaped controls; the filter below throws out the
// -1 ones that only exist to be focused by script.
const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]';

/**
 * The controls inside `root` that Tab would actually reach, in DOM order.
 *
 * The subtle one is radios. A radio group is a single tab stop: the browser
 * lands on whichever button is checked, and on the first one when none is.
 * Counting every radio as a stop is what let Shift+Tab off "Restart the
 * computer?" walk out of the Shut Down dialog and onto the page behind it --
 * the trap thought the first stop was still two elements away.
 */
function tabbableWithin(root) {
  if (!root) return [];
  const reachable = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (node) => !node.disabled && node.tabIndex >= 0,
  );
  const radios = reachable.filter((node) => node.type === 'radio');
  const groupsWithAChoice = new Set(
    radios.filter((node) => node.checked).map((node) => node.name),
  );
  return reachable.filter((node) => {
    if (node.type !== 'radio') return true;
    if (groupsWithAChoice.has(node.name)) return node.checked;
    return radios.find((radio) => radio.name === node.name) === node;
  });
}

/**
 * The modal behaviour every dialog on this desktop needs: focus something
 * useful on open, keep Tab inside, and leave on Escape.
 *
 * `initialFocusRef` names the control the dialog wants focused first -- Win95
 * put it on the default button, not always on the first field. Without one,
 * the first genuine tab stop gets it. A text field also gets its contents
 * selected, so typing replaces whatever was left from last time.
 *
 * Deliberately not a focus *guard*: it does not fight a click that lands
 * outside. Each dialog decides for itself what an outside click means.
 */
export function useDialogFocus({ open, onEscape, initialFocusRef }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const target = initialFocusRef?.current ?? tabbableWithin(dialogRef.current)[0];
    target?.focus();
    // Only text-holding controls implement this; on a button it is a no-op.
    target?.select?.();
  }, [open, initialFocusRef]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;
      const stops = tabbableWithin(dialogRef.current);
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onEscape],
  );

  return { dialogRef, onKeyDown };
}
