import { describe, expect, it } from 'vitest';
import type { MeasuredClip } from '../library/clip-reconcile';
import type { ClipPool } from '../library/scan-library';
import { bindClips } from './voice-pools';

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

function pool(tag: string, paths: string[]): ClipPool {
  return { tag, clips: paths.map(clip) };
}

const OBEDIENCE = pool('obedience', ['clips/obedience/a.mp3', 'clips/obedience/b.mp3']);
const SUBMISSION = pool('submission', ['clips/submission/c.mp3']);
const POOLS = [OBEDIENCE, SUBMISSION];

describe('bindClips', () => {
  it('is the clips of a single tag', () => {
    expect(bindClips(POOLS, ['submission'])).toEqual(SUBMISSION.clips);
  });

  it('is one flat union across tags, weighted by what the folders hold', () => {
    const bound = bindClips(POOLS, ['obedience', 'submission']);
    expect(bound.map((held) => held.path)).toEqual([
      'clips/obedience/a.mp3',
      'clips/obedience/b.mp3',
      'clips/submission/c.mp3',
    ]);
  });

  it('binds a repeated tag once', () => {
    expect(bindClips(POOLS, ['submission', 'submission'])).toHaveLength(1);
  });

  it('binds nothing for an empty declaration', () => {
    expect(bindClips(POOLS, [])).toEqual([]);
  });

  it('leaves a tag with no pool on disk blank', () => {
    expect(bindClips(POOLS, ['tide'])).toEqual([]);
  });
});
