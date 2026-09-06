import { DEFAULT_BED } from '../script/declaration-values';
import type { BedPair } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { onsetSeconds, wordTimes } from '../script/word-times';
import type { WordTimes } from '../script/word-times';

export type BedGlide = {
  at: number;
  bed: BedPair;
};

export type Ear = (bed: BedPair) => number;

// The whole session's bed is known before a word is shown, so it is a schedule
// rather than a state machine. The opening pair lands at zero, under the first
// word; every later pair lands on the beat of the first word of the segment that
// declares it.
export function bedGlides(segments: Segment[]): BedGlide[] {
  const times = wordTimes(segments);
  const opening = segments[0]?.bed ?? DEFAULT_BED;
  const glides: BedGlide[] = [{ at: 0, bed: opening }];
  let running = opening;
  let words = 0;
  for (const segment of segments) {
    if (!samePair(segment.bed, running)) glides.push(glideAt(times, words, segment.bed));
    running = segment.bed;
    words += segment.words.length;
  }
  return glides;
}

export function leftFrequency(bed: BedPair): number {
  return bed.carrier;
}

// The beat frequency is the offset between the ears, and it is the effect
// itself: the right ear carries it, the left carries the carrier alone.
export function rightFrequency(bed: BedPair): number {
  return bed.carrier + bed.beat;
}

function glideAt(times: WordTimes, word: number, bed: BedPair): BedGlide {
  return { at: onsetSeconds(times, word), bed };
}

function samePair(left: BedPair, right: BedPair): boolean {
  return left.carrier === right.carrier && left.beat === right.beat;
}
