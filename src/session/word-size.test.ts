import { describe, expect, it } from 'vitest';
import { SAMPLE_SIZE, fittedSize, widestWord } from './word-size';

const VIEW = { width: 1000, height: 800 };

describe('fittedSize', () => {
  it('takes the height bound when width allows more', () => {
    expect(fittedSize(SAMPLE_SIZE, VIEW)).toBeCloseTo(240);
  });

  it('takes the width bound when the word is long', () => {
    expect(fittedSize(SAMPLE_SIZE * 10, VIEW)).toBeCloseTo(92);
  });

  it('falls back to the height bound without a measurement', () => {
    expect(fittedSize(0, VIEW)).toBeCloseTo(240);
  });
});

describe('widestWord', () => {
  it('is the word measuring widest, not the longest', () => {
    const widths: Record<string, number> = { IIIII: 40, WWW: 90, OK: 30 };
    const measure = (word: string) => widths[word] ?? 0;
    expect(widestWord(['IIIII', 'WWW', 'OK'], measure)).toBe('WWW');
  });

  it('measures each distinct word once', () => {
    const seen: string[] = [];
    const measure = (word: string) => {
      seen.push(word);
      return word.length;
    };
    widestWord(['down', 'down', 'softer'], measure);
    expect(seen).toEqual(['down', 'softer']);
  });

  it('is empty without words', () => {
    expect(widestWord([], () => 0)).toBe('');
  });
});
