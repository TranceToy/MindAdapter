import { describe, expect, it } from 'vitest';
import type { BedPair } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { BEAT_SECONDS } from '../script/session-duration';
import { bedGlides, leftFrequency, rightFrequency } from './bed-schedule';
import { LEAD_IN_SECONDS } from './word-clock';

const DEEPER: BedPair = { carrier: 200, beat: 4 };
const DEEPEST: BedPair = { carrier: 90, beat: 2 };

function segment(bed: BedPair, words: number): Segment {
  return { tags: [], bed, voice: [], words: new Array(words).fill('down') };
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
      { at: LEAD_IN_SECONDS + 4 * BEAT_SECONDS, bed: DEEPEST },
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
