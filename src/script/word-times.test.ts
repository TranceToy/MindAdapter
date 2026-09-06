import { describe, expect, it } from 'vitest';
import { DEFAULT_BED, DEFAULT_PACE } from './declaration-values';
import type { Segment } from './resolve-script';
import { beatSeconds, onsetSeconds, sessionSeconds, wordBySecond, wordTimes } from './word-times';

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);
const SLOW_PACE = 120;
const SLOW_BEAT = beatSeconds(SLOW_PACE);

function segment(words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed: DEFAULT_BED,
    voice: [],
    pace,
    spiral: null,
    words: new Array(words).fill('down'),
  };
}

describe('beatSeconds', () => {
  it('is a minute divided by the words asked of it', () => {
    expect(beatSeconds(60)).toBe(1);
    expect(beatSeconds(220)).toBeCloseTo(0.273, 3);
  });
});

describe('wordTimes', () => {
  it('holds one span for a script paced throughout', () => {
    const times = wordTimes([segment(4), segment(4)]);
    expect(times.spans).toEqual([{ word: 0, at: 0, beat: BEAT_SECONDS }]);
    expect(times.words).toBe(8);
  });

  it('opens a span on the first word of a segment that changes the pace', () => {
    const times = wordTimes([segment(4), segment(4, SLOW_PACE)]);
    expect(times.spans).toEqual([
      { word: 0, at: 0, beat: BEAT_SECONDS },
      { word: 4, at: 4 * BEAT_SECONDS, beat: SLOW_BEAT },
    ]);
  });

  it('runs at the app default when there is nothing to read', () => {
    const times = wordTimes([]);
    expect(times.spans).toEqual([{ word: 0, at: 0, beat: BEAT_SECONDS }]);
    expect(times.words).toBe(0);
  });
});

describe('onsetSeconds', () => {
  it('lands the first word on the start gesture', () => {
    expect(onsetSeconds(wordTimes([segment(4)]), 0)).toBe(0);
  });

  it('counts a word from the span holding it', () => {
    const times = wordTimes([segment(4), segment(4, SLOW_PACE)]);
    expect(onsetSeconds(times, 2)).toBeCloseTo(2 * BEAT_SECONDS, 9);
    expect(onsetSeconds(times, 6)).toBeCloseTo(4 * BEAT_SECONDS + 2 * SLOW_BEAT, 9);
  });

  it('carries the closing span past the last word', () => {
    const times = wordTimes([segment(4), segment(4, SLOW_PACE)]);
    expect(onsetSeconds(times, 8)).toBeCloseTo(4 * BEAT_SECONDS + 4 * SLOW_BEAT, 9);
  });
});

describe('wordBySecond', () => {
  it('is the word the second falls on, either side of a pace change', () => {
    const times = wordTimes([segment(4), segment(4, SLOW_PACE)]);
    expect(wordBySecond(times, 0)).toBe(0);
    expect(wordBySecond(times, 3.5 * BEAT_SECONDS)).toBe(3);
    expect(wordBySecond(times, 4 * BEAT_SECONDS + 1.5 * SLOW_BEAT)).toBe(5);
  });

  it('counts past the last word once the script is spent', () => {
    const times = wordTimes([segment(4)]);
    expect(wordBySecond(times, 5 * BEAT_SECONDS)).toBe(5);
  });
});

describe('sessionSeconds', () => {
  it('is every segment at the pace it holds', () => {
    expect(sessionSeconds(wordTimes([segment(220)]))).toBeCloseTo(60, 9);
    expect(sessionSeconds(wordTimes([segment(110), segment(60, SLOW_PACE)]))).toBeCloseTo(60, 9);
    expect(sessionSeconds(wordTimes([]))).toBe(0);
  });
});
