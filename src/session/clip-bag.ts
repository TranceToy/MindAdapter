import type { MeasuredClip } from '../library/clip-reconcile';

export type Roll = () => number;

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

  function refill(): MeasuredClip[] {
    const bag = shuffled(clips, roll);
    return unseamed(bag, last, roll);
  }

  return { draw };
}

function shuffled(clips: MeasuredClip[], roll: Roll): MeasuredClip[] {
  const keyed = clips.map((clip) => ({ clip, key: roll() }));
  keyed.sort((one, other) => one.key - other.key);
  return keyed.map((held) => held.clip);
}

// The seam between one bag and the next is the only place the bag can repeat
// itself, and trading the repeated head for a clip drawn from the rest of the
// bag is a re-draw that cannot fail to break the repeat.
function unseamed(bag: MeasuredClip[], last: MeasuredClip | null, roll: Roll): MeasuredClip[] {
  if (bag.length < 2) return bag;
  if (bag[0] !== last) return bag;
  const place = 1 + Math.floor(roll() * (bag.length - 1));
  const head = bag[0];
  const taken = bag[place];
  if (!head || !taken) return bag;
  bag[0] = taken;
  bag[place] = head;
  return bag;
}
