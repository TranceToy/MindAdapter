export const BED_KEY = 'bed';
export const VOICE_KEY = 'voice';
export const PACE_KEY = 'pace';
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
// turn reads as a still picture rather than a slow one.
export const RATE_LOW = 0.5;
export const RATE_HIGH = 12;
export const DEPTH_LOW = 0;
export const DEPTH_HIGH = 1;

const BED_PAIR = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/;
const PACE_NUMBER = /^\d+(?:\.\d+)?$/;
const SPIRAL_PAIR = /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/;
const TAG_SEPARATOR = ',';

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

export type Spiral = {
  rate: number;
  depth: number;
};

// Empty is the author asking for no spiral, which reads the same as malformed
// here and is told apart from it where the findings are written.
export function readSpiral(value: string): Spiral | null {
  const pair = SPIRAL_PAIR.exec(value);
  if (!pair) return null;
  const rate = Number(pair[1]);
  const depth = pair[2] === undefined ? DEFAULT_DEPTH : Number(pair[2]);
  return { rate, depth };
}

export function readTagList(value: string): string[] {
  const tags: string[] = [];
  for (const part of value.split(TAG_SEPARATOR)) {
    const tag = part.trim();
    if (tag) tags.push(tag);
  }
  return tags;
}
