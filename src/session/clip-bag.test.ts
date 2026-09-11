import { describe, expect, it } from 'vitest';
import type { MeasuredClip } from '../library/clip-reconcile';
import { fillBag } from './clip-bag';
import type { ClipBag } from './clip-bag';
import type { Roll } from './draw';

function clip(path: string): MeasuredClip {
  return {
    path,
    handle: {} as FileSystemFileHandle,
    size: 1,
    lastModified: 1,
    rmsScalar: 1,
    peak: 1,
    duration: 4,
  };
}

function rolling(...values: number[]): Roll {
  let index = 0;
  return () => values[index++] ?? 0;
}

function take(bag: ClipBag, draws: number): string[] {
  const heard: string[] = [];
  for (let draw = 0; draw < draws; draw += 1) heard.push(bag.draw()?.path ?? '');
  return heard;
}

const A = clip('clips/obedience/a.mp3');
const B = clip('clips/obedience/b.mp3');
const C = clip('clips/obedience/c.mp3');
const CLIPS = [A, B, C];

describe('fillBag', () => {
  it('plays through every clip before any is heard twice', () => {
    const bag = fillBag(CLIPS, Math.random);
    const heard = take(bag, CLIPS.length);
    expect(new Set(heard).size).toBe(CLIPS.length);
  });

  it('reshuffles once the bag is empty', () => {
    const bag = fillBag(CLIPS, Math.random);
    const heard = take(bag, 2 * CLIPS.length);
    expect(new Set(heard.slice(CLIPS.length)).size).toBe(CLIPS.length);
  });

  it('re-draws a new bag that would repeat across the seam', () => {
    const bag = fillBag(CLIPS, rolling(0, 0, 0, 0.9, 0.8, 0.1, 0));
    expect(take(bag, 4)).toEqual([A.path, B.path, C.path, B.path]);
  });

  it('never repeats a clip from one draw to the next', () => {
    const bag = fillBag(CLIPS, Math.random);
    const heard = take(bag, 60);
    const repeats = heard.filter((path, at) => path === heard[at - 1]);
    expect(repeats).toEqual([]);
  });

  it('repeats the one clip a single-clip pool holds', () => {
    const bag = fillBag([A], Math.random);
    expect(take(bag, 3)).toEqual([A.path, A.path, A.path]);
  });

  it('draws nothing from an empty pool', () => {
    const bag = fillBag([], Math.random);
    expect(bag.draw()).toBeNull();
  });
});
