import { describe, expect, it } from 'vitest';
import type { LibraryFile, Pool } from '../library/walk-library';
import { DEFAULT_PACE } from '../script/declaration-values';
import type { Segment } from '../script/resolve-script';
import { WORDS_PER_IMAGE, imageSlots, slotAfter } from './image-schedule';

function file(path: string): LibraryFile {
  return { path, handle: {} as FileSystemFileHandle, size: 1, lastModified: 1 };
}

function pool(tag: string, paths: string[]): Pool {
  return { tag, files: paths.map(file) };
}

function segment(tags: string[], words: number): Segment {
  return {
    tags,
    bed: { carrier: 150, beat: 6 },
    voice: [],
    pace: DEFAULT_PACE,
    spiral: null,
    words: new Array(words).fill('down'),
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
  const slots = imageSlots([segment(['ocean'], 24)], POOLS);

  it('opens on the first slot from before the first word', () => {
    expect(slotAfter(slots, -1)?.at).toBe(0);
  });

  it('takes the next slot from the word a slot was drawn on', () => {
    expect(slotAfter(slots, 0)?.at).toBe(8);
    expect(slotAfter(slots, 8)?.at).toBe(16);
  });

  it('skips the slots a late draw ran past', () => {
    expect(slotAfter(slots, 10)?.at).toBe(16);
  });

  it('has nothing past the last slot', () => {
    expect(slotAfter(slots, 16)).toBeNull();
  });
});
