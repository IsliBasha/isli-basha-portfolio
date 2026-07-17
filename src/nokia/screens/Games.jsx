import { useEffect, useState } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { useHighScore } from '../useHighScore.js';

// 11 GAMES — list of the three playable games with pixel icons + HI scores.
const GAMES = [
  { id: 'snake', label: 'Snake II', route: 'snake' },
  { id: 'spaceImpact', label: 'Space Impact', route: 'space' },
  { id: 'bantumi', label: 'Bantumi', route: 'bantumi' },
];

function formatHi(score) {
  return `HI ${String(score).padStart(4, '0')}`;
}

function GameRow({ game, focused, onFocus, onOpen }) {
  const { highScore } = useHighScore(game.id);
  return (
    <li
      role="menuitem"
      tabIndex={-1}
      aria-current={focused ? true : undefined}
      className={`nk-game-item ${focused ? 'nk-game-item--focused' : ''}`}
      onMouseEnter={onFocus}
      onClick={onOpen}
    >
      <span className={`nk-game-item__icon nk-game-item__icon--${game.id}`} aria-hidden="true" />
      <span className="nk-game-item__label">{game.label}</span>
      <span className="nk-game-item__hi">{formatHi(highScore)}</span>
    </li>
  );
}

export function Games({ onOpen, onBack }) {
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocus((f) => (f + 1) % GAMES.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocus((f) => (f - 1 + GAMES.length) % GAMES.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onOpen(GAMES[focus].route);
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        onBack();
      } else if (/^[1-3]$/.test(event.key)) {
        event.preventDefault();
        onOpen(GAMES[Number(event.key) - 1].route);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, onOpen, onBack]);

  return (
    <NokiaShell
      header={<SectionHeader title="6 Games" context={`${focus + 1}/${GAMES.length}`} />}
      leftKey={{ label: 'Play', action: () => onOpen(GAMES[focus].route) }}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--games"
    >
      <ul className="nk-game-list" role="menu" aria-label="Games">
        {GAMES.map((game, i) => (
          <GameRow
            key={game.id}
            game={game}
            focused={i === focus}
            onFocus={() => setFocus(i)}
            onOpen={() => onOpen(game.route)}
          />
        ))}
      </ul>
    </NokiaShell>
  );
}
