import { BEAT_SECONDS } from '../script/session-duration';

export type WordCue = { kind: 'word'; index: number } | { kind: 'ended' };

const ENDED: WordCue = { kind: 'ended' };

export function cueAt(elapsed: number, words: number): WordCue {
  const index = Math.floor(elapsed / BEAT_SECONDS);
  if (index >= words) return ENDED;
  return { kind: 'word', index };
}

// The cue as a position on the same line the image schedule is written along:
// the first word sits at zero, the ending past the last.
export function wordAt(elapsed: number, words: number): number {
  const cue = cueAt(elapsed, words);
  if (cue.kind === 'ended') return words;
  return cue.index;
}
