import { wordBySecond } from '../script/word-times';
import type { WordTimes } from '../script/word-times';

export type WordCue = { kind: 'word'; index: number } | { kind: 'ended' };

const ENDED: WordCue = { kind: 'ended' };

export function cueAt(times: WordTimes, elapsed: number): WordCue {
  const index = wordBySecond(times, elapsed);
  if (index >= times.words) return ENDED;
  return { kind: 'word', index };
}

// The cue as a position on the same line the image schedule is written along:
// the first word sits at zero, the ending past the last.
export function wordAt(times: WordTimes, elapsed: number): number {
  const cue = cueAt(times, elapsed);
  if (cue.kind === 'ended') return times.words;
  return cue.index;
}
