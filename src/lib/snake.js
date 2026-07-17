const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function placeFood(width, height, snake, rng, exclude = null) {
  const taken = new Set(snake.map((s) => `${s.x},${s.y}`));
  if (exclude) taken.add(`${exclude.x},${exclude.y}`);
  const free = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const idx = Math.floor(rng() * free.length) % free.length;
  return free[idx];
}

export function createGame({
  width = 20,
  height = 15,
  rng = Math.random,
  bonusEnabled = false,
  bonusEvery = 5,
  bonusLifetime = 15,
  bonusValue = 5,
} = {}) {
  const cy = Math.floor(height / 2);
  const cx = Math.floor(width / 2);
  const snake = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  const food = placeFood(width, height, snake, rng);
  return {
    width,
    height,
    snake,
    direction: 'right',
    food,
    status: 'playing',
    score: 0,
    foodRng: rng,
    bonusEnabled,
    bonusEvery,
    bonusLifetime,
    bonusValue,
    bonus: null,
    foodEatenCount: 0,
  };
}

export function turn(game, direction) {
  if (!DIRS[direction]) return game;
  if (OPPOSITE[direction] === game.direction) return game;
  return { ...game, direction };
}

export function tick(game) {
  if (game.status !== 'playing') return game;

  const { direction } = game;
  const delta = DIRS[direction];
  const head = game.snake[0];
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.x >= game.width ||
    nextHead.y < 0 ||
    nextHead.y >= game.height;

  if (hitsWall) {
    return { ...game, status: 'gameover', direction };
  }

  const eatingFood =
    game.food && nextHead.x === game.food.x && nextHead.y === game.food.y;
  const eatingBonus =
    game.bonus && nextHead.x === game.bonus.x && nextHead.y === game.bonus.y;

  // Bonus is a points pickup, not a meal — only regular food grows the snake.
  const bodyAfterMove = eatingFood
    ? game.snake
    : game.snake.slice(0, game.snake.length - 1);

  const selfHit = bodyAfterMove.some(
    (s) => s.x === nextHead.x && s.y === nextHead.y,
  );

  if (selfHit) {
    return { ...game, status: 'gameover', direction };
  }

  const nextSnake = [nextHead, ...bodyAfterMove];
  const rng = game.foodRng ?? Math.random;

  // Decay/clear the carried-over bonus first so a fresh food spawn can
  // exclude its cell — otherwise food could land exactly on a still-active
  // bonus, silently hiding it and double-scoring the tile.
  let carriedBonus = eatingBonus ? null : (game.bonus ?? null);
  if (game.bonusEnabled && carriedBonus) {
    const ticksLeft = carriedBonus.ticksLeft - 1;
    carriedBonus = ticksLeft > 0 ? { ...carriedBonus, ticksLeft } : null;
  }

  const nextFood = eatingFood
    ? placeFood(game.width, game.height, nextSnake, rng, carriedBonus)
    : game.food;
  const nextFoodEatenCount = eatingFood
    ? (game.foodEatenCount ?? 0) + 1
    : (game.foodEatenCount ?? 0);
  const bonusEvery = game.bonusEvery ?? 5;

  let nextBonus = carriedBonus;
  const shouldSpawnBonus =
    game.bonusEnabled &&
    !nextBonus &&
    eatingFood &&
    nextFoodEatenCount % bonusEvery === 0;
  if (shouldSpawnBonus) {
    const spot = placeFood(game.width, game.height, nextSnake, rng, nextFood);
    nextBonus = spot
      ? { ...spot, ticksLeft: game.bonusLifetime ?? 15 }
      : null;
  }

  const nextScore =
    game.score +
    (eatingFood ? 1 : 0) +
    (eatingBonus ? (game.bonusValue ?? 5) : 0);
  const nextStatus = nextFood ? 'playing' : 'won';

  return {
    ...game,
    snake: nextSnake,
    food: nextFood,
    bonus: nextBonus,
    direction,
    score: nextScore,
    foodEatenCount: nextFoodEatenCount,
    status: nextStatus,
  };
}
