import type { Segment } from '../script/resolve-script';

export function sessionWords(segments: Segment[]): string[] {
  const words: string[] = [];
  for (const segment of segments) {
    for (const word of segment.words) words.push(word);
  }
  return words;
}
