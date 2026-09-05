export const BED_KEY = 'bed';
export const VOICE_KEY = 'voice';

export const CARRIER_LOW = 50;
export const CARRIER_HIGH = 1000;
export const BEAT_LOW = 0;
export const BEAT_HIGH = 30;

const BED_PAIR = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/;
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

export function readTagList(value: string): string[] {
  const tags: string[] = [];
  for (const part of value.split(TAG_SEPARATOR)) {
    const tag = part.trim();
    if (tag) tags.push(tag);
  }
  return tags;
}
