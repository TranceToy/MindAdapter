import { describe, expect, it } from 'vitest';
import { durationLabel, sessionSeconds } from './session-duration';

describe('sessionSeconds', () => {
  it('is words times 60/220', () => {
    expect(sessionSeconds(220)).toBe(60);
    expect(sessionSeconds(4400)).toBe(1200);
    expect(sessionSeconds(0)).toBe(0);
  });
});

describe('durationLabel', () => {
  it('reads as minutes and seconds', () => {
    expect(durationLabel(60)).toBe('1:00');
    expect(durationLabel(1205)).toBe('20:05');
    expect(durationLabel(0)).toBe('0:00');
  });
});
