export type Elapsed = () => number;

export function anchorClock(context: AudioContext): Elapsed {
  const started = context.currentTime;
  return () => context.currentTime - started;
}
