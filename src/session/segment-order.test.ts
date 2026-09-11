import { describe, expect, it } from 'vitest';
import { DEFAULT_BED, DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { beatSeconds, onsetSeconds, sessionSeconds } from '../script/word-times';
import type { Roll } from './draw';
import { drawnOrder, segmentOrder, writtenOrder } from './segment-order';

function word(text: string): Word {
  return { text, marked: false };
}

function segment(tag: string, words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [tag],
    bed: DEFAULT_BED,
    voice: [],
    pace,
    gap: DEFAULT_GAP,
    spirals: [],
    words: new Array(words).fill(word(tag)),
  };
}

function rolling(...values: number[]): Roll {
  let index = 0;
  return () => values[index++] ?? 0;
}

function tagsOf(segments: Segment[]): string[] {
  return segments.map((held) => held.tags[0] ?? '');
}

function textsOf(words: Word[]): string[] {
  return words.map((held) => held.text);
}

const OCEAN = segment('ocean', 4);
const VOID = segment('void', 8, 120);
const SURFACE = segment('surface', 12, 180);
const WRITTEN = [OCEAN, VOID, SURFACE];

// The keys a round is sorted on, one roll to a segment in the order the script
// was written, so the order a round draws is written out here rather than
// hoped for.
const VOID_FIRST = [0.9, 0.1, 0.5];
const VOID_THEN_OCEAN = [0.2, 0.1, 0.3];
const OCEAN_FIRST = [0.1, 0.9, 0.5];

describe('writtenOrder', () => {
  const order = writtenOrder(WRITTEN);

  it('plays the segments in the order the author wrote them', () => {
    expect(tagsOf(order.playing(0).segments)).toEqual(['ocean', 'void', 'surface']);
  });

  it('plays that same order every round, since nothing is drawn', () => {
    expect(order.playing(7)).toBe(order.playing(0));
  });

  it('spends the words of the whole script', () => {
    expect(order.playing(0).words).toHaveLength(24);
    expect(order.playing(0).times.words).toBe(24);
  });
});

describe('drawnOrder', () => {
  it('draws every segment of the script once a round', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST));
    const drawn = tagsOf(order.playing(0).segments);
    expect([...drawn].sort()).toEqual(['ocean', 'surface', 'void']);
  });

  it('draws the order the roll asks for', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST));
    expect(tagsOf(order.playing(0).segments)).toEqual(['void', 'surface', 'ocean']);
  });

  it('draws a fresh order for every round', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST, ...VOID_THEN_OCEAN));
    expect(tagsOf(order.playing(0).segments)).toEqual(['void', 'surface', 'ocean']);
    expect(tagsOf(order.playing(1).segments)).toEqual(['void', 'ocean', 'surface']);
  });

  // The round before it closes on ocean and this one would have opened on it,
  // so the head is traded for a segment drawn from the rest of the order: one
  // roll past the three the order itself spent.
  it('never opens a round on the segment the round before it closed on', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST, ...OCEAN_FIRST, 0.6));
    const opening = tagsOf(order.playing(0).segments);
    const next = tagsOf(order.playing(1).segments);
    expect(opening[opening.length - 1]).toBe('ocean');
    expect(next[0]).not.toBe('ocean');
    expect(next).toEqual(['void', 'surface', 'ocean']);
  });

  it('holds the order a round drew, so every layer of it reads the same one', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST));
    expect(order.playing(2)).toBe(order.playing(2));
    expect(order.playing(0)).not.toBe(order.playing(1));
  });

  // The whole of what lets a shuffled script keep the loop's arithmetic: a
  // segment's pace was resolved where it was written and travels with it, so a
  // round is the same word counts at the same paces summed the other way round.
  it('is as long a round however its segments are ordered', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST));
    const written = sessionSeconds(writtenOrder(WRITTEN).playing(0).times);
    for (const round of [0, 1, 2, 3]) {
      expect(sessionSeconds(order.playing(round).times)).toBeCloseTo(written, 9);
    }
  });

  it('lands a round on the line its own order makes', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST));
    const times = order.playing(0).times;
    expect(onsetSeconds(times, 1)).toBeCloseTo(beatSeconds(120), 9);
  });

  it('spends the same words a round whatever order it spends them in', () => {
    const order = drawnOrder(WRITTEN, rolling(...VOID_FIRST));
    const drawn = textsOf(order.playing(0).words);
    const written = textsOf(writtenOrder(WRITTEN).playing(0).words);
    expect([...drawn].sort()).toEqual([...written].sort());
  });
});

describe('segmentOrder', () => {
  it('plays what was written where the script does not shuffle', () => {
    const order = segmentOrder(WRITTEN, false, rolling(...VOID_FIRST));
    expect(tagsOf(order.playing(0).segments)).toEqual(['ocean', 'void', 'surface']);
    expect(tagsOf(order.playing(1).segments)).toEqual(['ocean', 'void', 'surface']);
  });

  it('draws the order where it does', () => {
    const order = segmentOrder(WRITTEN, true, rolling(...VOID_FIRST));
    expect(tagsOf(order.playing(0).segments)).toEqual(['void', 'surface', 'ocean']);
  });
});
