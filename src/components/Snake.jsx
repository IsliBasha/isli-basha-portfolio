import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGame, tick, turn } from '../lib/snake.js';

const WIDTH = 20;
const HEIGHT = 15;
const TICK_MS = 140;

const KEY_TO_DIR = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
};

export function Snake() {
  const [game, setGame] = useState(() => createGame({ width: WIDTH, height: HEIGHT }));
  const [running, setRunning] = useState(false);
  const boardRef = useRef(null);

  const active = running && game.status === 'playing';

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setGame((g) => tick(g));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [active]);

  const handleKeyDown = useCallback((event) => {
    const dir = KEY_TO_DIR[event.code] ?? KEY_TO_DIR[event.key];
    if (!dir) return;
    event.preventDefault();
    setGame((g) => turn(g, dir));
    setRunning(true);
  }, []);

  const handleStart = useCallback(() => {
    if (game.status !== 'playing') {
      setGame(createGame({ width: WIDTH, height: HEIGHT }));
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
    boardRef.current?.focus();
  }, [game.status]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setGame(createGame({ width: WIDTH, height: HEIGHT }));
  }, []);

  const cellLookup = useMemo(() => {
    const snakeSet = new Set(game.snake.map((s) => `${s.x},${s.y}`));
    const headKey = `${game.snake[0].x},${game.snake[0].y}`;
    const foodKey = game.food ? `${game.food.x},${game.food.y}` : null;
    return { snakeSet, headKey, foodKey };
  }, [game.snake, game.food]);

  const cells = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const key = `${x},${y}`;
      let className = 'snake-cell';
      if (key === cellLookup.headKey) className += ' snake-cell--head';
      else if (cellLookup.snakeSet.has(key)) className += ' snake-cell--body';
      else if (key === cellLookup.foodKey) className += ' snake-cell--food';
      cells.push(<div key={key} className={className} aria-hidden="true" />);
    }
  }

  return (
    <div className="snake-root">
      <div className="snake-statusbar win-bevel-in">
        <span aria-label="Score">Score: {game.score}</span>
        <button type="button" className="win-btn" onClick={handleStart}>
          {active ? 'Pause' : game.status === 'playing' ? 'Start' : 'Restart'}
        </button>
        <button type="button" className="win-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div
        ref={boardRef}
        role="application"
        aria-label="Snake board"
        tabIndex={0}
        className="snake-board win-bevel-in"
        onKeyDown={handleKeyDown}
        style={{
          gridTemplateColumns: `repeat(${WIDTH}, 1fr)`,
          gridTemplateRows: `repeat(${HEIGHT}, 1fr)`,
        }}
      >
        {cells}
      </div>
      {game.status === 'gameover' && (
        <p className="snake-message" role="status">
          Game over. Final score: {game.score}. Press Start to try again.
        </p>
      )}
      <p className="snake-hint">Arrow keys / WASD to steer.</p>
    </div>
  );
}
