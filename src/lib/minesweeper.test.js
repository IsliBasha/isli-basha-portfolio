import { describe, it, expect } from 'vitest';
import {
  createBoard,
  revealCell,
  toggleFlag,
  gameStatus,
} from './minesweeper.js';

function minesAt(board, coords) {
  return coords.map(([r, c]) => {
    board[r][c].isMine = true;
    return [r, c];
  });
}

function emptyBoard(rows, cols) {
  const board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacent: 0,
    })),
  );
  return board;
}

function recomputeAdjacency(board) {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (board[r][c].isMine) {
        board[r][c].adjacent = 0;
        continue;
      }
      let n = 0;
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (board[nr][nc].isMine) n += 1;
        }
      }
      board[r][c].adjacent = n;
    }
  }
}

describe('minesweeper createBoard', () => {
  it('creates a board with the given dimensions', () => {
    const board = createBoard({ rows: 9, cols: 9, mines: 10 });
    expect(board).toHaveLength(9);
    expect(board[0]).toHaveLength(9);
  });

  it('places the requested number of mines', () => {
    const board = createBoard({ rows: 9, cols: 9, mines: 10 });
    const total = board.flat().filter((cell) => cell.isMine).length;
    expect(total).toBe(10);
  });

  it('starts every cell hidden and unflagged', () => {
    const board = createBoard({ rows: 5, cols: 5, mines: 3 });
    board.flat().forEach((cell) => {
      expect(cell.isRevealed).toBe(false);
      expect(cell.isFlagged).toBe(false);
    });
  });

  it('computes adjacency counts for non-mine cells', () => {
    const board = createBoard({ rows: 4, cols: 4, mines: 4 });
    for (const cell of board.flat()) {
      if (cell.isMine) continue;
      expect(cell.adjacent).toBeGreaterThanOrEqual(0);
      expect(cell.adjacent).toBeLessThanOrEqual(8);
    }
  });

  it('places mines away from the first click when safeStart coord provided', () => {
    for (let i = 0; i < 20; i += 1) {
      const board = createBoard({
        rows: 5,
        cols: 5,
        mines: 5,
        safeStart: { row: 2, col: 2 },
      });
      expect(board[2][2].isMine).toBe(false);
    }
  });
});

describe('minesweeper revealCell', () => {
  it('reveals a single numbered cell without cascading', () => {
    const board = emptyBoard(3, 3);
    minesAt(board, [[0, 0]]);
    recomputeAdjacency(board);

    const { board: next } = revealCell(board, 1, 1);

    expect(next[1][1].isRevealed).toBe(true);
    expect(next[0][1].isRevealed).toBe(false);
  });

  it('flood-fills when revealing a zero-adjacent cell', () => {
    const board = emptyBoard(3, 3);
    minesAt(board, [[0, 0]]);
    recomputeAdjacency(board);

    const { board: next } = revealCell(board, 2, 2);

    const revealedCount = next.flat().filter((c) => c.isRevealed).length;
    expect(revealedCount).toBeGreaterThan(1);
    expect(next[0][0].isRevealed).toBe(false);
  });

  it('returns lost status when revealing a mine', () => {
    const board = emptyBoard(3, 3);
    minesAt(board, [[0, 0]]);
    recomputeAdjacency(board);

    const { board: next, status } = revealCell(board, 0, 0);

    expect(status).toBe('lost');
    expect(next[0][0].isRevealed).toBe(true);
  });

  it('returns won status when all non-mine cells are revealed', () => {
    const board = emptyBoard(2, 2);
    minesAt(board, [[0, 0]]);
    recomputeAdjacency(board);

    let b = board;
    ({ board: b } = revealCell(b, 0, 1));
    ({ board: b } = revealCell(b, 1, 0));
    const result = revealCell(b, 1, 1);

    expect(result.status).toBe('won');
  });

  it('ignores clicks on flagged cells', () => {
    const board = emptyBoard(2, 2);
    recomputeAdjacency(board);
    const flagged = toggleFlag(board, 0, 0);

    const { board: next, status } = revealCell(flagged, 0, 0);

    expect(next[0][0].isRevealed).toBe(false);
    expect(status).toBe('playing');
  });

  it('does not mutate the input board', () => {
    const board = emptyBoard(2, 2);
    minesAt(board, [[0, 0]]);
    recomputeAdjacency(board);
    const snapshot = JSON.stringify(board);

    revealCell(board, 1, 1);

    expect(JSON.stringify(board)).toBe(snapshot);
  });
});

describe('minesweeper toggleFlag', () => {
  it('flags an unflagged cell', () => {
    const board = emptyBoard(2, 2);
    const next = toggleFlag(board, 0, 0);
    expect(next[0][0].isFlagged).toBe(true);
  });

  it('unflags a flagged cell', () => {
    const board = emptyBoard(2, 2);
    const once = toggleFlag(board, 0, 0);
    const twice = toggleFlag(once, 0, 0);
    expect(twice[0][0].isFlagged).toBe(false);
  });

  it('refuses to flag a revealed cell', () => {
    const board = emptyBoard(2, 2);
    recomputeAdjacency(board);
    const { board: revealed } = revealCell(board, 0, 0);

    const next = toggleFlag(revealed, 0, 0);

    expect(next[0][0].isFlagged).toBe(false);
  });
});

describe('minesweeper gameStatus', () => {
  it('reports playing when hidden safe cells remain', () => {
    const board = emptyBoard(2, 2);
    minesAt(board, [[0, 0]]);
    expect(gameStatus(board)).toBe('playing');
  });

  it('reports won when every safe cell is revealed', () => {
    const board = emptyBoard(2, 2);
    minesAt(board, [[0, 0]]);
    board[0][1].isRevealed = true;
    board[1][0].isRevealed = true;
    board[1][1].isRevealed = true;
    expect(gameStatus(board)).toBe('won');
  });

  it('reports lost when any mine is revealed', () => {
    const board = emptyBoard(2, 2);
    minesAt(board, [[0, 0]]);
    board[0][0].isRevealed = true;
    expect(gameStatus(board)).toBe('lost');
  });
});
