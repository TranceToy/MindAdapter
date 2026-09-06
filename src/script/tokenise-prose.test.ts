import { describe, expect, it } from 'vitest';
import { tokeniseProse } from './tokenise-prose';
import type { Word } from './tokenise-prose';

function plain(texts: string[]): Word[] {
  return texts.map((text) => ({ text, marked: false }));
}

function marks(words: Word[]): boolean[] {
  return words.map((word) => word.marked);
}

describe('tokeniseProse', () => {
  it('strips punctuation from both ends and leaves interior marks', () => {
    const words = tokeniseProse('effort. "warm," don\'t half-asleep');
    expect(words).toEqual(plain(['effort', 'warm', "don't", 'half-asleep']));
  });

  it('drops tokens that reduce to nothing', () => {
    const words = tokeniseProse('sinking — slowly … now');
    expect(words).toEqual(plain(['sinking', 'slowly', 'now']));
  });

  it('treats newlines and blank lines as ordinary whitespace', () => {
    const words = tokeniseProse('  the water\n\nis   heavy\n');
    expect(words).toEqual(plain(['the', 'water', 'is', 'heavy']));
  });

  it('marks a single word written between marks', () => {
    const words = tokeniseProse('your arms are *heavy* now');
    expect(words).toEqual([
      { text: 'your', marked: false },
      { text: 'arms', marked: false },
      { text: 'are', marked: false },
      { text: 'heavy', marked: true },
      { text: 'now', marked: false },
    ]);
  });

  it('marks every word of a run from the opening mark to the closing one', () => {
    const words = tokeniseProse('*down and further down* now');
    expect(marks(words)).toEqual([true, true, true, true, false]);
  });

  it('closes a run on a word carrying the mark before its punctuation', () => {
    const words = tokeniseProse('*heavy and warm*. awake');
    expect(words).toEqual([
      { text: 'heavy', marked: true },
      { text: 'and', marked: true },
      { text: 'warm', marked: true },
      { text: 'awake', marked: false },
    ]);
  });

  it('marks a word the author wrote inside quotation marks', () => {
    const words = tokeniseProse('"*heavier,*" and heavier');
    expect(words[0]).toEqual({ text: 'heavier', marked: true });
    expect(words[1]).toEqual({ text: 'and', marked: false });
  });

  it('marks a word written between doubled marks', () => {
    const words = tokeniseProse('**heavy** now');
    expect(marks(words)).toEqual([true, false]);
  });

  it('runs an unclosed mark to the end of the prose it was opened in', () => {
    const words = tokeniseProse('nothing but *sinking now');
    expect(marks(words)).toEqual([false, false, true, true]);
  });
});
