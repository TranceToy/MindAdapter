import type { LibraryFile, Pool } from '../library/walk-library';
import type { Segment } from '../script/resolve-script';
import type { Rounds } from '../script/session-round';
import { bindPools } from './image-pools';
import { heldByRound } from './segment-order';
import type { SegmentOrder } from './segment-order';

// The imagery spends the whole flash budget, since a new photograph is the only
// change that takes the whole frame at once: eight words to an image is 0.46 Hz
// at the default pace and 0.5 Hz at the pace ceiling. See ADR 0006.
export const WORDS_PER_IMAGE = 8;

export type ImageSlot = {
  at: number;
  pool: LibraryFile[];
};

// The imagery of a session rather than of a round: the slots a round holds,
// asked for by round since a shuffled script opens different slots on different
// rounds, and the words a round spends, which is the same count whatever order
// it spends them in and so puts the round after it a whole script further along
// a line that only ever counts forward.
export type SlotLine = {
  slots: (round: number) => ImageSlot[];
  words: number;
  loops: boolean;
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

export function slotLine(order: SegmentOrder, pools: Pool[], rounds: Rounds): SlotLine {
  const slots = heldByRound((round: number) => imageSlots(order.playing(round).segments, pools));
  const words = order.playing(0).times.words;
  return { slots, words, loops: rounds.loops };
}

// The slot after a word, counted on rather than back: past the last slot of a
// round the next one is the first of the round after it, a whole script's words
// further on, so a layer waiting for it waits rather than finding it already
// reached. The round after it is asked for its own slots, which is where a
// shuffled script's next round is drawn.
export function slotAfter(line: SlotLine, word: number): ImageSlot | null {
  const behind = line.loops ? Math.floor(word / line.words) : 0;
  const held = line.slots(behind);
  const next = held.find((slot) => slot.at > word - behind * line.words);
  if (next) return shifted(next, behind * line.words);
  if (!line.loops) return null;
  const opening = line.slots(behind + 1)[0];
  if (!opening) return null;
  return shifted(opening, (behind + 1) * line.words);
}

function shifted(slot: ImageSlot, words: number): ImageSlot {
  if (words === 0) return slot;
  return { at: slot.at + words, pool: slot.pool };
}

function slotsAcross(pool: LibraryFile[], from: number, words: number): ImageSlot[] {
  const slots: ImageSlot[] = [];
  for (let word = 0; word < words; word += WORDS_PER_IMAGE) {
    const slot = { at: from + word, pool };
    slots.push(slot);
  }
  return slots;
}
