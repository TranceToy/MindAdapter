const WORDS_PER_MINUTE = 220;
const SECONDS_PER_MINUTE = 60;

export const BEAT_SECONDS = SECONDS_PER_MINUTE / WORDS_PER_MINUTE;

export function sessionSeconds(words: number): number {
  return (words * SECONDS_PER_MINUTE) / WORDS_PER_MINUTE;
}

export function durationLabel(seconds: number): string {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = whole % SECONDS_PER_MINUTE;
  const padded = String(rest).padStart(2, '0');
  return `${minutes}:${padded}`;
}

export function durationText(words: number): string {
  const seconds = sessionSeconds(words);
  return durationLabel(seconds);
}
