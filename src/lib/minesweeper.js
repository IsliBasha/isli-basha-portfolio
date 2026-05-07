const NEIGHBOR_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function makeCell(row, col) {
  return {
    row,
    col,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacent: 0,
  };
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function forEachNeighbor(board, row, col, fn) {
  const rows = board.length;
  const cols = board[0].length;
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
    fn(board[nr][nc]);
  }
}

function computeAdjacency(board) {
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) {
        cell.adjacent = 0;
        continue;
      }
      let count = 0;
      forEachNeighbor(board, cell.row, cell.col, (n) => {
        if (n.isMine) count += 1;
      });
      cell.adjacent = count;
    }
  }
}

export function createBoard({ rows, cols, mines, safeStart, rng = Math.random } = {}) {
  if (!rows || !cols) throw new Error('rows and cols are required');
  const total = rows * cols;
  const mineCount = Math.min(mines, total - (safeStart ? 1 : 0));

  const board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => makeCell(r, c)),
  );

  const forbidden = safeStart
    ? new Set([`${safeStart.row},${safeStart.col}`])
    : new Set();

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(rng() * rows);
    const c = Math.floor(rng() * cols);
    const key = `${r},${c}`;
    if (forbidden.has(key)) continue;
    if (board[r][c].isMine) continue;
    board[r][c].isMine = true;
    placed += 1;
  }

  computeAdjacency(board);
  return board;
}

function floodReveal(board, startR, startC) {
  const stack = [[startR, startC]];
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
    cell.isRevealed = true;
    if (cell.adjacent === 0) {
      forEachNeighbor(board, r, c, (n) => {
        if (!n.isRevealed && !n.isFlagged && !n.isMine) {
          stack.push([n.row, n.col]);
        }
      });
    }
  }
}

export function gameStatus(board) {
  let revealedMine = false;
  let hiddenSafe = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine && cell.isRevealed) revealedMine = true;
      if (!cell.isMine && !cell.isRevealed) hiddenSafe += 1;
    }
  }
  if (revealedMine) return 'lost';
  if (hiddenSafe === 0) return 'won';
  return 'playing';
}

export function revealCell(board, row, col) {
  const next = cloneBoard(board);
  const cell = next[row][col];

  if (cell.isFlagged || cell.isRevealed) {
    return { board: next, status: gameStatus(next) };
  }

  if (cell.isMine) {
    cell.isRevealed = true;
    return { board: next, status: 'lost' };
  }

  floodReveal(next, row, col);
  return { board: next, status: gameStatus(next) };
}

export function toggleFlag(board, row, col) {
  const next = cloneBoard(board);
  const cell = next[row][col];
  if (cell.isRevealed) return next;
  cell.isFlagged = !cell.isFlagged;
  return next;
}

export function countFlags(board) {
  let n = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) n += 1;
    }
  }
  return n;
}
