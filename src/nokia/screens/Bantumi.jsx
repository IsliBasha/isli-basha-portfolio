import { useEffect, useState } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { createGame, applyMove, chooseAiMove } from '../games/bantumi.js';
import { useHighScore } from '../useHighScore.js';

const AI_MOVE_DELAY_MS = 500;

function turnLabel(game) {
  if (game.status === 'over') return 'Game over';
  return game.turn === 'player' ? 'Your turn' : 'AI turn';
}

function winnerLabel(game) {
  if (game.winner === 'tie') return 'TIE GAME';
  return game.winner === 'player' ? 'YOU WIN' : 'YOU LOSE';
}

// 12c BANTUMI — classic 6-pit Kalah/Mancala rules against a greedy 1-ply AI.
export function Bantumi({ onBack }) {
  const [game, setGame] = useState(createGame);
  const { recordScore } = useHighScore('bantumi');

  useEffect(() => {
    if (game.status !== 'playing' || game.turn !== 'ai') return undefined;
    const id = setTimeout(() => {
      setGame((g) => {
        const pit = chooseAiMove(g);
        return pit == null ? g : applyMove(g, pit);
      });
    }, AI_MOVE_DELAY_MS);
    return () => clearTimeout(id);
  }, [game]);

  useEffect(() => {
    if (game.status === 'over') recordScore(game.board[game.playerStoreIndex]);
  }, [game.status, game.board, game.playerStoreIndex, recordScore]);

  const handlePlay = (pit) => {
    if (game.turn !== 'player' || game.status !== 'playing') return;
    setGame((g) => applyMove(g, pit));
  };

  const handleRetry = () => setGame(createGame());

  const aiPits = Array.from({ length: game.pitsPerSide }, (_, i) => game.pitsPerSide + 1 + i).reverse();
  const playerPits = Array.from({ length: game.pitsPerSide }, (_, i) => i);
  const gameOver = game.status === 'over';

  return (
    <NokiaShell
      header={
        <SectionHeader title="Bantumi" context={turnLabel(game)} />
      }
      leftKey={gameOver ? { label: 'Retry', action: handleRetry } : undefined}
      rightKey={{ label: 'Back', action: onBack }}
      className="nk-screen--bantumi"
    >
      <div className="nk-bantumi">
        <div className="nk-bantumi__store" aria-label="AI store">{game.board[game.aiStoreIndex]}</div>
        <div className="nk-bantumi__board">
          <div className="nk-bantumi__row nk-bantumi__row--ai">
            {aiPits.map((i) => (
              <span key={i} className="nk-bantumi__pit" aria-hidden="true">
                {game.board[i]}
              </span>
            ))}
          </div>
          <div className="nk-bantumi__row nk-bantumi__row--player">
            {playerPits.map((i) => (
              <button
                key={i}
                type="button"
                className="nk-bantumi__pit nk-bantumi__pit--player"
                disabled={game.turn !== 'player' || game.status !== 'playing' || game.board[i] === 0}
                onClick={() => handlePlay(i)}
                aria-label={`Pit ${i + 1}: ${game.board[i]} stones`}
              >
                {game.board[i]}
              </button>
            ))}
          </div>
        </div>
        <div className="nk-bantumi__store" aria-label="Your store">{game.board[game.playerStoreIndex]}</div>
      </div>
      {gameOver && (
        <div className="nk-game-over" role="status">
          {winnerLabel(game)} ·{' '}
          {game.board[game.playerStoreIndex]}-{game.board[game.aiStoreIndex]}
        </div>
      )}
    </NokiaShell>
  );
}
