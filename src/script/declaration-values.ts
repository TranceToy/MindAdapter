export const BED_KEY = 'bed';
export const VOICE_KEY = 'voice';
export const PACE_KEY = 'pace';

export const CARRIER_LOW = 50;
export const CARRIER_HIGH = 1000;
export const BEAT_LOW = 0;
export const BEAT_HIGH = 30;
// The bounds are the word layer's own: above the high one the eight-word image
// slot passes half a hertz of full-screen luminance change, and below the low
// one a word is held so long that the session reads as stopped rather than slow.
export const PACE_LOW = 40;
export const PACE_HIGH = 240;

const BED_PAIR = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/;
const PACE_NUMBER = /^\d+(?:\.\d+)?$/;
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

export function readTagList(value: string): string[] {
  const tags: string[] = [];
  for (const part of value.split(TAG_SEPARATOR)) {
    const tag = part.trim();
    if (tag) tags.push(tag);
  }
  return tags;
}
