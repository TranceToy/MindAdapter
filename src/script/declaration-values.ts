export const BED_KEY = 'bed';
export const VOICE_KEY = 'voice';
export const PACE_KEY = 'pace';
export const GAP_KEY = 'gap';
export const SPIRAL_KEY = 'spiral';

export const CARRIER_LOW = 50;
export const CARRIER_HIGH = 1000;
export const BEAT_LOW = 0;
export const BEAT_HIGH = 30;
// The bounds are the word layer's own: above the high one the eight-word image
// slot passes half a hertz of full-screen luminance change, and below the low
// one a word is held so long that the session reads as stopped rather than slow.
export const PACE_LOW = 40;
export const PACE_HIGH = 240;
// A two-armed spiral passes an arm over any one point twice a turn, so the high
// bound holds that passage at 0.4 Hz — just under the 0.46 Hz the image layer
// already runs at, and nowhere near the word layer's. Below the low one the
// turn reads as a still picture rather than a slow one. The bounds are on the
// number and not the direction: a rate below zero turns the other way and
// passes a point exactly as often.
export const RATE_LOW = 0.5;
export const RATE_HIGH = 12;
// Two spirals over one photograph pass a point as often as one turning at the
// sum of their rates, so what a pair may turn between them is what one may turn
// alone. A third would leave each of them too little of that to read as turning,
// and would knot the centre they all end at.
export const SPIRALS_HIGH = 2;
export const DEPTH_LOW = 0;
export const DEPTH_HIGH = 1;
// One pass out and back at the low bound is 0.1 Hz, a quarter of what the
// imagery layer already runs at, and it moves part of the depth rather than the
// whole screen. Below it the depth reads as a pulse rather than a swell; above
// the high one it never comes round inside a session.
export const SWELL_LOW = 10;
export const SWELL_HIGH = 600;
// A bound on the silence rather than on how often a suggestion comes, since a
// long clip under a short gap is still a slow cadence. Under the low bound the
// silence stops reading as a gap and two suggestions run together as one
// utterance; past the high one a suggestion may not be heard in a session at
// all, which is the voice layer declared away rather than declared slow.
export const GAP_SHORTEST = 3;
export const GAP_LONGEST = 180;

const NUMBER = String.raw`\d+(?:\.\d+)?`;
const BED_PAIR = new RegExp(`^(${NUMBER})/(${NUMBER})$`);
const PACE_NUMBER = new RegExp(`^${NUMBER}$`);
// A rate, a rate over a still depth, or a rate over a depth that swells between
// two bounds and takes so many seconds to travel out and back.
const SPIRAL_VALUE = new RegExp(`^(-?${NUMBER})(?:/(${NUMBER})(?:-(${NUMBER})/(${NUMBER}))?)?$`);
// One number for a gap that always lasts as long, or the two bounds it is
// drawn between.
const GAP_VALUE = new RegExp(`^(${NUMBER})(?:-(${NUMBER}))?$`);
const LIST_SEPARATOR = ',';

export type BedPair = {
  carrier: number;
  beat: number;
};

// The bed layer is never absent, so a script declaring nothing runs on these:
// a 150 Hz carrier with a 6 Hz theta offset.
export const DEFAULT_BED: BedPair = { carrier: 150, beat: 6 };

export function readBedPair(value: string): BedPair | null {
  const pair = BED_PAIR.exec(value);
  if (!pair) return null;
  const carrier = Number(pair[1]);
  const beat = Number(pair[2]);
  return { carrier, beat };
}

// The word layer is never absent either, so a script declaring nothing runs at
// the pace every script ran at when the pace was the app's to fix.
export const DEFAULT_PACE = 220;

export function readPace(value: string): number | null {
  if (!PACE_NUMBER.test(value)) return null;
  return Number(value);
}

// The one layer a session can run without, so there is no default pair to fall
// back to: a script that declares nothing shows no spiral at all. The depth is
// how much of the photograph the spiral takes, and a declaration that names
// only a rate takes this much.
export const DEFAULT_DEPTH = 0.15;

// A still depth is the two bounds alike; a swelling one travels from the first
// to the second and back over its seconds.
export type Depth = {
  from: number;
  to: number;
  seconds: number;
};

export type Spiral = {
  rate: number;
  depth: Depth;
};

// Empty is the author asking for no spiral, and a comma is the author asking
// for two: what the declaration holds is a list, of no spirals or of however
// many were written, and a list one entry of which is malformed is malformed
// entire.
export function readSpirals(value: string): Spiral[] | null {
  const declared = value.trim();
  if (declared === '') return [];
  const spirals: Spiral[] = [];
  for (const part of declared.split(LIST_SEPARATOR)) {
    const spiral = readSpiral(part.trim());
    if (!spiral) return null;
    spirals.push(spiral);
  }
  return spirals;
}

function readSpiral(value: string): Spiral | null {
  const declared = SPIRAL_VALUE.exec(value);
  if (!declared) return null;
  const rate = Number(declared[1]);
  const depth = readDepth(declared);
  return { rate, depth };
}

export function swells(depth: Depth): boolean {
  return depth.from !== depth.to;
}

function readDepth(declared: RegExpExecArray): Depth {
  const from = declared[2];
  if (from === undefined) return stillDepth(DEFAULT_DEPTH);
  const to = declared[3];
  if (to === undefined) return stillDepth(Number(from));
  const seconds = Number(declared[4]);
  return { from: Number(from), to: Number(to), seconds };
}

function stillDepth(depth: number): Depth {
  return { from: depth, to: depth, seconds: 0 };
}

// The silence between one clip ending and the next beginning. A fixed gap is
// the two bounds alike, the way a still depth is.
export type Gap = {
  low: number;
  high: number;
};

// The voice layer's cadence when a script says nothing about it, which is the
// one every script ran at when the gap was the app's to fix.
export const DEFAULT_GAP: Gap = { low: 7, high: 15 };

export function readGap(value: string): Gap | null {
  const declared = GAP_VALUE.exec(value);
  if (!declared) return null;
  const low = Number(declared[1]);
  const high = declared[2];
  if (high === undefined) return { low, high: low };
  return { low, high: Number(high) };
}

export function readTagList(value: string): string[] {
  const tags: string[] = [];
  for (const part of value.split(LIST_SEPARATOR)) {
    const tag = part.trim();
    if (tag) tags.push(tag);
  }
  return tags;
}
