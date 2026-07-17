import { useCallback, useEffect, useState } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { createGame, tick, fire, move, PLAYER_X } from '../games/spaceImpact.js';
import { useHighScore } from '../useHighScore.js';

const WIDTH = 16;
const HEIGHT = 7;
const TICK_MS = 180;

function newGame() {
  return createGame({ width: WIDTH, height: HEIGHT });
}

// 12b SPACE IMPACT — minimal side-scroll shooter; the player column stays
// fixed (PLAYER_X from the engine), waves of enemies scroll in from the right.
export function SpaceImpact({ onBack }) {
  const [game, setGame] = useState(newGame);
  const [running, setRunning] = useState(false);
  const { recordScore } = useHighScore('spaceImpact');

  const active = running && game.status === 'playing';

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setGame((g) => tick(g)), TICK_MS);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (game.status !== 'playing') recordScore(game.score);
  }, [game.status, game.score, recordScore]);

  const doMove = useCallback((dir) => {
    setGame((g) => move(g, dir));
    setRunning(true);
  }, []);

  const doFire = useCallback(() => {
    setGame((g) => fire(g));
    setRunning(true);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        doMove('up');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        doMove('down');
      } else if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        doFire();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove, doFire]);

  const handleRetry = () => {
    setGame(newGame());
    setRunning(false);
  };

  const gameOver = game.status !== 'playing';
  const enemyKeys = new Set(game.enemies.map((e) => `${e.x},${e.y}`));
  const bulletKeys = new Set(game.bullets.map((b) => `${b.x},${b.y}`));
  const playerKey = `${PLAYER_X},${game.player.y}`;

  const cells = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const key = `${x},${y}`;
      let className = 'nk-si-cell';
      if (key === playerKey) className += ' nk-si-cell--player';
      else if (enemyKeys.has(key)) className += ' nk-si-cell--enemy';
      else if (bulletKeys.has(key)) className += ' nk-si-cell--bullet';
      cells.push(<div key={key} className={className} aria-hidden="true" />);
    }
  }

  return (
    <NokiaShell
      header={
        <SectionHeader
          title="Space Impact"
          context={`W${game.wave} ${'♥'.repeat(game.lives)}`}
        />
      }
      leftKey={gameOver ? { label: 'Retry', action: handleRetry } : { label: 'Fire', action: doFire }}
      rightKey={{ label: 'Quit', action: onBack }}
      className="nk-screen--space"
    >
      <div className="nk-si-grid" style={{ gridTemplateColumns: `repeat(${WIDTH}, 1fr)` }}>
        {cells}
      </div>
      {gameOver && (
        <div className="nk-game-over" role="status">
          {game.status === 'won' ? 'YOU WIN' : 'GAME OVER'} · {game.score}
        </div>
      )}
      <div className="nk-dpad nk-dpad--vertical" role="group" aria-label="Move">
        <button type="button" className="nk-dpad__btn nk-dpad__up" onClick={() => doMove('up')} aria-label="Up">▲</button>
        <button type="button" className="nk-dpad__btn nk-dpad__fire" onClick={doFire} aria-label="Fire">●</button>
        <button type="button" className="nk-dpad__btn nk-dpad__down" onClick={() => doMove('down')} aria-label="Down">▼</button>
      </div>
    </NokiaShell>
  );
}
