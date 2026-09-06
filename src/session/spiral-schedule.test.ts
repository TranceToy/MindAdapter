import { describe, expect, it } from 'vitest';
import { DEFAULT_PACE } from '../script/declaration-values';
import type { Spiral } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { beatSeconds } from '../script/word-times';
import { spiralAt, spiralTurns } from './spiral-schedule';

const SLOW: Spiral = { rate: 3, depth: 0.15 };
const SLOWER: Spiral = { rate: 1.5, depth: 0.4 };

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);

function segment(spiral: Spiral | null, words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed: { carrier: 150, beat: 6 },
    voice: [],
    pace,
    spiral,
    words: new Array(words).fill('down'),
  };
}

describe('spiralTurns', () => {
  it('opens on the first segment spiral, at zero', () => {
    expect(spiralTurns([segment(SLOW, 4)])).toEqual([{ at: 0, spiral: SLOW }]);
  });

  it('opens on nothing where a script declares no spiral', () => {
    expect(spiralTurns([segment(null, 4)])).toEqual([{ at: 0, spiral: null }]);
  });

  it('holds through segments that inherit the running spiral', () => {
    const segments = [segment(SLOW, 4), segment(SLOW, 4)];
    expect(spiralTurns(segments)).toEqual([{ at: 0, spiral: SLOW }]);
  });

  it('lands a new rate on the beat of its first word', () => {
    const segments = [segment(SLOW, 4), segment(SLOWER, 4)];
    expect(spiralTurns(segments)).toEqual([
      { at: 0, spiral: SLOW },
      { at: 4 * BEAT_SECONDS, spiral: SLOWER },
    ]);
  });

  it('lands a stop where a segment declares none', () => {
    const segments = [segment(SLOW, 4), segment(null, 4)];
    expect(spiralTurns(segments)).toEqual([
      { at: 0, spiral: SLOW },
      { at: 4 * BEAT_SECONDS, spiral: null },
    ]);
  });
});

describe('spiralAt', () => {
  it('stands at nothing where no spiral is turning', () => {
    expect(spiralAt(spiralTurns([segment(null, 4)]), 10)).toBeNull();
  });

  it('turns the declared rate, in degrees a minute', () => {
    const phase = spiralAt(spiralTurns([segment(SLOW, 4)]), 20);
    expect(phase).toEqual({ angle: 360, depth: 0.15 });
  });

  it('carries the angle across a change of rate rather than restarting it', () => {
    const turns = spiralTurns([segment(SLOW, 4), segment(SLOWER, 4)]);
    const at = 4 * BEAT_SECONDS;
    const phase = spiralAt(turns, at + 20);
    expect(phase?.angle).toBeCloseTo(3 * 6 * at + 180);
    expect(phase?.depth).toBe(0.4);
  });

  it('leaves the angle where a stop left it, for the next spiral to take up', () => {
    const turns = spiralTurns([segment(SLOW, 4), segment(null, 4), segment(SLOW, 4)]);
    const stopped = spiralAt(turns, 4 * BEAT_SECONDS + 1);
    const resumed = spiralAt(turns, 8 * BEAT_SECONDS);
    expect(stopped).toBeNull();
    expect(resumed?.angle).toBeCloseTo(3 * 6 * 4 * BEAT_SECONDS);
  });
});
