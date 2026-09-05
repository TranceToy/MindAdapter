import { describe, expect, it } from 'vitest';
import type { LibraryFile } from '../library/walk-library';
import { drawImage } from './image-draw';

function file(path: string): LibraryFile {
  return { path, handle: {} as FileSystemFileHandle, size: 1, lastModified: 1 };
}

const POOL = [file('a.jpg'), file('b.jpg'), file('c.jpg')];

function rolling(...values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe('drawImage', () => {
  it('is uniform over the pool', () => {
    expect(drawImage(POOL, null, rolling(0))?.path).toBe('a.jpg');
    expect(drawImage(POOL, null, rolling(0.5))?.path).toBe('b.jpg');
    expect(drawImage(POOL, null, rolling(0.99))?.path).toBe('c.jpg');
  });

  it('leaves the file on screen out of the running', () => {
    expect(drawImage(POOL, 'a.jpg', rolling(0))?.path).toBe('b.jpg');
    expect(drawImage(POOL, 'b.jpg', rolling(0.99))?.path).toBe('c.jpg');
  });

  it('repeats the one file a single-file pool holds', () => {
    const single = [file('a.jpg')];
    expect(drawImage(single, 'a.jpg', rolling(0))?.path).toBe('a.jpg');
  });

  it('draws nothing from an empty pool', () => {
    expect(drawImage([], null, rolling(0))).toBeNull();
  });
});
