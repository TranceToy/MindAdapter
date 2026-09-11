import { describe, expect, it } from 'vitest';
import type { LibraryFile, Pool } from '../library/walk-library';
import { DEFAULT_GAP, DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import type { Word } from '../script/tokenise-prose';
import { WORDS_PER_IMAGE, imageSlots, slotAfter, slotLine } from './image-schedule';
import { writtenOrder } from './segment-order';

function file(path: string): LibraryFile {
  return { path, handle: {} as FileSystemFileHandle, size: 1, lastModified: 1 };
}

function pool(tag: string, paths: string[]): Pool {
  return { tag, files: paths.map(file) };
}

const WORD: Word = { text: 'down', marked: false };

function segment(tags: string[], words: number): Segment {
  return {
    tags,
    bed: { carrier: 150, beat: 6 },
    voice: [],
    pace: DEFAULT_PACE,
    gap: DEFAULT_GAP,
    spirals: [],
    words: new Array(words).fill(WORD),
  };
}

const OCEAN = pool('ocean', ['images/ocean/a.jpg', 'images/ocean/b.jpg']);
const VOID = pool('void', ['images/void/c.jpg']);
const POOLS = [OCEAN, VOID];

describe('imageSlots', () => {
  it('draws every eight words', () => {
    const slots = imageSlots([segment(['ocean'], 20)], POOLS);
    expect(slots.map((slot) => slot.at)).toEqual([0, 8, 16]);
  });

  it('draws on a segment change and restarts the count there', () => {
    const segments = [segment(['ocean'], 10), segment(['void'], 10)];
    const slots = imageSlots(segments, POOLS);
    expect(slots.map((slot) => slot.at)).toEqual([0, 8, 10, 18]);
  });

  it('binds the union of a segment tag list, flat', () => {
    const slots = imageSlots([segment(['ocean', 'void'], 1)], POOLS);
    expect(slots[0]?.pool).toHaveLength(3);
  });

  it('binds nothing for a segment with no tags', () => {
    const slots = imageSlots([segment([], 8)], POOLS);
    expect(slots[0]?.pool).toEqual([]);
  });

  it('is empty without segments', () => {
    expect(imageSlots([], POOLS)).toEqual([]);
  });

  it('gives a segment shorter than the count one slot', () => {
    const slots = imageSlots([segment(['ocean'], WORDS_PER_IMAGE - 1)], POOLS);
    expect(slots).toHaveLength(1);
  });
});

describe('slotAfter', () => {
  const straight = [segment(['ocean'], 24)];
  const once = slotLine(writtenOrder(straight), POOLS, { seconds: 0, loops: false });

  it('opens on the first slot from before the first word', () => {
    expect(slotAfter(once, -1)?.at).toBe(0);
  });

  it('takes the next slot from the word a slot was drawn on', () => {
    expect(slotAfter(once, 0)?.at).toBe(8);
    expect(slotAfter(once, 8)?.at).toBe(16);
  });

  it('skips the slots a late draw ran past', () => {
    expect(slotAfter(once, 10)?.at).toBe(16);
  });

  it('has nothing past the last slot', () => {
    expect(slotAfter(once, 16)).toBeNull();
  });
});

describe('slotAfter, where the script comes round', () => {
  const segments = [segment(['ocean'], 24)];
  const looped = slotLine(writtenOrder(segments), POOLS, { seconds: 60, loops: true });

  it('follows the last slot of a round with the first of the next', () => {
    expect(slotAfter(looped, 16)?.at).toBe(24);
  });

  it('counts on rather than back, so a later round is never already reached', () => {
    expect(slotAfter(looped, 24)?.at).toBe(32);
    expect(slotAfter(looped, 40)?.at).toBe(48);
  });

  it('opens a round on the pool its first segment names', () => {
    const paired = [segment(['ocean'], 8), segment(['void'], 8)];
    const line = slotLine(writtenOrder(paired), POOLS, { seconds: 60, loops: true });
    const opening = slotAfter(line, 15);
    expect(opening?.at).toBe(16);
    expect(opening?.pool).toEqual(line.slots(0)[0]?.pool);
  });
});
