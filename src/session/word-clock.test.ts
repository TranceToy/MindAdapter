import { describe, expect, it } from 'vitest';
import { BEAT_SECONDS } from '../script/session-duration';
import { LEAD_IN_SECONDS, cueAt } from './word-clock';

function midBeat(index: number): number {
  return LEAD_IN_SECONDS + (index + 0.5) * BEAT_SECONDS;
}

describe('cueAt', () => {
  it('holds the lead-in for ten seconds', () => {
    expect(cueAt(0, 100)).toEqual({ kind: 'lead-in' });
    expect(cueAt(9.999, 100)).toEqual({ kind: 'lead-in' });
  });

  it('starts word one when the lead-in ends', () => {
    expect(cueAt(LEAD_IN_SECONDS, 100)).toEqual({ kind: 'word', index: 0 });
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
