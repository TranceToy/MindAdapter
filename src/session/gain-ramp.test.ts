import { describe, expect, it } from 'vitest';
import { DECLICK_SECONDS, rampGain, riseGain } from './gain-ramp';
import type { GainRamp } from './gain-ramp';

type Scheduled = {
  kind: 'cancel' | 'set' | 'ramp';
  value: number;
  at: number;
};

function recordingGain(value: number): { gain: GainRamp; scheduled: Scheduled[] } {
  const scheduled: Scheduled[] = [];
  const gain: GainRamp = {
    value,
    cancelScheduledValues: (at) => scheduled.push({ kind: 'cancel', value, at }),
    setValueAtTime: (set, at) => scheduled.push({ kind: 'set', value: set, at }),
    linearRampToValueAtTime: (target, at) => scheduled.push({ kind: 'ramp', value: target, at }),
  };
  return { gain, scheduled };
}

describe('rampGain', () => {
  it('cancels, anchors at the live value, then ramps linearly', () => {
    const { gain, scheduled } = recordingGain(0.4);
    rampGain(gain, 0, 10, 5);
    expect(scheduled).toEqual([
      { kind: 'cancel', value: 0.4, at: 5 },
      { kind: 'set', value: 0.4, at: 5 },
      { kind: 'ramp', value: 0, at: 15 },
    ]);
  });

  it('returns the completion, which is when the tone may stop', () => {
    const { gain } = recordingGain(1);
    expect(rampGain(gain, 0, 0.3, 2)).toBeCloseTo(2.3);
  });

  it('never stops faster than the declick floor', () => {
    const { gain } = recordingGain(1);
    expect(rampGain(gain, 0, 0, 2)).toBeCloseTo(2 + DECLICK_SECONDS);
  });
});

describe('riseGain', () => {
  it('climbs from silence to the resting value over the stated stretch', () => {
    const { gain, scheduled } = recordingGain(1);
    riseGain(gain, 5, 8);
    expect(scheduled).toEqual([
      { kind: 'cancel', value: 1, at: 8 },
      { kind: 'set', value: 0, at: 8 },
      { kind: 'ramp', value: 1, at: 13 },
    ]);
  });
});
