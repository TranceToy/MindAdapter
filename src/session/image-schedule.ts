import type { LibraryFile, Pool } from '../library/walk-library';
import type { Segment } from '../script/resolve-script';
import { bindPools } from './image-pools';

// 0.46 Hz of full-screen luminance change, a factor of eight under the flash
// threshold the word layer sits so close to.
export const WORDS_PER_IMAGE = 8;

export type ImageSlot = {
  at: number;
  pool: LibraryFile[];
};

// The whole session's imagery is known before a word is shown, so it is a
// schedule rather than a state machine. A segment opens a slot on its first
// word whatever the running count, which is what makes its header the whole
// truth about what is on screen.
export function imageSlots(segments: Segment[], pools: Pool[]): ImageSlot[] {
  const slots: ImageSlot[] = [];
  let words = 0;
  for (const segment of segments) {
    const pool = bindPools(pools, segment.tags);
    const held = slotsAcross(pool, words, segment.words.length);
    slots.push(...held);
    words += segment.words.length;
  }
  return slots;
}

export function slotAfter(slots: ImageSlot[], word: number): ImageSlot | null {
  const next = slots.find((slot) => slot.at > word);
  return next ?? null;
}

function slotsAcross(pool: LibraryFile[], from: number, words: number): ImageSlot[] {
  const slots: ImageSlot[] = [];
  for (let word = 0; word < words; word += WORDS_PER_IMAGE) {
    const slot = { at: from + word, pool };
    slots.push(slot);
  }
  return slots;
}
