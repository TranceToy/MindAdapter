// The floor on how fast audio can stop: 30 ms is short enough that a stop does
// not read as delayed, and long enough that the waveform reaches zero instead of
// being cut where it stands, which at headphone level is a click.
export const DECLICK_SECONDS = 0.03;

export type GainRamp = {
  value: number;
  cancelScheduledValues: (at: number) => unknown;
  setValueAtTime: (value: number, at: number) => unknown;
  linearRampToValueAtTime: (value: number, at: number) => unknown;
};

// Linear, never exponential: an exponential ramp cannot reach zero, and aiming
// one at an epsilon leaves a residual tone. The ramp starts from where the
// parameter actually is rather than fighting anything already scheduled, and
// returns its completion, which is the earliest an oscillator may be stopped.
export function rampGain(gain: GainRamp, to: number, seconds: number, now: number): number {
  const done = now + Math.max(seconds, DECLICK_SECONDS);
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.linearRampToValueAtTime(to, done);
  return done;
}
