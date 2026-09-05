export type Elapsed = () => number;

// Anchored on a time the caller already holds, so the audio schedule and the
// word beat are measured from the same instant.
export function anchorClock(context: AudioContext, from: number): Elapsed {
  return () => context.currentTime - from;
}
