import { describe, expect, it } from 'vitest';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { sessionWords } from './session-words';

function segment(words: string[]): Segment {
  return {
    tags: [],
    bed: { carrier: 150, beat: 6 },
    voice: [],
    pace: DEFAULT_PACE,
    gap: DEFAULT_GAP,
    spirals: [],
    words,
  };
}

describe('sessionWords', () => {
  it('is every segment in order, flat', () => {
    const segments = [segment(['down', 'softer']), segment(['down', 'again'])];
    expect(sessionWords(segments)).toEqual(['down', 'softer', 'down', 'again']);
  });

  it('is empty without segments', () => {
    expect(sessionWords([])).toEqual([]);
  });
});
