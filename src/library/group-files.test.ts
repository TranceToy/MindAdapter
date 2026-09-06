import { describe, expect, it } from 'vitest';
import { holdsLibrary, libraryPath, poolsUnder, scriptFilesUnder } from './group-files';
import type { FileSource } from './library-source';
import type { LibraryFile } from './walk-library';

function file(path: string): LibraryFile {
  return { path, handle: {} as FileSource, size: 1, lastModified: 1 };
}

const FILES = [
  file('scripts/descent.md'),
  file('scripts/notes/draft.md'),
  file('scripts/cover.jpg'),
  file('images/ocean/a.jpg'),
  file('images/ocean/deep/b.png'),
  file('images/void/c.txt'),
  file('images/loose.jpg'),
  file('clips/obedience/one.wav'),
];

describe('libraryPath', () => {
  it('drops the picked folder from the front', () => {
    expect(libraryPath('library/images/ocean/a.jpg')).toBe('images/ocean/a.jpg');
  });

  it('leaves a bare name alone', () => {
    expect(libraryPath('a.jpg')).toBe('a.jpg');
  });
});

describe('poolsUnder', () => {
  it('gathers a section into one pool per tag, nesting included', () => {
    const pools = poolsUnder(FILES, 'images', 'image');
    expect(pools).toHaveLength(1);
    expect(pools[0]?.tag).toBe('ocean');
    expect(pools[0]?.files.map((held) => held.path)).toEqual([
      'images/ocean/a.jpg',
      'images/ocean/deep/b.png',
    ]);
  });

  it('takes only the kind the section holds', () => {
    expect(poolsUnder(FILES, 'clips', 'audio').map((pool) => pool.tag)).toEqual(['obedience']);
    expect(poolsUnder(FILES, 'clips', 'image')).toEqual([]);
  });
});

describe('scriptFilesUnder', () => {
  it('takes the scripts beside the section and no others', () => {
    expect(scriptFilesUnder(FILES).map((held) => held.path)).toEqual(['scripts/descent.md']);
  });
});

describe('holdsLibrary', () => {
  it('knows a folder with a section from one without', () => {
    expect(holdsLibrary(FILES)).toBe(true);
    expect(holdsLibrary([file('holiday/a.jpg')])).toBe(false);
    expect(holdsLibrary([])).toBe(false);
  });
});
