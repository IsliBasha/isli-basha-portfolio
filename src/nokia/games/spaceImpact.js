export const PLAYER_X = 1;

function spawnEnemy(width, height, rng) {
  const y = Math.floor(rng() * height) % height;
  return { x: width - 1, y };
}

export function createGame({
  width = 20,
  height = 8,
  rng = Math.random,
  livesMax = 3,
  winWave = 5,
  enemiesPerWave = 4,
  spawnInterval = 3,
  fireCooldownMax = 2,
} = {}) {
  return {
    width,
    height,
    player: { y: Math.floor(height / 2) },
    lives: livesMax,
    livesMax,
    bullets: [],
    enemies: [],
    wave: 1,
    winWave,
    enemiesPerWave,
    enemiesRemaining: enemiesPerWave,
    spawnInterval,
    spawnTimer: spawnInterval,
    fireCooldown: 0,
    fireCooldownMax,
    score: 0,
    status: 'playing',
    rng,
  };
}

export function move(game, direction) {
  if (game.status !== 'playing') return game;
  if (direction !== 'up' && direction !== 'down') return game;
  const delta = direction === 'up' ? -1 : 1;
  const y = Math.min(Math.max(game.player.y + delta, 0), game.height - 1);
  return { ...game, player: { y } };
}

export function fire(game) {
  if (game.status !== 'playing') return game;
  if (game.fireCooldown > 0) return game;
  const bullets = [...game.bullets, { x: PLAYER_X + 1, y: game.player.y }];
  return { ...game, bullets, fireCooldown: game.fireCooldownMax };
}

function resolveCollisions(movedBullets, movedEnemies) {
  const deadEnemyIdx = new Set();
  const usedBulletIdx = new Set();
  let killScore = 0;
  movedBullets.forEach((bullet, bi) => {
    const bulletPrevX = bullet.x - 1;
    const ei = movedEnemies.findIndex((enemy, idx) => {
      if (deadEnemyIdx.has(idx) || enemy.y !== bullet.y) return false;
      const enemyPrevX = enemy.x + 1;
      // Both move exactly 1 cell/tick toward each other, so an odd starting
      // gap would let them swap positions without ever landing on the same
      // cell in either frame — count that crossing as a hit too.
      return enemy.x === bullet.x || (bulletPrevX < enemyPrevX && bullet.x >= enemy.x);
    });
    if (ei !== -1) {
      deadEnemyIdx.add(ei);
      usedBulletIdx.add(bi);
      killScore += 10;
    }
  });
  return {
    survivingBullets: movedBullets.filter((_, bi) => !usedBulletIdx.has(bi)),
    survivingEnemies: movedEnemies.filter((_, ei) => !deadEnemyIdx.has(ei)),
    killScore,
  };
}

function resolvePlayerHit(survivingEnemies, player) {
  const collided = survivingEnemies.some((e) => e.x === PLAYER_X && e.y === player.y);
  const remainingEnemies = collided
    ? survivingEnemies.filter((e) => !(e.x === PLAYER_X && e.y === player.y))
    : survivingEnemies;
  return { remainingEnemies, collided };
}

function advanceSpawns(game, remainingEnemies, rng) {
  const nextSpawnTimer = game.spawnTimer - 1;
  const shouldSpawn = nextSpawnTimer <= 0 && game.enemiesRemaining > 0;
  const enemies = shouldSpawn
    ? [...remainingEnemies, spawnEnemy(game.width, game.height, rng)]
    : remainingEnemies;
  return {
    enemies,
    enemiesRemaining: shouldSpawn ? game.enemiesRemaining - 1 : game.enemiesRemaining,
    spawnTimer: shouldSpawn ? game.spawnInterval : Math.max(nextSpawnTimer, 0),
  };
}

export function tick(game) {
  if (game.status !== 'playing') return game;

  const rng = game.rng ?? Math.random;
  const movedBullets = game.bullets
    .map((b) => ({ ...b, x: b.x + 1 }))
    .filter((b) => b.x < game.width);
  const movedEnemies = game.enemies
    .map((e) => ({ ...e, x: e.x - 1 }))
    .filter((e) => e.x >= 0);

  const { survivingBullets, survivingEnemies, killScore } = resolveCollisions(
    movedBullets,
    movedEnemies,
  );
  const { remainingEnemies, collided } = resolvePlayerHit(survivingEnemies, game.player);
  const nextLives = collided ? game.lives - 1 : game.lives;

  if (nextLives <= 0) {
    return {
      ...game,
      bullets: survivingBullets,
      enemies: remainingEnemies,
      lives: 0,
      status: 'lost',
    };
  }

  const { enemies, enemiesRemaining, spawnTimer } = advanceSpawns(game, remainingEnemies, rng);
  const waveCleared = enemiesRemaining === 0 && enemies.length === 0;
  const won = waveCleared && game.wave >= game.winWave;

  return {
    ...game,
    bullets: survivingBullets,
    enemies,
    lives: nextLives,
    score: game.score + killScore,
    spawnTimer,
    enemiesRemaining: waveCleared ? game.enemiesPerWave : enemiesRemaining,
    wave: waveCleared && !won ? game.wave + 1 : game.wave,
    fireCooldown: Math.max(game.fireCooldown - 1, 0),
    status: won ? 'won' : 'playing',
  };
}
