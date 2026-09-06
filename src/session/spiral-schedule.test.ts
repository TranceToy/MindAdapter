import { describe, expect, it } from 'vitest';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Depth, Spiral } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { beatSeconds } from '../script/word-times';
import { spiralAt, spiralTurns } from './spiral-schedule';

function still(depth: number): Depth {
  return { from: depth, to: depth, seconds: 0 };
}

const SLOW: Spiral = { rate: 3, depth: still(0.15) };
const SLOWER: Spiral = { rate: 1.5, depth: still(0.4) };
const BACKWARD: Spiral = { rate: -3, depth: still(0.15) };
const COUNTER: Spiral = { rate: -2, depth: still(0.08) };
const SWELLING: Spiral = { rate: 3, depth: { from: 0.1, to: 0.5, seconds: 40 } };

const PAIR = [SLOW, COUNTER];
const NONE: Spiral[] = [];

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);

const WORD: Word = { text: 'down', marked: false };

function segment(spirals: Spiral[], words: number, pace = DEFAULT_PACE): Segment {
  return {
    tags: [],
    bed: { carrier: 150, beat: 6 },
    voice: [],
    pace,
    gap: DEFAULT_GAP,
    spirals,
    words: new Array(words).fill(WORD),
  };
}

describe('spiralTurns', () => {
  it('opens on the first segment spirals, at zero', () => {
    expect(spiralTurns([segment([SLOW], 4)])).toEqual([{ at: 0, spirals: [SLOW] }]);
  });

  it('opens on nothing where a script declares no spiral', () => {
    expect(spiralTurns([segment(NONE, 4)])).toEqual([{ at: 0, spirals: [] }]);
  });

  it('holds through segments that inherit the running spirals', () => {
    const segments = [segment(PAIR, 4), segment(PAIR, 4)];
    expect(spiralTurns(segments)).toEqual([{ at: 0, spirals: PAIR }]);
  });

  it('lands a new rate on the beat of its first word', () => {
    const segments = [segment([SLOW], 4), segment([SLOWER], 4)];
    expect(spiralTurns(segments)).toEqual([
      { at: 0, spirals: [SLOW] },
      { at: 4 * BEAT_SECONDS, spirals: [SLOWER] },
    ]);
  });

  it('lands a turn where a segment takes a second spiral up beside the first', () => {
    const segments = [segment([SLOW], 4), segment(PAIR, 4)];
    expect(spiralTurns(segments)).toEqual([
      { at: 0, spirals: [SLOW] },
      { at: 4 * BEAT_SECONDS, spirals: PAIR },
    ]);
  });

  it('lands a stop where a segment declares none', () => {
    const segments = [segment([SLOW], 4), segment(NONE, 4)];
    expect(spiralTurns(segments)).toEqual([
      { at: 0, spirals: [SLOW] },
      { at: 4 * BEAT_SECONDS, spirals: [] },
    ]);
  });
});

describe('spiralAt', () => {
  it('stands at nothing where no spiral is turning', () => {
    expect(spiralAt(spiralTurns([segment(NONE, 4)]), 10)).toEqual([]);
  });

  it('turns the declared rate, in degrees a minute', () => {
    const phases = spiralAt(spiralTurns([segment([SLOW], 4)]), 20);
    expect(phases).toEqual([{ angle: 360, depth: 0.15 }]);
  });

  it('turns a pair against each other, each at its own angle and depth', () => {
    const phases = spiralAt(spiralTurns([segment(PAIR, 4)]), 20);
    expect(phases).toEqual([
      { angle: 360, depth: 0.15 },
      { angle: -240, depth: 0.08 },
    ]);
  });

  it('carries the angle across a change of rate rather than restarting it', () => {
    const turns = spiralTurns([segment([SLOW], 4), segment([SLOWER], 4)]);
    const at = 4 * BEAT_SECONDS;
    const phases = spiralAt(turns, at + 20);
    expect(phases[0]?.angle).toBeCloseTo(3 * 6 * at + 180);
    expect(phases[0]?.depth).toBe(0.4);
  });

  it('turns the other way round where the rate is below zero', () => {
    const phases = spiralAt(spiralTurns([segment([BACKWARD], 4)]), 20);
    expect(phases).toEqual([{ angle: -360, depth: 0.15 }]);
  });

  it('carries the angle through a reversal rather than restarting it', () => {
    const turns = spiralTurns([segment([SLOW], 4), segment([BACKWARD], 4)]);
    const at = 4 * BEAT_SECONDS;
    const phases = spiralAt(turns, at + 20);
    expect(phases[0]?.angle).toBeCloseTo(3 * 6 * at - 360);
  });

  it('holds a still depth wherever the session has got to', () => {
    const turns = spiralTurns([segment([SLOW], 4)]);
    expect(spiralAt(turns, 5)[0]?.depth).toBe(0.15);
    expect(spiralAt(turns, 25)[0]?.depth).toBe(0.15);
  });

  it('travels a swelling depth to its far bound and back over its seconds', () => {
    const turns = spiralTurns([segment([SWELLING], 4)]);
    expect(spiralAt(turns, 0)[0]?.depth).toBeCloseTo(0.1);
    expect(spiralAt(turns, 20)[0]?.depth).toBeCloseTo(0.5);
    expect(spiralAt(turns, 40)[0]?.depth).toBeCloseTo(0.1);
  });

  // The swell is read off the session clock rather than the turn that declared
  // it, so the one thing a change of rate may not do is step the depth.
  it('swells across a change of rate without stepping the depth', () => {
    const faster: Spiral = { rate: 6, depth: SWELLING.depth };
    const turns = spiralTurns([segment([SWELLING], 4), segment([faster], 4)]);
    const at = 4 * BEAT_SECONDS;
    const before = spiralAt(turns, at - 0.001)[0]?.depth ?? 0;
    const after = spiralAt(turns, at + 0.001)[0]?.depth ?? 0;
    expect(after).toBeCloseTo(before, 4);
    expect(after).toBeGreaterThan(0.1);
  });

  it('leaves the angle where a stop left it, for the next spiral to take up', () => {
    const turns = spiralTurns([segment([SLOW], 4), segment(NONE, 4), segment([SLOW], 4)]);
    const stopped = spiralAt(turns, 4 * BEAT_SECONDS + 1);
    const resumed = spiralAt(turns, 8 * BEAT_SECONDS);
    expect(stopped).toEqual([]);
    expect(resumed[0]?.angle).toBeCloseTo(3 * 6 * 4 * BEAT_SECONDS);
  });

  // By its place in the declaration, which is the only thing that tells one
  // spiral of a pair from the other.
  it('leaves a dropped second spiral where it stopped, for a later pair', () => {
    const turns = spiralTurns([segment(PAIR, 4), segment([SLOW], 4), segment(PAIR, 4)]);
    const lone = spiralAt(turns, 4 * BEAT_SECONDS + 1);
    const resumed = spiralAt(turns, 8 * BEAT_SECONDS);
    expect(lone).toHaveLength(1);
    expect(resumed[1]?.angle).toBeCloseTo(-2 * 6 * 4 * BEAT_SECONDS);
  });
});
