import { DEFAULT_PACE } from './declaration-values';
import type { Segment } from './resolve-script';

const SECONDS_PER_MINUTE = 60;

// One stretch held at a single pace: the word it opens on, the second that word
// lands on, and how long each word inside it is held for.
export type PaceSpan = {
  word: number;
  at: number;
  beat: number;
};

// The line every layer reads a word's second off. A segment may declare its own
// pace, so the line from the start gesture to the last word is piecewise rather
// than one multiplication, and it is built once from the whole script so that a
// later segment's words cannot be placed without the earlier segments' beats.
export type WordTimes = {
  spans: PaceSpan[];
  words: number;
};

export function beatSeconds(pace: number): number {
  return SECONDS_PER_MINUTE / pace;
}

export function wordTimes(segments: Segment[]): WordTimes {
  const spans: PaceSpan[] = [];
  let words = 0;
  let at = 0;
  for (const segment of segments) {
    const beat = beatSeconds(segment.pace);
    const running = spans[spans.length - 1];
    if (running?.beat !== beat) spans.push({ word: words, at, beat });
    at += segment.words.length * beat;
    words += segment.words.length;
  }
  if (spans.length === 0) spans.push(openingSpan());
  return { spans, words };
}

// The second a word lands on. A word past the last is read off the closing
// span, which is what makes the end of the session a position on the same line.
export function onsetSeconds(times: WordTimes, word: number): number {
  const span = spanAt(times, word);
  return span.at + (word - span.word) * span.beat;
}

// The line read the other way: the word the session is on at a given second,
// counted past the last once the script is spent.
export function wordBySecond(times: WordTimes, elapsed: number): number {
  const span = spanBy(times, elapsed);
  const held = Math.floor((elapsed - span.at) / span.beat);
  return span.word + Math.max(held, 0);
}

export function sessionSeconds(times: WordTimes): number {
  return onsetSeconds(times, times.words);
}

function spanAt(times: WordTimes, word: number): PaceSpan {
  let held = openingSpan();
  for (const span of times.spans) {
    if (span.word > word) break;
    held = span;
  }
  return held;
}

function spanBy(times: WordTimes, elapsed: number): PaceSpan {
  let held = openingSpan();
  for (const span of times.spans) {
    if (span.at > elapsed) break;
    held = span;
  }
  return held;
}

function openingSpan(): PaceSpan {
  return { word: 0, at: 0, beat: beatSeconds(DEFAULT_PACE) };
}
