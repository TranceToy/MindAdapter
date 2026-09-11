import type { MeasuredClip } from '../library/clip-reconcile';
import { shuffled, unseamed } from './draw';
import type { Roll } from './draw';

export type ClipBag = {
  draw: () => MeasuredClip | null;
};

// Every clip is heard once before any is heard twice, which pure random draws
// cannot promise: over the sixty-odd suggestions a session holds, some clips
// would land many times and others never, and the library would sound like it
// held five of them.
export function fillBag(clips: MeasuredClip[], roll: Roll): ClipBag {
  let held: MeasuredClip[] = [];
  let last: MeasuredClip | null = null;

  function draw(): MeasuredClip | null {
    if (clips.length === 0) return null;
    if (held.length === 0) held = refill();
    const drawn = held.shift() ?? null;
    last = drawn;
    return drawn;
  }

  // The bag's seam is the same seam a shuffled script has at its rounds, and it
  // is unmade the same way.
  function refill(): MeasuredClip[] {
    const bag = shuffled(clips, roll);
    return unseamed(bag, last, roll);
  }

  return { draw };
}
