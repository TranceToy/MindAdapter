import { loopedLine } from './finding-copy';
import type { Segment } from './resolve-script';
import { sessionSeconds, wordTimes } from './word-times';

const SECONDS_PER_MINUTE = 60;

export function durationLabel(seconds: number): string {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = whole % SECONDS_PER_MINUTE;
  const padded = String(rest).padStart(2, '0');
  return `${minutes}:${padded}`;
}

// One round, since a looping session has no length of its own: what the author
// wrote is as long as it says here however many times the session plays it.
export function durationText(segments: Segment[], loops: boolean): string {
  const times = wordTimes(segments);
  const seconds = sessionSeconds(times);
  const label = durationLabel(seconds);
  if (!loops) return label;
  return loopedLine(label);
}
