import { describe, expect, it } from 'vitest';
import { pinnedToMono } from './audio-invariant';

const DEFAULTS = {
  channelCount: 2,
  channelCountMode: 'max',
  channelInterpretation: 'speakers',
} as const;

describe('pinnedToMono', () => {
  it('is empty when every node is on the defaults', () => {
    expect(pinnedToMono({ bed: DEFAULTS, voice: DEFAULTS, master: DEFAULTS })).toEqual([]);
  });

  it('names a node counting one channel', () => {
    const mono = { ...DEFAULTS, channelCount: 1, channelCountMode: 'explicit' } as const;
    expect(pinnedToMono({ bed: DEFAULTS, master: mono })).toEqual(['master']);
  });

  it('names a node counting channels explicitly at all', () => {
    const explicit = { ...DEFAULTS, channelCountMode: 'explicit' } as const;
    expect(pinnedToMono({ master: explicit })).toEqual(['master']);
  });

  it('names a node reading its input as discrete', () => {
    const discrete = { ...DEFAULTS, channelInterpretation: 'discrete' } as const;
    expect(pinnedToMono({ voice: discrete })).toEqual(['voice']);
  });
});
