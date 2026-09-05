import type { Segment } from '../script/resolve-script';

export function sessionWords(segments: Segment[]): string[] {
  const words: string[] = [];
  for (const segment of segments) {
    for (const word of segment.words) words.push(word);
  }
  return words;
}

export function wordCount(segments: Segment[]): number {
  let words = 0;
  for (const segment of segments) words += segment.words.length;
  return words;
}
