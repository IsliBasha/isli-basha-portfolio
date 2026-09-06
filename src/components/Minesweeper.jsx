import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBoard,
  revealCell,
  toggleFlag,
  countFlags,
} from '../lib/minesweeper.js';
import { PixelIcon } from './PixelIcon.jsx';
import { SevenSegment } from './SevenSegment.jsx';
import { SystemDialog } from './SystemDialog.jsx';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

// Win95's counters were three digits and stopped there; the timer wrapped at
// 999 rather than growing the display.
const COUNTER_DIGITS = 3;
const MAX_SECONDS = 999;

const HELP_TEXT =
  'Minesweeper — sys95 edition. Left-click to reveal, right-click to flag.';

const NUMBER_COLORS = {
  1: '#0000ff',
  2: '#008000',
  3: '#ff0000',
  4: '#000080',
  5: '#800000',
  6: '#008080',
  7: '#000000',
  8: '#808080',
};

const FACE_FOR_STATUS = {
  playing: 'face-idle',
  won: 'face-win',
  lost: 'face-dead',
};

function CellView({ cell, status, onReveal, onToggleFlag }) {
  const disabled = status !== 'playing';

  const handleClick = (event) => {
    event.preventDefault();
    if (disabled) return;
    if (cell.isFlagged) return;
    onReveal(cell.row, cell.col);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (disabled) return;
    if (cell.isRevealed) return;
    onToggleFlag(cell.row, cell.col);
  };

  const classes = ['ms-cell'];
  if (cell.isRevealed) classes.push('ms-cell--revealed');
  if (cell.isRevealed && cell.isMine) classes.push('ms-cell--mine');

  let content = null;
  let colorStyle;
  if (cell.isRevealed) {
    if (cell.isMine) content = <PixelIcon id="ms-mine" size={16} />;
    else if (cell.adjacent > 0) {
      content = String(cell.adjacent);
      colorStyle = { color: NUMBER_COLORS[cell.adjacent] };
    }
  } else if (cell.isFlagged) {
    content = <PixelIcon id="ms-flag" size={16} />;
  }

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={`Cell ${cell.row + 1},${cell.col + 1}`}
      data-revealed={cell.isRevealed ? 'true' : 'false'}
      data-flagged={cell.isFlagged ? 'true' : 'false'}
      className={classes.join(' ')}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={colorStyle}
    >
      {content}
    </button>
  );
}

export function Minesweeper() {
  const [board, setBoard] = useState(() =>
    createBoard({ rows: ROWS, cols: COLS, mines: MINES }),
  );
  const [status, setStatus] = useState('playing');
  const [seconds, setSeconds] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const startedRef = useRef(false);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  useEffect(() => {
    if (status !== 'playing') stopTimer();
  }, [status, stopTimer]);

  // A press that ends outside the board still ends: without this the face
  // would stay in its "oh" state until the next click anywhere on the grid.
  useEffect(() => {
    if (!pressing) return undefined;
    const release = () => setPressing(false);
    window.addEventListener('mouseup', release);
    return () => window.removeEventListener('mouseup', release);
  }, [pressing]);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => Math.min(MAX_SECONDS, s + 1));
    }, 1000);
  }, []);

  const handleReveal = useCallback(
    (row, col) => {
      if (!startedRef.current) {
        startedRef.current = true;
        const fresh = createBoard({
          rows: ROWS,
          cols: COLS,
          mines: MINES,
          safeStart: { row, col },
        });
        const { board: revealed, status: nextStatus } = revealCell(
          fresh,
          row,
          col,
        );
        setBoard(revealed);
        setStatus(nextStatus);
        if (nextStatus === 'playing') startTimer();
        return;
      }
      setBoard((prev) => {
        const { board: next, status: nextStatus } = revealCell(prev, row, col);
        setStatus(nextStatus);
        return next;
      });
    },
    [startTimer],
  );

  const handleToggleFlag = useCallback((row, col) => {
    setBoard((prev) => toggleFlag(prev, row, col));
  }, []);

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  const handleReset = useCallback(() => {
    stopTimer();
    startedRef.current = false;
    setPressing(false);
    setBoard(createBoard({ rows: ROWS, cols: COLS, mines: MINES }));
    setStatus('playing');
    setSeconds(0);
  }, [stopTimer]);

  const flagged = useMemo(() => countFlags(board), [board]);
  // Over-flagging shows a negative count rather than sticking at 000: the
  // readout is the only feedback that says how many flags are unaccounted for,
  // and clamping it made an over-flagged board look like a solved one.
  const remaining = MINES - flagged;

  const face =
    status === 'playing' && pressing
      ? 'face-o'
      : FACE_FOR_STATUS[status] ?? 'face-idle';

  return (
    <div className="ms-root">
      <div className="explorer-menubar" role="menubar">
        <button
          type="button"
          className="explorer-menu-item"
          role="menuitem"
          onClick={handleReset}
        >
          Game
        </button>
        <button
          type="button"
          className="explorer-menu-item"
          role="menuitem"
          onClick={() => setHelpOpen(true)}
        >
          Help
        </button>
      </div>
      <div className="ms-body">
        <div className="ms-statusbar win-bevel-in">
          <span className="ms-counter" role="group" aria-label="Mines remaining">
            <SevenSegment value={remaining} digits={COUNTER_DIGITS} />
          </span>
          <button
            type="button"
            className="ms-face"
            aria-label="New game"
            title="New game"
            onClick={handleReset}
          >
            <PixelIcon id={face} size={24} />
          </button>
          <span className="ms-counter" role="group" aria-label="Timer">
            <SevenSegment value={seconds} digits={COUNTER_DIGITS} />
          </span>
        </div>
        <div
          role="grid"
          aria-label="Minesweeper board"
          className="ms-board win-bevel-in"
          onMouseDown={(e) => {
            // Left button only: a right press plants a flag, which the face has
            // no opinion about.
            if (e.button === 0 && status === 'playing') setPressing(true);
          }}
          onMouseUp={() => setPressing(false)}
          onMouseLeave={() => setPressing(false)}
          // The native menu swallows the mouseup that would end the press, so
          // without this a right-click on the board's padding or on a gap
          // between cells leaves the face stuck in its "oh" state.
          onContextMenu={(e) => e.preventDefault()}
        >
          {board.map((row) => (
            <div className="ms-row" role="row" key={row[0].row}>
              {row.map((cell) => (
                <CellView
                  key={`${cell.row}-${cell.col}`}
                  cell={cell}
                  status={status}
                  onReveal={handleReveal}
                  onToggleFlag={handleToggleFlag}
                />
              ))}
            </div>
          ))}
        </div>
        {status === 'lost' && (
          <p className="ms-message" role="status">
            Boom! Click the face to try again.
          </p>
        )}
        {status === 'won' && (
          <p className="ms-message ms-message--win" role="status">
            Cleared! Nice work.
          </p>
        )}
      </div>
      <SystemDialog
        open={helpOpen}
        title="Minesweeper"
        message={HELP_TEXT}
        onClose={closeHelp}
      />
    </div>
  );
}
