import { roundAt } from '../script/session-round';
import type { Rounds } from '../script/session-round';

export type Elapsed = () => number;

// Anchored on a time the caller already holds, so the audio schedule and the
// word beat are measured from the same instant.
export function anchorClock(context: AudioContext, from: number): Elapsed {
  return () => context.currentTime - from;
}

// What a layer that only ever reads where the round has got to sees: a clock
// that comes round with the script rather than running past its last word, so
// the words begin again on the beat after the last instead of ending there.
export function roundClock(rounds: Rounds, elapsed: Elapsed): Elapsed {
  return () => roundAt(rounds, elapsed()).at;
}
