import { describe, expect, it } from 'vitest';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { beatSeconds } from '../script/word-times';
import { snapBeats } from './snap-schedule';

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);

function word(text: string, marked = false): Word {
  return { text, marked };
}

function segment(words: Word[], pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed: { carrier: 150, beat: 6 },
    voice: [],
    pace,
    gap: DEFAULT_GAP,
    spirals: [],
    words,
  };
}

describe('snapBeats', () => {
  it('sounds nothing where a script marks nothing', () => {
    const segments = [segment([word('down'), word('further')])];
    expect(snapBeats(segments)).toEqual([]);
  });

  it('sounds on the beat the marked word lands on', () => {
    const segments = [segment([word('down'), word('heavy', true)])];
    expect(snapBeats(segments)).toEqual([BEAT_SECONDS]);
  });

  it('sounds once for every word of a marked run', () => {
    const marked = [word('down', true), word('and', true), word('further', true)];
    expect(snapBeats([segment(marked)])).toEqual([0, BEAT_SECONDS, 2 * BEAT_SECONDS]);
  });

  it('counts a later segment past the words before it', () => {
    const opening = segment([word('down'), word('further')]);
    const closing = segment([word('heavy', true)]);
    expect(snapBeats([opening, closing])).toEqual([2 * BEAT_SECONDS]);
  });

  it('reads a marked word off the pace in force where it sits', () => {
    const opening = segment([word('down'), word('heavy', true)], 120);
    const closing = segment([word('heavier', true)], 240);
    const slow = beatSeconds(120);
    expect(snapBeats([opening, closing])).toEqual([slow, 2 * slow]);
  });
});
