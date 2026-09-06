import { describe, expect, it } from 'vitest';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { sessionWords } from './session-words';

function plain(text: string): Word {
  return { text, marked: false };
}

function segment(words: Word[]): Segment {
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

const MARKED: Word = { text: 'heavy', marked: true };

describe('sessionWords', () => {
  it('is every segment in order, flat', () => {
    const first = segment([plain('down'), plain('softer')]);
    const second = segment([plain('down'), plain('again')]);
    const flat = [plain('down'), plain('softer'), plain('down'), plain('again')];
    expect(sessionWords([first, second])).toEqual(flat);
  });

  it('carries a marked word across as it was written', () => {
    const only = segment([plain('down'), MARKED]);
    expect(sessionWords([only])).toEqual([plain('down'), MARKED]);
  });

  it('is empty without segments', () => {
    expect(sessionWords([])).toEqual([]);
  });
});
