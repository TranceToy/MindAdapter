import { describe, expect, it } from 'vitest';
import { countWords, parseScript } from './parse-script';
import type { Word } from './tokenise-prose';

const SCRIPT = `bed: 150/6
voice: obedience

# ocean, deep water

The water is warm and heavy on your skin.

# void
bed: 140/4

Nothing above you. Nothing below.

#
voice:

Only this.
`;

function plain(texts: string[]): Word[] {
  return texts.map((text) => ({ text, marked: false }));
}

describe('parseScript', () => {
  it('reads head declarations with their line numbers', () => {
    const script = parseScript(SCRIPT);
    expect(script.head).toEqual([
      { kind: 'declaration', key: 'bed', value: '150/6', line: 1 },
      { kind: 'declaration', key: 'voice', value: 'obedience', line: 2 },
    ]);
  });

  it('reads a comma-separated image tag list off the header', () => {
    const script = parseScript(SCRIPT);
    const tags = script.segments.map((segment) => segment.tags);
    expect(tags).toEqual([['ocean', 'deep water'], ['void'], []]);
  });

  it('reads declarations up to the blank line and prose after it', () => {
    const script = parseScript(SCRIPT);
    const second = script.segments[1];
    expect(second?.line).toBe(8);
    expect(second?.block).toEqual([
      { kind: 'declaration', key: 'bed', value: '140/4', line: 9 },
    ]);
    expect(second?.words).toEqual(plain(['Nothing', 'above', 'you', 'Nothing', 'below']));
  });

  it('keeps an empty voice value as a declaration', () => {
    const script = parseScript(SCRIPT);
    const third = script.segments[2];
    expect(third?.block).toEqual([
      { kind: 'declaration', key: 'voice', value: '', line: 14 },
    ]);
  });

  it('never reads a colon in prose as a declaration', () => {
    const script = parseScript('# void\n\nlisten to this: nothing.\n');
    const segment = script.segments[0];
    expect(segment?.block).toEqual([]);
    expect(segment?.words).toEqual(plain(['listen', 'to', 'this', 'nothing']));
  });

  it('marks a line that is not a declaration where declarations belong', () => {
    const script = parseScript('the water is warm\n\n# void\n\nonly this.\n');
    expect(script.head).toEqual([{ kind: 'stray', line: 1 }]);
  });

  it('counts the words of every segment', () => {
    const script = parseScript(SCRIPT);
    expect(countWords(script)).toBe(16);
  });
});
