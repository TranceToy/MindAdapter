import { describe, expect, it } from 'vitest';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { BedPair } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { beatSeconds } from '../script/word-times';
import { bedGlides, leftFrequency, rightFrequency } from './bed-schedule';

const DEEPER: BedPair = { carrier: 200, beat: 4 };
const DEEPEST: BedPair = { carrier: 90, beat: 2 };

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);

const WORD: Word = { text: 'down', marked: false };

function segment(bed: BedPair, words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed,
    voice: [],
    pace,
    gap: DEFAULT_GAP,
    spirals: [],
    words: new Array(words).fill(WORD),
  };
}

describe('bedGlides', () => {
  it('opens on the first segment pair, at zero', () => {
    expect(bedGlides([segment(DEEPER, 4)])).toEqual([{ at: 0, bed: DEEPER }]);
  });

  it('runs at the defaults when there is nothing to read', () => {
    expect(bedGlides([])).toEqual([{ at: 0, bed: { carrier: 150, beat: 6 } }]);
  });

  it('holds through segments that inherit the running pair', () => {
    const segments = [segment(DEEPER, 4), segment(DEEPER, 4)];
    expect(bedGlides(segments)).toEqual([{ at: 0, bed: DEEPER }]);
  });

  it('lands a new pair on the beat of its first word', () => {
    const segments = [segment(DEEPER, 4), segment(DEEPEST, 4)];
    expect(bedGlides(segments)).toEqual([
      { at: 0, bed: DEEPER },
      { at: 4 * BEAT_SECONDS, bed: DEEPEST },
    ]);
  });

  it('lands a pair on a beat the segments before it were paced by', () => {
    const segments = [segment(DEEPER, 4, 120), segment(DEEPEST, 4)];
    expect(bedGlides(segments)).toEqual([
      { at: 0, bed: DEEPER },
      { at: 4 * beatSeconds(120), bed: DEEPEST },
    ]);
  });

  it('returns to a pair it has left', () => {
    const segments = [segment(DEEPER, 4), segment(DEEPEST, 4), segment(DEEPER, 4)];
    expect(bedGlides(segments)).toHaveLength(3);
  });
});

describe('the ears', () => {
  it('carry the carrier and the carrier offset by the beat', () => {
    expect(leftFrequency(DEEPER)).toBe(200);
    expect(rightFrequency(DEEPER)).toBe(204);
  });
});
