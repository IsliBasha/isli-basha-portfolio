import { describe, it, expect } from 'vitest';
import { createGame, applyMove, chooseAiMove, legalMoves } from './bantumi.js';

describe('bantumi createGame', () => {
  it('starts with 4 stones in every pit and empty stores', () => {
    const game = createGame();
    expect(game.board).toEqual([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    expect(game.turn).toBe('player');
    expect(game.status).toBe('playing');
  });
});

describe('bantumi applyMove', () => {
  it('sows stones counter-clockwise and grants an extra turn on landing in own store', () => {
    const game = createGame();
    const next = applyMove(game, 2);
    expect(next.board.slice(3, 7)).toEqual([5, 5, 5, 1]);
    expect(next.turn).toBe('player');
    expect(next.status).toBe('playing');
  });

  it('captures the opposite pit when the last stone lands in an empty own pit', () => {
    const game = {
      ...createGame(),
      board: [3, 0, 0, 0, 1, 0, 0, 5, 3, 3, 3, 3, 3, 0],
    };
    const next = applyMove(game, 4);
    expect(next.board[5]).toBe(0);
    expect(next.board[7]).toBe(0);
    expect(next.board[6]).toBe(6);
    expect(next.turn).toBe('ai');
  });

  it('rejects moving an opponent pit or an empty pit', () => {
    const game = createGame();
    expect(applyMove(game, 8)).toBe(game);
    const emptied = { ...game, board: [0, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0] };
    expect(applyMove(emptied, 0)).toBe(emptied);
  });

  it('sweeps remaining stones and ends the game once a side empties', () => {
    const game = {
      ...createGame(),
      board: [0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 0],
    };
    const next = applyMove(game, 5);
    expect(next.status).toBe('over');
    expect(next.board[13]).toBe(12);
    expect(next.board.slice(7, 13)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(next.winner).toBe('ai');
  });
});

describe('bantumi legalMoves', () => {
  it('lists only non-empty pits belonging to the side to move', () => {
    const game = { ...createGame(), board: [0, 4, 0, 4, 0, 4, 0, 4, 4, 4, 4, 4, 4, 0] };
    expect(legalMoves(game)).toEqual([1, 3, 5]);
  });
});

describe('bantumi chooseAiMove', () => {
  it('greedily picks the move that captures the most stones', () => {
    const game = {
      ...createGame(),
      turn: 'ai',
      board: [7, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    };
    expect(chooseAiMove(game)).toBe(11);
  });

  it('returns null when the side to move has no legal pits', () => {
    const game = { ...createGame(), turn: 'ai', board: [4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0] };
    expect(chooseAiMove(game)).toBeNull();
  });
});
