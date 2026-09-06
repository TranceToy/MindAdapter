import { describe, expect, it } from 'vitest';
import { DEFAULT_BED, DEFAULT_PACE } from './declaration-values';
import type { Segment } from './resolve-script';
import { durationLabel, durationText } from './session-duration';

function segment(words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed: DEFAULT_BED,
    voice: [],
    pace,
    spirals: [],
    words: new Array(words).fill('down'),
  };
}

describe('durationLabel', () => {
  it('reads as minutes and seconds', () => {
    expect(durationLabel(60)).toBe('1:00');
    expect(durationLabel(1205)).toBe('20:05');
    expect(durationLabel(0)).toBe('0:00');
  });
});

describe('durationText', () => {
  it('is the script read at the pace it declares', () => {
    expect(durationText([segment(220)])).toBe('1:00');
    expect(durationText([segment(110, 110)])).toBe('1:00');
  });

  it('sums segments that are paced apart', () => {
    expect(durationText([segment(110), segment(60, 120)])).toBe('1:00');
  });

  it('is nothing without segments', () => {
    expect(durationText([])).toBe('0:00');
  });
});
