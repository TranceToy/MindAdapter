import type { Segment } from './resolve-script';
import { sessionSeconds, wordTimes } from './word-times';

// One run of a script from its first word to its last, and how many of them a
// session is made of: a script that does not loop is one round, a script that
// loops is rounds back to back until the exit gesture.
export type Rounds = {
  seconds: number;
  loops: boolean;
};

// Where a session has got to when its script comes round: the rounds behind it
// and the second it has reached in the one running.
export type Round = {
  behind: number;
  at: number;
};

// For the bed the calibration preview holds, which plays against no script and
// so never comes round.
export const ONE_ROUND: Rounds = { seconds: 0, loops: false };

export function sessionRounds(segments: Segment[], loops: boolean): Rounds {
  const times = wordTimes(segments);
  const seconds = sessionSeconds(times);
  return { seconds, loops };
}

// A script that does not loop has one round and no seam, so its second is the
// session's own however far past the last word the session has got.
export function roundAt(rounds: Rounds, elapsed: number): Round {
  if (!rounds.loops) return { behind: 0, at: elapsed };
  const behind = Math.floor(elapsed / rounds.seconds);
  const at = elapsed - behind * rounds.seconds;
  // The seam belongs to the round after it and never to the end of the round
  // before, which a division landing a hair short would put it at: a second as
  // long as the whole round reads as the word past the last, and the word past
  // the last is the cue a session ends on.
  if (at >= rounds.seconds) return { behind: behind + 1, at: 0 };
  return { behind, at };
}
