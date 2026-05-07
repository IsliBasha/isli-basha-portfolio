export const MIN_WIDTH = 220;
export const MIN_HEIGHT = 140;

export function computeResize({
  edge,
  startWidth,
  startHeight,
  deltaX,
  deltaY,
}) {
  let width = startWidth;
  let height = startHeight;

  if (edge === 'right' || edge === 'corner') {
    width = startWidth + deltaX;
  }
  if (edge === 'bottom' || edge === 'corner') {
    height = startHeight + deltaY;
  }

  return {
    width: Math.max(MIN_WIDTH, Math.round(width)),
    height: Math.max(MIN_HEIGHT, Math.round(height)),
  };
}
