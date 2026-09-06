import { pixelRuns } from '../lib/pixelIcons/runs.js';
import { FRAMES, FLAG_WIDTH, FLAG_HEIGHT } from '../lib/bootFlagFrames.js';

// Computed once at import: the maps are constants, and the splash mounts under
// a timer that is already competing with the boot chime.
const FRAME_RUNS = FRAMES.map((rows) => pixelRuns(rows));

/**
 * The waving flag on the boot splash: the three maps in bootFlagFrames.js
 * stacked as three SVGs on the same 48x28 grid. Which one is visible is
 * boot.css's job — this component only draws all three.
 *
 * Decorative: the splash already says "Starting Windows 95..." underneath it.
 */
export function BootFlag() {
  return (
    <div className="boot-flag" aria-hidden="true">
      {FRAME_RUNS.map((runs, i) => (
        <svg
          key={`frame-${i + 1}`}
          className={`boot-flag__frame boot-flag__frame--${i + 1}`}
          viewBox={`0 0 ${FLAG_WIDTH} ${FLAG_HEIGHT}`}
          shapeRendering="crispEdges"
          focusable="false"
        >
          {runs.map((run) => (
            <rect
              key={`${run.y}-${run.x}`}
              x={run.x}
              y={run.y}
              width={run.width}
              height={1}
              fill={run.fill}
            />
          ))}
        </svg>
      ))}
    </div>
  );
}
