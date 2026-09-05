import { BEAT_SECONDS } from '../script/session-duration';

export const LEAD_IN_SECONDS = 10;

export type WordCue =
  | { kind: 'lead-in' }
  | { kind: 'word'; index: number }
  | { kind: 'ended' };

const LEAD_IN: WordCue = { kind: 'lead-in' };
const ENDED: WordCue = { kind: 'ended' };

export function cueAt(elapsed: number, words: number): WordCue {
  if (elapsed < LEAD_IN_SECONDS) return LEAD_IN;
  const index = Math.floor((elapsed - LEAD_IN_SECONDS) / BEAT_SECONDS);
  if (index >= words) return ENDED;
  return { kind: 'word', index };
}
