import { describe, it, expect } from 'vitest';
import { createGame, tick, fire, move } from './spaceImpact.js';

describe('spaceImpact createGame', () => {
  it('starts playing with full lives, wave 1, and no entities', () => {
    const game = createGame({ livesMax: 3 });
    expect(game.status).toBe('playing');
    expect(game.lives).toBe(3);
    expect(game.wave).toBe(1);
    expect(game.score).toBe(0);
    expect(game.enemies).toEqual([]);
    expect(game.bullets).toEqual([]);
  });
});

describe('spaceImpact move', () => {
  it('moves the player up and down within bounds', () => {
    const game = createGame({ height: 8 });
    const moved = move({ ...game, player: { y: 3 } }, 'down');
    expect(moved.player.y).toBe(4);
  });

  it('clamps at the top edge', () => {
    const game = { ...createGame({ height: 8 }), player: { y: 0 } };
    const moved = move(game, 'up');
    expect(moved.player.y).toBe(0);
  });

  it('clamps at the bottom edge', () => {
    const game = { ...createGame({ height: 8 }), player: { y: 7 } };
    const moved = move(game, 'down');
    expect(moved.player.y).toBe(7);
  });
});

describe('spaceImpact fire', () => {
  it('adds a bullet ahead of the player and starts cooldown', () => {
    const game = createGame({ fireCooldownMax: 2 });
    const fired = fire({ ...game, player: { y: 3 } });
    expect(fired.bullets).toEqual([{ x: 2, y: 3 }]);
    expect(fired.fireCooldown).toBe(2);
  });

  it('does not fire again while cooldown is active', () => {
    const game = createGame({ fireCooldownMax: 2 });
    const once = fire({ ...game, player: { y: 3 } });
    const twice = fire(once);
    expect(twice.bullets).toHaveLength(1);
  });
});

describe('spaceImpact tick', () => {
  it('does nothing when the game is not playing', () => {
    const game = { ...createGame(), status: 'lost' };
    expect(tick(game)).toBe(game);
  });

  it('moves bullets right and enemies left', () => {
    const game = {
      ...createGame({ width: 10, height: 5 }),
      player: { y: 2 },
      bullets: [{ x: 3, y: 1 }],
      enemies: [{ x: 8, y: 4 }],
      enemiesRemaining: 0,
      spawnTimer: 5,
    };
    const next = tick(game);
    expect(next.bullets).toEqual([{ x: 4, y: 1 }]);
    expect(next.enemies).toEqual([{ x: 7, y: 4 }]);
  });

  it('destroys an enemy hit by a bullet and awards score', () => {
    const game = {
      ...createGame({ width: 10, height: 5 }),
      player: { y: 2 },
      bullets: [{ x: 4, y: 2 }],
      enemies: [{ x: 6, y: 2 }],
      enemiesRemaining: 1,
      spawnTimer: 3,
      score: 0,
    };
    const next = tick(game);
    expect(next.bullets).toEqual([]);
    expect(next.enemies).toEqual([]);
    expect(next.score).toBe(10);
    expect(next.status).toBe('playing');
  });

  it('destroys an enemy even when the starting gap is odd (crossing, not landing exactly)', () => {
    // Bullet at 6, enemy at 7: after one tick bullet->7, enemy->6 — they swap
    // order without ever sharing a cell in either frame.
    const game = {
      ...createGame({ width: 10, height: 5 }),
      player: { y: 2 },
      bullets: [{ x: 6, y: 3 }],
      enemies: [{ x: 7, y: 3 }],
      enemiesRemaining: 1,
      spawnTimer: 3,
      score: 0,
    };
    const next = tick(game);
    expect(next.bullets).toEqual([]);
    expect(next.enemies).toEqual([]);
    expect(next.score).toBe(10);
  });

  it('preserves the bullets array when the game ends on the same tick', () => {
    const game = {
      ...createGame({ width: 10, height: 6 }),
      player: { y: 0 },
      lives: 1,
      bullets: [{ x: 4, y: 5 }],
      enemies: [{ x: 2, y: 0 }],
      enemiesRemaining: 1,
      spawnTimer: 3,
    };
    const next = tick(game);
    expect(next.status).toBe('lost');
    expect(next.bullets).toEqual([{ x: 5, y: 5 }]);
  });

  it('costs a life when an enemy reaches the player', () => {
    const game = {
      ...createGame({ width: 10, height: 6 }),
      player: { y: 3 },
      lives: 2,
      enemies: [{ x: 2, y: 3 }],
      enemiesRemaining: 1,
      spawnTimer: 3,
    };
    const next = tick(game);
    expect(next.lives).toBe(1);
    expect(next.enemies).toEqual([]);
    expect(next.status).toBe('playing');
  });

  it('sets status to lost when lives reach zero', () => {
    const game = {
      ...createGame({ width: 10, height: 6 }),
      player: { y: 0 },
      lives: 1,
      enemies: [{ x: 2, y: 0 }],
      enemiesRemaining: 1,
      spawnTimer: 3,
    };
    const next = tick(game);
    expect(next.lives).toBe(0);
    expect(next.status).toBe('lost');
  });

  it('spawns an enemy via rng once the spawn timer elapses', () => {
    const game = {
      ...createGame({ width: 10, height: 6, spawnInterval: 3 }),
      player: { y: 3 },
      enemies: [],
      enemiesRemaining: 2,
      spawnTimer: 1,
      rng: () => 0.5,
    };
    const next = tick(game);
    expect(next.enemies).toEqual([{ x: 9, y: 3 }]);
    expect(next.enemiesRemaining).toBe(1);
    expect(next.spawnTimer).toBe(3);
  });

  it('advances to the next wave once it is fully cleared', () => {
    const game = {
      ...createGame({ wave: 2, winWave: 5, enemiesPerWave: 4 }),
      wave: 2,
      enemies: [],
      bullets: [],
      enemiesRemaining: 0,
      spawnTimer: 5,
    };
    const next = tick(game);
    expect(next.wave).toBe(3);
    expect(next.enemiesRemaining).toBe(4);
    expect(next.status).toBe('playing');
  });

  it('wins after clearing the final wave', () => {
    const game = {
      ...createGame({ winWave: 5 }),
      wave: 5,
      enemies: [],
      bullets: [],
      enemiesRemaining: 0,
      spawnTimer: 5,
    };
    const next = tick(game);
    expect(next.status).toBe('won');
    expect(next.wave).toBe(5);
  });
});
