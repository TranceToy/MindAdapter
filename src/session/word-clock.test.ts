import { describe, expect, it } from 'vitest';
import { DEFAULT_BED, DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { beatSeconds, wordTimes } from '../script/word-times';
import { cueAt, wordAt } from './word-clock';

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);
const SLOW_PACE = 120;
const SLOW_BEAT = beatSeconds(SLOW_PACE);

function segment(words: number, pace = DEFAULT_PACE): Segment {
  return { tags: [], bed: DEFAULT_BED, voice: [], pace, words: new Array(words).fill('down') };
}

function timesOf(...segments: Segment[]) {
  return wordTimes(segments);
}

const HUNDRED = timesOf(segment(100));

function midBeat(index: number): number {
  return (index + 0.5) * BEAT_SECONDS;
}

describe('cueAt', () => {
  it('starts word one on the start gesture', () => {
    expect(cueAt(HUNDRED, 0)).toEqual({ kind: 'word', index: 0 });
  });

  it('beats every 273 ms at the pace a script that declares none runs at', () => {
    expect(BEAT_SECONDS).toBeCloseTo(0.273, 3);
    expect(cueAt(HUNDRED, midBeat(1))).toEqual({ kind: 'word', index: 1 });
    expect(cueAt(HUNDRED, midBeat(2))).toEqual({ kind: 'word', index: 2 });
  });

  it('does not drift across a long script', () => {
    const times = timesOf(segment(4400));
    expect(cueAt(times, midBeat(4399))).toEqual({ kind: 'word', index: 4399 });
  });

  it('ends once the last word has had its beat', () => {
    expect(cueAt(HUNDRED, midBeat(99))).toEqual({ kind: 'word', index: 99 });
    expect(cueAt(HUNDRED, midBeat(100))).toEqual({ kind: 'ended' });
  });

  it('takes a segment at its own pace, from where the one before it left off', () => {
    const times = timesOf(segment(4), segment(4, SLOW_PACE));
    const opening = 4 * BEAT_SECONDS;
    expect(cueAt(times, opening + 0.5 * SLOW_BEAT)).toEqual({ kind: 'word', index: 4 });
    expect(cueAt(times, opening + 2.5 * SLOW_BEAT)).toEqual({ kind: 'word', index: 6 });
    expect(cueAt(times, opening + 4 * SLOW_BEAT)).toEqual({ kind: 'ended' });
  });
});

describe('wordAt', () => {
  it('is the word on the beat', () => {
    expect(wordAt(HUNDRED, 0)).toBe(0);
    expect(wordAt(HUNDRED, midBeat(0))).toBe(0);
    expect(wordAt(HUNDRED, midBeat(7))).toBe(7);
  });

  it('runs past the last word once the script is spent', () => {
    expect(wordAt(HUNDRED, midBeat(100))).toBe(100);
  });
});
