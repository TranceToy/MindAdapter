import { describe, expect, it } from 'vitest';
import type { LibraryFile, Pool } from '../library/walk-library';
import { bindPools } from './image-pools';

function file(path: string): LibraryFile {
  return { path, handle: {} as FileSystemFileHandle, size: 1, lastModified: 1 };
}

function pool(tag: string, paths: string[]): Pool {
  return { tag, files: paths.map(file) };
}

const OCEAN = pool('ocean', ['images/ocean/a.jpg', 'images/ocean/b.jpg']);
const VOID = pool('void', ['images/void/c.jpg']);
const POOLS = [OCEAN, VOID];

describe('bindPools', () => {
  it('is the files of a single tag', () => {
    expect(bindPools(POOLS, ['void'])).toEqual(VOID.files);
  });

  it('is one flat union across tags, weighted by what the folders hold', () => {
    const bound = bindPools(POOLS, ['ocean', 'void']);
    expect(bound.map((held) => held.path)).toEqual([
      'images/ocean/a.jpg',
      'images/ocean/b.jpg',
      'images/void/c.jpg',
    ]);
  });

  it('binds a repeated tag once', () => {
    expect(bindPools(POOLS, ['void', 'void'])).toHaveLength(1);
  });

  it('binds nothing without tags', () => {
    expect(bindPools(POOLS, [])).toEqual([]);
  });

  it('leaves a tag with no pool on disk blank', () => {
    expect(bindPools(POOLS, ['tide'])).toEqual([]);
  });
});
