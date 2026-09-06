import { followPosition } from './cursor';
import type { Cursor } from './cursor';
import type { Elapsed } from './session-clock';
import { wordAt } from './word-clock';

// The word the session is on, as a position a layer can wait for: the lead-in
// sits before the first word, the ending past the last.
export function followWords(elapsed: Elapsed, words: number): Cursor {
  function position(): number {
    return wordAt(elapsed(), words);
  }

  return followPosition(position);
}
