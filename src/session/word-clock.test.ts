import { describe, expect, it } from 'vitest';
import { BEAT_SECONDS } from '../script/session-duration';
import { cueAt, wordAt } from './word-clock';

function midBeat(index: number): number {
  return (index + 0.5) * BEAT_SECONDS;
}

describe('cueAt', () => {
  it('starts word one on the start gesture', () => {
    expect(cueAt(0, 100)).toEqual({ kind: 'word', index: 0 });
  });

  it('beats every 273 ms', () => {
    expect(BEAT_SECONDS).toBeCloseTo(0.273, 3);
    expect(cueAt(midBeat(1), 100)).toEqual({ kind: 'word', index: 1 });
    expect(cueAt(midBeat(2), 100)).toEqual({ kind: 'word', index: 2 });
  });

  it('does not drift across a long script', () => {
    expect(cueAt(midBeat(4399), 4400)).toEqual({ kind: 'word', index: 4399 });
  });

  it('ends once the last word has had its beat', () => {
    expect(cueAt(midBeat(99), 100)).toEqual({ kind: 'word', index: 99 });
    expect(cueAt(midBeat(100), 100)).toEqual({ kind: 'ended' });
  });
});

describe('wordAt', () => {
  it('is the word on the beat', () => {
    expect(wordAt(0, 100)).toBe(0);
    expect(wordAt(midBeat(0), 100)).toBe(0);
    expect(wordAt(midBeat(7), 100)).toBe(7);
  });

  it('runs past the last word once the script is spent', () => {
    expect(wordAt(midBeat(100), 100)).toBe(100);
  });
});
