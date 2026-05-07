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

function placeFood(width, height, snake, rng) {
  const taken = new Set(snake.map((s) => `${s.x},${s.y}`));
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

export function createGame({ width = 20, height = 15, rng = Math.random } = {}) {
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

  const eating =
    game.food && nextHead.x === game.food.x && nextHead.y === game.food.y;

  const bodyAfterMove = eating
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
  const nextFood = eating
    ? placeFood(game.width, game.height, nextSnake, rng)
    : game.food;
  const nextScore = eating ? game.score + 1 : game.score;
  const nextStatus = nextFood ? 'playing' : 'won';

  return {
    ...game,
    snake: nextSnake,
    food: nextFood,
    direction,
    score: nextScore,
    status: nextStatus,
  };
}
