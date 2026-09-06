import { describe, expect, it } from 'vitest';
import { parseScript } from './parse-script';
import { resolveSegments } from './resolve-script';

const SCRIPT = `bed: 150/6
voice: obedience
pace: 180

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

  it('holds the declared pace until a segment declares its own', () => {
    const script = parseScript('pace: 180\n\n# ocean\n\nOne.\n\n# void\npace: 120\n\nTwo.\n');
    const segments = resolveSegments(script);
    expect(segments.map((segment) => segment.pace)).toEqual([180, 120]);
  });

  it('holds a declared pair until the next declaration', () => {
    const script = parseScript('# ocean\nbed: 140/4\n\nOne.\n\n# void\n\nTwo.\n');
    const segments = resolveSegments(script);
    expect(segments[0]?.bed).toEqual({ carrier: 140, beat: 4 });
    expect(segments[1]?.bed).toEqual({ carrier: 140, beat: 4 });
  });

  it('shows no spiral where a script declares none', () => {
    const segments = resolveSegments(parseScript(SCRIPT));
    expect(segments[0]?.spirals).toEqual([]);
  });

  it('holds a declared spiral until a segment declares its own', () => {
    const script = parseScript('spiral: 3\n\n# ocean\n\nOne.\n\n# void\nspiral: 1.5/0.4\n\nTwo.\n');
    const segments = resolveSegments(script);
    expect(segments[0]?.spirals).toEqual([
      { rate: 3, depth: { from: 0.15, to: 0.15, seconds: 0 } },
    ]);
    expect(segments[1]?.spirals).toEqual([
      { rate: 1.5, depth: { from: 0.4, to: 0.4, seconds: 0 } },
    ]);
  });

  it('holds a spiral declared to turn backwards, and one declared to swell', () => {
    const declared = 'spiral: -3\n\n# ocean\n\nOne.\n\n# void\nspiral: 2/0.1-0.5/30\n\nTwo.\n';
    const segments = resolveSegments(parseScript(declared));
    expect(segments[0]?.spirals).toEqual([
      { rate: -3, depth: { from: 0.15, to: 0.15, seconds: 0 } },
    ]);
    expect(segments[1]?.spirals).toEqual([
      { rate: 2, depth: { from: 0.1, to: 0.5, seconds: 30 } },
    ]);
  });

  it('holds a pair where a comma declares one, in the order it was written', () => {
    const declared = 'spiral: 3, -2/0.08\n\n# ocean\n\nOne.\n';
    const segments = resolveSegments(parseScript(declared));
    expect(segments[0]?.spirals).toEqual([
      { rate: 3, depth: { from: 0.15, to: 0.15, seconds: 0 } },
      { rate: -2, depth: { from: 0.08, to: 0.08, seconds: 0 } },
    ]);
  });

  it('stops the spiral on an empty value rather than inheriting', () => {
    const script = parseScript('spiral: 3\n\n# ocean\n\nOne.\n\n# void\nspiral:\n\nTwo.\n');
    const segments = resolveSegments(script);
    expect(segments[1]?.spirals).toEqual([]);
  });

  it('falls back to the app defaults when a script declares no bed or pace', () => {
    const segments = resolveSegments(parseScript('# ocean\n\nOnly this.\n'));
    expect(segments[0]?.bed).toEqual({ carrier: 150, beat: 6 });
    expect(segments[0]?.voice).toEqual([]);
    expect(segments[0]?.pace).toBe(220);
  });
});
