import { useCallback, useEffect, useRef, useState } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { createGame, tick, turn } from '../../lib/snake.js';
import { useHighScore } from '../useHighScore.js';

const WIDTH = 16;
const HEIGHT = 12;
const TICK_MS = 140;
const SWIPE_THRESHOLD = 24;

const KEY_TO_DIR = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

function newGame() {
  return createGame({ width: WIDTH, height: HEIGHT, bonusEnabled: true });
}

// 12 SNAKE II — reuses the shared lib/snake.js engine (bonusEnabled: true
// turns on the hollow-bonus pickup; desktop Snake leaves it off by default).
export function SnakeII({ onBack }) {
  const [game, setGame] = useState(newGame);
  const [running, setRunning] = useState(false);
  const { highScore, recordScore } = useHighScore('snake');
  const touchStart = useRef(null);
  // Snapshot of the high score as it stood when this run started — recordScore
  // mutates `highScore` itself once the run ends, so comparing against the
  // live value would make the "NEW HI" banner flicker on and off. State (not
  // a ref) because it's read during render.
  const [baselineHighScore, setBaselineHighScore] = useState(highScore);

  const active = running && game.status === 'playing';

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setGame((g) => tick(g)), TICK_MS);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (game.status !== 'playing') recordScore(game.score);
  }, [game.status, game.score, recordScore]);

  const steer = useCallback((dir) => {
    setGame((g) => turn(g, dir));
    setRunning(true);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      const dir = KEY_TO_DIR[event.key];
      if (!dir) return;
      event.preventDefault();
      steer(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steer]);

  const handleTouchStart = (event) => {
    const t = event.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStart.current;
    if (!start) return;
    touchStart.current = null;
    const t = event.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 'right' : 'left');
    else steer(dy > 0 ? 'down' : 'up');
  };

  const handleRetry = () => {
    setBaselineHighScore(highScore);
    setGame(newGame());
    setRunning(false);
  };

  const gameOver = game.status !== 'playing';

  const snakeIndex = new Map(game.snake.map((seg, i) => [`${seg.x},${seg.y}`, i]));
  const foodKey = game.food ? `${game.food.x},${game.food.y}` : null;
  const bonusKey = game.bonus ? `${game.bonus.x},${game.bonus.y}` : null;

  const cells = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const key = `${x},${y}`;
      const idx = snakeIndex.get(key);
      let className = 'nk-snake-cell';
      let style;
      if (idx === 0) {
        className += ' nk-snake-cell--head';
      } else if (idx !== undefined) {
        // Ghost trail: segments fade out toward the tail.
        className += ' nk-snake-cell--body';
        style = { opacity: Math.max(1 - (idx / game.snake.length) * 0.6, 0.35) };
      } else if (key === foodKey) {
        className += ' nk-snake-cell--food';
      } else if (key === bonusKey) {
        className += ' nk-snake-cell--bonus';
      }
      cells.push(<div key={key} className={className} style={style} aria-hidden="true" />);
    }
  }

  return (
    <NokiaShell
      header={<SectionHeader title="Snake II" context={`${game.score}`} />}
      leftKey={
        gameOver
          ? { label: 'Retry', action: handleRetry }
          : { label: running ? 'Pause' : 'Go', action: () => setRunning((r) => !r) }
      }
      rightKey={{ label: 'Quit', action: onBack }}
      className="nk-screen--snake"
    >
      <div
        className="nk-snake-grid"
        style={{ gridTemplateColumns: `repeat(${WIDTH}, 1fr)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {cells}
      </div>
      {gameOver && (
        <div className="nk-game-over" role="status">
          {game.status === 'won' ? 'YOU WIN' : 'GAME OVER'} · {game.score}
          {game.score > baselineHighScore && game.score > 0 ? ' · NEW HI' : ''}
        </div>
      )}
      <div className="nk-dpad" role="group" aria-label="Steer">
        <button type="button" className="nk-dpad__btn nk-dpad__up" onClick={() => steer('up')} aria-label="Up">▲</button>
        <button type="button" className="nk-dpad__btn nk-dpad__left" onClick={() => steer('left')} aria-label="Left">◄</button>
        <button type="button" className="nk-dpad__btn nk-dpad__right" onClick={() => steer('right')} aria-label="Right">►</button>
        <button type="button" className="nk-dpad__btn nk-dpad__down" onClick={() => steer('down')} aria-label="Down">▼</button>
      </div>
    </NokiaShell>
  );
}
