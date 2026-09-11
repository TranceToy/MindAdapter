import { roundAt } from '../script/session-round';
import type { Rounds } from '../script/session-round';
import { followPosition } from './cursor';
import type { Cursor } from './cursor';
import type { SegmentOrder } from './segment-order';
import type { Elapsed } from './session-clock';
import { wordAt } from './word-clock';

// The word the session is on, as a position a layer can wait for: the first
// word sits at zero, the ending past the last. A script that comes round counts
// on into the round after it rather than back to its own first word, because a
// position that went backwards is one a layer would find already reached. How
// many words a round holds is the same however its segments are ordered; which
// word a second lands on is the round's own, so it is read off the round's line.
export function followWords(elapsed: Elapsed, order: SegmentOrder, rounds: Rounds): Cursor {
  const words = order.playing(0).times.words;

  function position(): number {
    const round = roundAt(rounds, elapsed());
    const times = order.playing(round.behind).times;
    return round.behind * words + wordAt(times, round.at);
  }

  return followPosition(position);
}
