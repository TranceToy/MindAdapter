import { describe, expect, it } from 'vitest';
import { DEFAULT_BED, DEFAULT_GAP, DEFAULT_PACE } from './declaration-values';
import type { Segment } from './resolve-script';
import { ONE_ROUND, roundAt, sessionRounds } from './session-round';
import type { Word } from './tokenise-prose';

const WORD: Word = { text: 'down', marked: false };

function segment(words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed: DEFAULT_BED,
    voice: [],
    pace,
    gap: DEFAULT_GAP,
    spirals: [],
    words: new Array(words).fill(WORD),
  };
}

describe('sessionRounds', () => {
  it('is the script read at the pace it declares, once', () => {
    const rounds = sessionRounds([segment(220)], false);
    expect(rounds.seconds).toBeCloseTo(60, 9);
    expect(rounds.loops).toBe(false);
  });

  it('is the same length whether or not the script comes round', () => {
    const once = sessionRounds([segment(220)], false);
    const looped = sessionRounds([segment(220)], true);
    expect(looped.seconds).toBe(once.seconds);
    expect(looped.loops).toBe(true);
  });
});

describe('roundAt', () => {
  const LOOPED = { seconds: 60, loops: true };

  it('runs straight past the last word where the script does not loop', () => {
    expect(roundAt({ seconds: 60, loops: false }, 75)).toEqual({ behind: 0, at: 75 });
  });

  it('comes round on the second after the last', () => {
    expect(roundAt(LOOPED, 0)).toEqual({ behind: 0, at: 0 });
    expect(roundAt(LOOPED, 59)).toEqual({ behind: 0, at: 59 });
    expect(roundAt(LOOPED, 60)).toEqual({ behind: 1, at: 0 });
    expect(roundAt(LOOPED, 150)).toEqual({ behind: 2, at: 30 });
  });

  it('leaves a session with no script where it stands', () => {
    expect(roundAt(ONE_ROUND, 12)).toEqual({ behind: 0, at: 12 });
  });
});
