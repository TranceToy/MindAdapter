import type { Segment } from '../script/resolve-script';
import { onsetSeconds, wordTimes } from '../script/word-times';

// The second every marked word lands on, read off the same line the word layer
// shows it by, so the sound and the colour are the same event. One snap per
// marked word and never per run: a run is marked word by word, and what it
// marks is what is heard.
export function snapBeats(segments: Segment[]): number[] {
  const times = wordTimes(segments);
  const beats: number[] = [];
  let word = 0;
  for (const segment of segments) {
    for (const held of segment.words) {
      if (held.marked) beats.push(onsetSeconds(times, word));
      word += 1;
    }
  }
  return beats;
}
