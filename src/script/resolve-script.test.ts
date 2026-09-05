import { describe, expect, it } from 'vitest';
import { parseScript } from './parse-script';
import { resolveSegments } from './resolve-script';

const SCRIPT = `bed: 150/6
voice: obedience

# ocean

The water is warm.

# void

Nothing above you.

#
voice:

Only this.
`;

describe('resolveSegments', () => {
  it('inherits the running bed pair and voice binding', () => {
    const segments = resolveSegments(parseScript(SCRIPT));
    expect(segments[1]?.bed).toEqual({ carrier: 150, beat: 6 });
    expect(segments[1]?.voice).toEqual(['obedience']);
  });

  it('does not inherit image tags, so a bare header is black', () => {
    const segments = resolveSegments(parseScript(SCRIPT));
    const tags = segments.map((segment) => segment.tags);
    expect(tags).toEqual([['ocean'], ['void'], []]);
  });

  it('binds an empty voice value to silence rather than inheriting', () => {
    const segments = resolveSegments(parseScript(SCRIPT));
    expect(segments[2]?.voice).toEqual([]);
  });

  it('holds a declared pair until the next declaration', () => {
    const script = parseScript('# ocean\nbed: 140/4\n\nOne.\n\n# void\n\nTwo.\n');
    const segments = resolveSegments(script);
    expect(segments[0]?.bed).toEqual({ carrier: 140, beat: 4 });
    expect(segments[1]?.bed).toEqual({ carrier: 140, beat: 4 });
  });

  it('falls back to the app defaults when a script declares no bed', () => {
    const segments = resolveSegments(parseScript('# ocean\n\nOnly this.\n'));
    expect(segments[0]?.bed).toEqual({ carrier: 150, beat: 6 });
    expect(segments[0]?.voice).toEqual([]);
  });
});
