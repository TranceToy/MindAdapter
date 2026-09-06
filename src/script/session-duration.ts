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

export function durationText(segments: Segment[]): string {
  const times = wordTimes(segments);
  const seconds = sessionSeconds(times);
  return durationLabel(seconds);
}
