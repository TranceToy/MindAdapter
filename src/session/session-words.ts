import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';

export function sessionWords(segments: Segment[]): Word[] {
  const words: Word[] = [];
  for (const segment of segments) {
    for (const word of segment.words) words.push(word);
  }
  return words;
}
