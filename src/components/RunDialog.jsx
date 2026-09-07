import { useCallback, useId, useRef, useState } from 'react';
import { PixelIcon } from './PixelIcon.jsx';
import { SystemDialog } from './SystemDialog.jsx';
import { resolveRunTarget } from './runTargets.js';
import { useDialogFocus } from '../hooks/useDialogFocus.js';

// Browse… had a file picker behind it. The nearest thing this desktop has to a
// file system is the explorer, so that is what it opens.
const BROWSE_TARGET = 'mywork';

// Longer than any name the table can resolve, short enough that a pasted wall
// of text cannot set the not-found alert's title -- which is whatever was
// typed -- to something that pushes the dialog past the viewport.
const MAX_TYPED_LENGTH = 260;

const PROMPT =
  'Type the name of a program, folder, or document, and Windows will open it for you.';

function notFoundMessage(typed) {
  return `Cannot find the file '${typed}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.`;
}

/**
 * The Run dialog.
 *
 * Resolution lives here rather than in the caller so that "what happens when
 * the name is not a program" is one decision in one place: the failure is a
 * second dialog titled with what the user typed, exactly as Win95 reported it.
 *
 * Closing it does not restore focus. The Start menu unmounted in the same
 * commit that mounted this dialog, so the element that had focus before is
 * already gone and the browser has parked focus on <body>; StartMenu sends it
 * back to the Start button, which is the only thing still on screen.
 */
export function RunDialog({ open, onClose, onOpenWindow }) {
  const [value, setValue] = useState('');
  const [notFound, setNotFound] = useState(null);
  const inputRef = useRef(null);
  const titleId = useId();
  const promptId = useId();
  const fieldId = useId();

  // Every way out runs through here, which is why the box is cleared on the
  // way out rather than on the way in. Belt and braces since the Run chunk
  // went lazy: StartMenu now renders this only while it is the open dialog,
  // so it unmounts on the way out and React drops the state anyway. The reset
  // stays because "closing clears the box" is the behaviour rather than a
  // by-product of how the dialog happens to be mounted — while it was kept
  // mounted, reopening Run showed last time's failed name, selected and ready
  // to submit again, which is not what the box did.
  const dismiss = useCallback(() => {
    setValue('');
    setNotFound(null);
    onClose();
  }, [onClose]);

  const { dialogRef, onKeyDown } = useDialogFocus({
    open,
    onEscape: dismiss,
    initialFocusRef: inputRef,
  });

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const typed = value.trim();
      // An empty box is not a failed lookup: Win95's OK button simply did
      // nothing, and an alert titled with nothing helps no one.
      if (!typed) return;
      const target = resolveRunTarget(typed);
      if (!target) {
        setNotFound(typed);
        return;
      }
      onOpenWindow(target);
      dismiss();
    },
    [dismiss, onOpenWindow, value],
  );

  const handleBrowse = useCallback(() => {
    onOpenWindow(BROWSE_TARGET);
    dismiss();
  }, [dismiss, onOpenWindow]);

  // Stable identity so SystemDialog's own effects do not re-run on every
  // keystroke in the Open field.
  const dismissNotFound = useCallback(() => setNotFound(null), []);

  if (!open) return null;

  return (
    <>
      <div
        className="win-dialog-overlay"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) dismiss();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="win-dialog win-run"
          onKeyDown={onKeyDown}
        >
          <div className="win95-window__titlebar" style={{ margin: 2 }}>
            <span className="win95-window__title" id={titleId}>
              Run
            </span>
            <div className="win95-window__buttons" aria-hidden="true">
              <span className="win95-titlebar-btn">×</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="win-run__body">
              <PixelIcon id="run" size={32} className="win-dialog__icon" />
              <p id={promptId} className="win-run__prompt">
                {PROMPT}
              </p>
            </div>
            <div className="win-run__field">
              <label htmlFor={fieldId}>Open:</label>
              <input
                ref={inputRef}
                id={fieldId}
                type="text"
                className="win-field"
                autoComplete="off"
                spellCheck="false"
                maxLength={MAX_TYPED_LENGTH}
                aria-describedby={promptId}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <div className="win-run__actions">
              <button type="submit" className="win-btn">
                OK
              </button>
              <button type="button" className="win-btn" onClick={dismiss}>
                Cancel
              </button>
              <button type="button" className="win-btn" onClick={handleBrowse}>
                Browse…
              </button>
            </div>
          </form>
        </div>
      </div>
      <SystemDialog
        open={notFound !== null}
        title={notFound ?? ''}
        message={
          notFound === null ? '' : (
            <span className="win-run__error">{notFoundMessage(notFound)}</span>
          )
        }
        onClose={dismissNotFound}
      />
    </>
  );
}
