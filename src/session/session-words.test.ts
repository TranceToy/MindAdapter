import { describe, expect, it } from 'vitest';
import type { Segment } from '../script/resolve-script';
import { sessionWords, wordCount } from './session-words';

function segment(words: string[]): Segment {
  return { tags: [], bed: { carrier: 150, beat: 6 }, voice: [], words };
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

describe('wordCount', () => {
  it('is every segment length, summed', () => {
    const segments = [segment(['down', 'softer']), segment(['down'])];
    expect(wordCount(segments)).toBe(3);
  });

  it('is nothing without segments', () => {
    expect(wordCount([])).toBe(0);
  });
});
