import { describe, expect, it } from 'vitest';
import type { MeasuredClip } from '../library/clip-reconcile';
import type { ClipPool } from '../library/scan-library';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Gap } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { beatSeconds } from '../script/word-times';
import type { Roll } from './clip-bag';
import { voiceDeadline, voiceFirings } from './voice-schedule';
import type { VoiceFiring } from './voice-schedule';

function clip(path: string, duration: number): MeasuredClip {
  return {
    path,
    handle: {} as FileSystemFileHandle,
    size: 1,
    lastModified: 1,
    rmsScalar: 1,
    peak: 1,
    duration,
  };
}

function pool(tag: string, clips: MeasuredClip[]): ClipPool {
  return { tag, clips };
}

const BEAT_SECONDS = beatSeconds(DEFAULT_PACE);

function segment(voice: string[], words: number, gap: Gap = DEFAULT_GAP): Segment {
  return {
    tags: [],
    bed: { carrier: 150, beat: 6 },
    voice,
    pace: DEFAULT_PACE,
    gap,
    spirals: [],
    words: new Array(words).fill('down'),
  };
}

function rolling(...values: number[]): Roll {
  let index = 0;
  return () => values[index++] ?? 0;
}

const SHORTER = clip('clips/obedience/a.mp3', 4);
const LONGER = clip('clips/obedience/b.mp3', 6);
const SPOKEN = clip('clips/submission/c.mp3', 5);
const POOLS = [pool('obedience', [SHORTER, LONGER]), pool('submission', [SPOKEN])];

const GAP_LOW = DEFAULT_GAP.low;
const GAP_HIGH = DEFAULT_GAP.high;
const FIRST_FIRING = GAP_LOW;
const FIXED: Gap = { low: 4, high: 4 };
const WIDE: Gap = { low: 20, high: 30 };
const ROUNDING = 1e-9;
const SILENT_AT = 121;
const CHANGE_SECONDS = SILENT_AT * BEAT_SECONDS;

function gapsOf(firings: VoiceFiring[]): number[] {
  const gaps: number[] = [];
  for (let at = 1; at < firings.length; at += 1) {
    const before = firings[at - 1];
    const after = firings[at];
    if (before && after) gaps.push(after.at - before.at - before.clip.duration);
  }
  return gaps;
}

describe('voiceFirings', () => {
  it('opens a gap after the word its binding comes into force on', () => {
    const firings = voiceFirings([segment(['obedience'], 4000)], POOLS, rolling());
    expect(firings[0]?.at).toBe(FIRST_FIRING);
  });

  it('draws the gap uniformly between its bounds', () => {
    const late = voiceFirings([segment(['obedience'], 4000)], POOLS, rolling(1));
    const middle = voiceFirings([segment(['obedience'], 4000)], POOLS, rolling(0.5));
    expect(late[0]?.at).toBe(GAP_HIGH);
    expect(middle[0]?.at).toBe((GAP_LOW + GAP_HIGH) / 2);
  });

  it('draws the gap between the bounds a script declares', () => {
    const early = voiceFirings([segment(['obedience'], 4000, WIDE)], POOLS, rolling());
    const late = voiceFirings([segment(['obedience'], 4000, WIDE)], POOLS, rolling(1));
    expect(early[0]?.at).toBe(WIDE.low);
    expect(late[0]?.at).toBe(WIDE.high);
  });

  it('holds a silence that never varies where the bounds are alike', () => {
    const firings = voiceFirings([segment(['obedience'], 4000, FIXED)], POOLS, Math.random);
    const gaps = gapsOf(firings);
    expect(gaps).not.toEqual([]);
    expect(gaps.every((gap) => Math.abs(gap - FIXED.low) < ROUNDING)).toBe(true);
  });

  it('takes up a cadence a later segment declares at the next silence', () => {
    const segments = [segment(['obedience'], SILENT_AT), segment(['obedience'], 4000, FIXED)];
    const gaps = gapsOf(voiceFirings(segments, POOLS, rolling()));
    expect(gaps.slice(0, 4)).toEqual([GAP_LOW, GAP_LOW, FIXED.low, FIXED.low]);
  });

  it('never repeats a clip across a segment that changes only the cadence', () => {
    const tags = ['obedience', 'submission'];
    const segments = [segment(tags, SILENT_AT), segment(tags, 4000, FIXED)];
    const heard = voiceFirings(segments, POOLS, Math.random).map((firing) => firing.clip.path);
    const repeats = heard.filter((path, at) => path === heard[at - 1]);
    expect(repeats).toEqual([]);
  });

  it('measures the gap from the end of the clip before it', () => {
    const firings = voiceFirings([segment(['obedience'], 4000)], POOLS, rolling());
    expect(firings[1]?.at).toBe(FIRST_FIRING + SHORTER.duration + GAP_LOW);
    expect(firings[1]?.clip.path).toBe(LONGER.path);
  });

  it('leaves every gap inside its bounds, so no two clips overlap', () => {
    const firings = voiceFirings([segment(['obedience'], 4000)], POOLS, Math.random);
    const gaps = gapsOf(firings);
    expect(gaps).not.toEqual([]);
    const held = gaps.every((gap) => gap >= GAP_LOW - ROUNDING && gap <= GAP_HIGH + ROUNDING);
    expect(held).toBe(true);
  });

  it('plays every clip of the union before any is heard twice', () => {
    const firings = voiceFirings([segment(['obedience', 'submission'], 4000)], POOLS, Math.random);
    const heard = firings.slice(0, 3).map((firing) => firing.clip.path);
    expect(new Set(heard).size).toBe(3);
  });

  it('never repeats a clip across a reshuffle seam', () => {
    const firings = voiceFirings([segment(['obedience', 'submission'], 4000)], POOLS, Math.random);
    const heard = firings.map((firing) => firing.clip.path);
    const repeats = heard.filter((path, at) => path === heard[at - 1]);
    expect(repeats).toEqual([]);
  });

  it('carries the cadence across a pool change and draws the next clip from the new bag', () => {
    const segments = [segment(['obedience'], SILENT_AT), segment(['submission'], 4000)];
    const firings = voiceFirings(segments, POOLS, rolling());
    const running = firings[2];
    expect(running?.at).toBeLessThan(CHANGE_SECONDS);
    expect(running?.clip.path).toBe(SHORTER.path);
    expect(firings[3]?.at).toBe((running?.at ?? 0) + SHORTER.duration + GAP_LOW);
    expect(firings[3]?.clip.path).toBe(SPOKEN.path);
  });

  it('lets the clip in flight finish across a change to declared silence', () => {
    const segments = [segment(['obedience'], SILENT_AT), segment([], 4000)];
    const firings = voiceFirings(segments, POOLS, rolling());
    const last = firings[firings.length - 1];
    expect(firings).toHaveLength(3);
    expect(last?.at).toBeLessThan(CHANGE_SECONDS);
    expect((last?.at ?? 0) + (last?.clip.duration ?? 0)).toBeGreaterThan(CHANGE_SECONDS);
  });

  it('re-arms the gap clock where a pool comes back into force', () => {
    const segments = [
      segment(['obedience'], SILENT_AT),
      segment([], 400),
      segment(['obedience'], 4000),
    ];
    const firings = voiceFirings(segments, POOLS, rolling());
    const speaking = (SILENT_AT + 400) * BEAT_SECONDS;
    expect(firings[3]?.at).toBeCloseTo(speaking + GAP_LOW);
  });

  it('holds a binding that a segment inherits rather than rebuilding its bag', () => {
    const split = [segment(['obedience'], SILENT_AT), segment(['obedience'], 4000)];
    const whole = [segment(['obedience'], SILENT_AT + 4000)];
    expect(voiceFirings(split, POOLS, rolling())).toEqual(voiceFirings(whole, POOLS, rolling()));
  });

  it('never starts a clip that cannot finish before the last word', () => {
    const segments = [segment(['obedience'], 200)];
    const firings = voiceFirings(segments, POOLS, Math.random);
    const deadline = voiceDeadline(segments);
    expect(firings.every((firing) => firing.at + firing.clip.duration <= deadline)).toBe(true);
  });

  it('has no voice at all in a session too short for one clip', () => {
    expect(voiceFirings([segment(['obedience'], 40)], POOLS, rolling())).toEqual([]);
  });

  it('has no voice layer for a script that never declares one', () => {
    expect(voiceFirings([segment([], 4000)], POOLS, rolling())).toEqual([]);
  });

  it('has no voice for a tag with no pool on disk', () => {
    expect(voiceFirings([segment(['tide'], 4000)], POOLS, rolling())).toEqual([]);
  });
});
