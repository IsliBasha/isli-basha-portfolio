import { describe, it, expect } from 'vitest';
import { createGame, tick, turn } from './snake.js';

function fixedFoodRng(foodCoords) {
  const queue = [...foodCoords];
  return () => {
    const next = queue.shift();
    if (!next) throw new Error('fixedFoodRng exhausted');
    return next;
  };
}

describe('snake createGame', () => {
  it('returns a 3-segment snake near the grid center', () => {
    const game = createGame({ width: 12, height: 12 });
    expect(game.snake).toHaveLength(3);
    const head = game.snake[0];
    expect(head.x).toBeGreaterThanOrEqual(0);
    expect(head.x).toBeLessThan(12);
    expect(head.y).toBeGreaterThanOrEqual(0);
    expect(head.y).toBeLessThan(12);
  });

  it('starts moving right with status playing and score 0', () => {
    const game = createGame({ width: 10, height: 10 });
    expect(game.direction).toBe('right');
    expect(game.status).toBe('playing');
    expect(game.score).toBe(0);
  });

  it('places food inside the grid and not on the snake', () => {
    const game = createGame({ width: 10, height: 10 });
    expect(game.food.x).toBeGreaterThanOrEqual(0);
    expect(game.food.x).toBeLessThan(10);
    const collides = game.snake.some(
      (s) => s.x === game.food.x && s.y === game.food.y,
    );
    expect(collides).toBe(false);
  });
});

describe('snake tick', () => {
  it('moves the head one cell in the current direction', () => {
    const game = createGame({ width: 10, height: 10 });
    const prevHead = game.snake[0];
    const next = tick(game);
    expect(next.snake[0]).toEqual({ x: prevHead.x + 1, y: prevHead.y });
  });

  it('keeps snake length constant when not eating', () => {
    const game = createGame({ width: 10, height: 10 });
    const next = tick(game);
    expect(next.snake).toHaveLength(game.snake.length);
  });

  it('grows the snake and increments score when eating food', () => {
    const game = {
      width: 10,
      height: 10,
      snake: [
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      direction: 'right',
      food: { x: 5, y: 5 },
      status: 'playing',
      score: 0,
      foodRng: fixedFoodRng([0.1, 0.1]),
    };
    const next = tick(game);
    expect(next.snake).toHaveLength(3);
    expect(next.score).toBe(1);
    expect(next.food).not.toEqual({ x: 5, y: 5 });
  });

  it('sets status to gameover on wall collision', () => {
    const game = {
      width: 5,
      height: 5,
      snake: [
        { x: 4, y: 2 },
        { x: 3, y: 2 },
      ],
      direction: 'right',
      food: { x: 0, y: 0 },
      status: 'playing',
      score: 0,
      foodRng: () => 0,
    };
    const next = tick(game);
    expect(next.status).toBe('gameover');
  });

  it('sets status to gameover when head runs into the body', () => {
    const game = {
      width: 10,
      height: 10,
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 5, y: 3 },
        { x: 6, y: 3 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
      ],
      direction: 'right',
      food: { x: 9, y: 9 },
      status: 'playing',
      score: 0,
      foodRng: () => 0,
    };
    const next = tick(game);
    expect(next.status).toBe('gameover');
  });

  it('does nothing when the game is already over', () => {
    const game = {
      width: 5,
      height: 5,
      snake: [{ x: 0, y: 0 }],
      direction: 'right',
      food: { x: 2, y: 2 },
      status: 'gameover',
      score: 0,
      foodRng: () => 0,
    };
    expect(tick(game)).toBe(game);
  });
});

describe('snake turn', () => {
  it('changes direction when given a valid 90-degree turn', () => {
    const game = createGame({ width: 10, height: 10 });
    const next = turn(game, 'up');
    expect(next.direction).toBe('up');
  });

  it('ignores reversing onto itself', () => {
    const game = createGame({ width: 10, height: 10 });
    const next = turn(game, 'left');
    expect(next.direction).toBe('right');
  });

  it('ignores unknown directions', () => {
    const game = createGame({ width: 10, height: 10 });
    const next = turn(game, 'diagonal');
    expect(next.direction).toBe('right');
  });
});
