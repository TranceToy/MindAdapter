import { roundAt } from '../script/session-round';
import type { Rounds } from '../script/session-round';
import type { WordTimes } from '../script/word-times';
import { followPosition } from './cursor';
import type { Cursor } from './cursor';
import type { Elapsed } from './session-clock';
import { wordAt } from './word-clock';

// The word the session is on, as a position a layer can wait for: the first
// word sits at zero, the ending past the last. A script that comes round counts
// on into the round after it rather than back to its own first word, because a
// position that went backwards is one a layer would find already reached.
export function followWords(elapsed: Elapsed, times: WordTimes, rounds: Rounds): Cursor {
  function position(): number {
    const round = roundAt(rounds, elapsed());
    return round.behind * times.words + wordAt(times, round.at);
  }

  return followPosition(position);
}
