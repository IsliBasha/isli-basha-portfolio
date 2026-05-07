import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBoard,
  revealCell,
  toggleFlag,
  countFlags,
} from '../lib/minesweeper.js';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

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

function pad3(n) {
  return String(Math.max(0, Math.min(999, n))).padStart(3, '0');
}

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

  let content = '';
  let colorStyle;
  if (cell.isRevealed) {
    if (cell.isMine) content = '✺';
    else if (cell.adjacent > 0) {
      content = String(cell.adjacent);
      colorStyle = { color: NUMBER_COLORS[cell.adjacent] };
    }
  } else if (cell.isFlagged) {
    content = '⚑';
    colorStyle = { color: '#cc1616' };
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

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => Math.min(999, s + 1));
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

  const handleReset = useCallback(() => {
    stopTimer();
    startedRef.current = false;
    setBoard(createBoard({ rows: ROWS, cols: COLS, mines: MINES }));
    setStatus('playing');
    setSeconds(0);
  }, [stopTimer]);

  const flagged = useMemo(() => countFlags(board), [board]);
  const remaining = Math.max(0, MINES - flagged);

  let face = '🙂';
  if (status === 'won') face = '😎';
  if (status === 'lost') face = '😵';

  return (
    <div className="ms-root">
      <div className="ms-statusbar win-bevel-in">
        <span className="ms-counter" aria-label="Mines remaining">
          {pad3(remaining)}
        </span>
        <button
          type="button"
          className="ms-face"
          aria-label="New game"
          title="New game"
          onClick={handleReset}
        >
          {face}
        </button>
        <span className="ms-counter" aria-label="Timer">
          {pad3(seconds)}
        </span>
      </div>
      <div
        role="grid"
        aria-label="Minesweeper board"
        className="ms-board win-bevel-in"
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
  );
}
