import type { WordTimes } from '../script/word-times';
import { followPosition } from './cursor';
import type { Cursor } from './cursor';
import type { Elapsed } from './session-clock';
import { wordAt } from './word-clock';

// The word the session is on, as a position a layer can wait for: the first
// word sits at zero, the ending past the last.
export function followWords(elapsed: Elapsed, times: WordTimes): Cursor {
  function position(): number {
    return wordAt(times, elapsed());
  }

  return followPosition(position);
}
