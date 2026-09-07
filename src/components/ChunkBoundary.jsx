import { Component } from 'react';
import { createPortal } from 'react-dom';
import { SystemDialog } from './SystemDialog.jsx';

// The window's own words for it. A lazy chunk that will not load is, from the
// desktop's point of view, a file that is not where the shortcut says it is --
// which is what Win95 said about it, and what Run… still says about a name it
// cannot resolve.
const CHUNK_ERROR_MESSAGE =
  'Cannot find a file needed to open this window. It may have moved during ' +
  'an update — reload to fix it.';

// What the window frame keeps saying after the dialog is gone. Without it a
// window whose chunk died is pixel-identical to one still loading: an empty
// frame that never fills, with nothing on screen to say the difference.
const CHUNK_FRAME_NOTE = 'Cannot open this window — reload the page to fix it.';

/**
 * Catches a failed React.lazy import so one missing chunk costs one window
 * rather than the page.
 *
 * Without a boundary anywhere above them, a rejected import propagates to the
 * root and React unmounts the whole tree: the desktop, the taskbar and the
 * boot flag all go, and the visitor is left on a blank white document with no
 * way back but a manual reload. Four surfaces are lazy (ResumeViewer,
 * DisplayProperties, RunDialog, ShutDown) and every one of them 404s the
 * moment a redeploy renames its hashed chunk under an open tab.
 *
 * The dialog is dismissible and does not retry: React.lazy caches the
 * rejection, so re-rendering the child would throw again in the same commit.
 * OK leaves the window empty behind CHUNK_FRAME_NOTE; main.jsx's preload-error
 * listener is what actually fixes a stale tab, by reloading it once.
 *
 * `failed` is per instance and is never cleared, so a caller whose boundary
 * outlives the thing it wraps has to remount it -- `key` on whatever chooses
 * the child, and `onDismiss` to reset that choice when the visitor clicks OK.
 * StartMenu is the case: its boundary is mounted for the life of the page
 * whether a dialog is open or not, so without the pair, one dead Run… left
 * every later Start-menu dialog rendering nothing at all.
 *
 * `hasWindowFrame` is false for a boundary whose children are portalled
 * somewhere without a frame of their own -- the note would be a loose line of
 * text on the desktop rather than something inside a window.
 */
export class ChunkBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, dismissed: false };
    this.dismiss = () => {
      this.setState({ dismissed: true });
      this.props.onDismiss?.();
    };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // The visitor gets the dialog; the console gets the reason, in dev only.
    // A production console is not a bug tracker, and this one is reported by
    // whoever deployed the build that moved the chunk.
    if (import.meta.env.DEV) {
      console.error('[chunk] a lazily loaded window failed to arrive', error);
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const { hasWindowFrame = true } = this.props;
    // The dialog is portalled to the body, and the window content left to the
    // note. SystemDialog traps Tab and Escape on `window`, so it is a modal
    // over the whole desktop whatever it is drawn inside -- and drawn inside,
    // it would be drawn wrong: a <Window> sets `translate`, which makes it the
    // containing block for the overlay's `position: fixed`, and a maximized
    // one clips it with `overflow: auto` on top of that.
    return (
      <>
        {hasWindowFrame ? (
          <p className="chunk-error-note">{CHUNK_FRAME_NOTE}</p>
        ) : null}
        {createPortal(
          <SystemDialog
            open={!this.state.dismissed}
            title="Error"
            message={CHUNK_ERROR_MESSAGE}
            onClose={this.dismiss}
          />,
          document.body,
        )}
      </>
    );
  }
}
