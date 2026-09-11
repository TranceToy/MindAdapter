import { describe, expect, it } from 'vitest';
import { readLoop, readTagList } from './declaration-values';

describe('readTagList', () => {
  it('trims the whitespace around each entry', () => {
    expect(readTagList('  ocean ,\tvoid  ')).toEqual(['ocean', 'void']);
  });

  it('keeps the spaces inside a tag, which the format allows', () => {
    expect(readTagList('deep water, still air')).toEqual(['deep water', 'still air']);
  });

  it('drops an empty entry, so a trailing comma names no further tag', () => {
    expect(readTagList('ocean,')).toEqual(['ocean']);
    expect(readTagList('ocean, , void')).toEqual(['ocean', 'void']);
  });

  it('reads a value with no comma as the one tag it names', () => {
    expect(readTagList('obedience')).toEqual(['obedience']);
  });

  it('reads an empty value as no tags at all', () => {
    expect(readTagList('')).toEqual([]);
    expect(readTagList('   ')).toEqual([]);
  });
});

describe('readLoop', () => {
  it('reads the two words a script may say', () => {
    expect(readLoop('yes')).toBe(true);
    expect(readLoop('no')).toBe(false);
  });

  it('reads anything else as nothing, so it is a finding rather than a guess', () => {
    expect(readLoop('')).toBeNull();
    expect(readLoop('true')).toBeNull();
    expect(readLoop('Yes')).toBeNull();
    expect(readLoop('3')).toBeNull();
  });
});
