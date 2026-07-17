function playerPitIndices(pitsPerSide) {
  return Array.from({ length: pitsPerSide }, (_, i) => i);
}

function aiPitIndices(pitsPerSide) {
  return Array.from({ length: pitsPerSide }, (_, i) => pitsPerSide + 1 + i);
}

function isOwnPit(index, side, pitsPerSide) {
  return side === 'player'
    ? index >= 0 && index < pitsPerSide
    : index > pitsPerSide && index <= 2 * pitsPerSide;
}

function oppositeIndex(index, pitsPerSide) {
  return 2 * pitsPerSide - index;
}

function sow(board, pit, opponentStore) {
  const total = board.length;
  const next = [...board];
  let stones = next[pit];
  next[pit] = 0;
  let idx = pit;
  while (stones > 0) {
    idx = (idx + 1) % total;
    if (idx === opponentStore) continue;
    next[idx] += 1;
    stones -= 1;
  }
  return { board: next, lastIndex: idx };
}

export function createGame({ pitsPerSide = 6, stonesPerPit = 4 } = {}) {
  const playerStoreIndex = pitsPerSide;
  const aiStoreIndex = 2 * pitsPerSide + 1;
  const board = new Array(2 * pitsPerSide + 2).fill(stonesPerPit);
  board[playerStoreIndex] = 0;
  board[aiStoreIndex] = 0;
  return {
    board,
    pitsPerSide,
    playerStoreIndex,
    aiStoreIndex,
    turn: 'player',
    status: 'playing',
    winner: null,
  };
}

export function legalMoves(game) {
  const pits = game.turn === 'player'
    ? playerPitIndices(game.pitsPerSide)
    : aiPitIndices(game.pitsPerSide);
  return pits.filter((i) => game.board[i] > 0);
}

export function applyMove(game, pitIndex) {
  if (game.status !== 'playing') return game;
  const side = game.turn;
  if (!isOwnPit(pitIndex, side, game.pitsPerSide)) return game;
  if (game.board[pitIndex] === 0) return game;

  const opponentStore = side === 'player' ? game.aiStoreIndex : game.playerStoreIndex;
  const ownStore = side === 'player' ? game.playerStoreIndex : game.aiStoreIndex;

  const { board: sownBoard, lastIndex } = sow(game.board, pitIndex, opponentStore);
  let board = sownBoard;

  const extraTurn = lastIndex === ownStore;

  // A stone landing in an empty pit on your own side steals the mirrored
  // opposing pit's stones into your store — the signature Kalah/Bantumi capture.
  if (!extraTurn && isOwnPit(lastIndex, side, game.pitsPerSide) && board[lastIndex] === 1) {
    const oppIdx = oppositeIndex(lastIndex, game.pitsPerSide);
    const captured = board[lastIndex] + board[oppIdx];
    board = [...board];
    board[lastIndex] = 0;
    board[oppIdx] = 0;
    board[ownStore] += captured;
  }

  const playerPits = playerPitIndices(game.pitsPerSide);
  const aiPits = aiPitIndices(game.pitsPerSide);
  const playerEmpty = playerPits.every((i) => board[i] === 0);
  const aiEmpty = aiPits.every((i) => board[i] === 0);

  let status = 'playing';
  let winner = null;

  if (playerEmpty || aiEmpty) {
    board = [...board];
    const sweepPits = playerEmpty ? aiPits : playerPits;
    const sweepStore = playerEmpty ? game.aiStoreIndex : game.playerStoreIndex;
    const sweepTotal = sweepPits.reduce((sum, i) => sum + board[i], 0);
    sweepPits.forEach((i) => {
      board[i] = 0;
    });
    board[sweepStore] += sweepTotal;
    status = 'over';
    if (board[game.playerStoreIndex] === board[game.aiStoreIndex]) {
      winner = 'tie';
    } else {
      winner = board[game.playerStoreIndex] > board[game.aiStoreIndex] ? 'player' : 'ai';
    }
  }

  const nextTurn =
    status === 'over' ? game.turn : extraTurn ? side : side === 'player' ? 'ai' : 'player';

  return { ...game, board, status, winner, turn: nextTurn };
}

export function chooseAiMove(game) {
  const candidates = legalMoves(game);
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestGain = -Infinity;
  candidates.forEach((pit) => {
    const result = applyMove(game, pit);
    const gain = result.board[game.aiStoreIndex] - game.board[game.aiStoreIndex];
    if (gain > bestGain) {
      bestGain = gain;
      best = pit;
    }
  });
  return best;
}
