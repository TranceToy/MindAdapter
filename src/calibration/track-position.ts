export type RailBounds = {
  left: number;
  width: number;
};

// A drag reaching past either end holds at that end rather than folding back,
// so a gesture that overshoots sets zero or full instead of something else.
export function positionWithin(clientX: number, rail: RailBounds): number {
  if (rail.width <= 0) return 0;
  const across = (clientX - rail.left) / rail.width;
  return Math.min(Math.max(across, 0), 1);
}
