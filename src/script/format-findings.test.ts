import { describe, expect, it } from 'vitest';
import { formatFindings } from './format-findings';
import { parseScript } from './parse-script';
import type { Finding } from './finding';

function findingsOf(text: string): Finding[] {
  const script = parseScript(text);
  return formatFindings(script);
}

function messagesOf(text: string): string[] {
  const findings = findingsOf(text);
  return findings.map((finding) => finding.message);
}

describe('formatFindings', () => {
  it('accepts a clean script', () => {
    const findings = findingsOf('bed: 141.5/7.83\n\n# ocean\nvoice: obedience\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('reports prose in the head at its line', () => {
    const findings = findingsOf('the water is warm\n\n# ocean\n\nOnly this.\n');
    expect(findings).toHaveLength(1);
    expect(findings[0]?.locus).toEqual({ kind: 'file', line: 1 });
    expect(findings[0]?.message).toContain('prose');
  });

  it('reports prose that lost the blank line a segment requires', () => {
    const findings = findingsOf('# ocean\nOnly this\n');
    expect(findings[0]?.locus).toEqual({ kind: 'file', line: 2 });
  });

  it('reports an unknown declaration key', () => {
    const findings = findingsOf('imges: ocean\n\n# ocean\n\nOnly this.\n');
    expect(findings[0]?.message).toBe('unknown declaration key imges');
    expect(findings[0]?.locus).toEqual({ kind: 'file', line: 1 });
  });

  it('rejects a partial bed pair', () => {
    const messages = messagesOf('bed: 150\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['bed 150 is not a carrier/beat pair']);
  });

  it('reports a duplicate key in one block', () => {
    const findings = findingsOf('# ocean\nbed: 150/6\nbed: 140/4\n\nOnly this.\n');
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toBe('bed declared twice in one block');
    expect(findings[0]?.locus).toEqual({ kind: 'file', line: 3 });
  });

  it('accepts the same key once in each of two blocks', () => {
    const findings = findingsOf('bed: 150/6\n\n# ocean\nbed: 140/4\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('reports a script with no segment header', () => {
    const messages = messagesOf('bed: 150/6\n');
    expect(messages).toEqual(['no segment header anywhere']);
  });

  it('reports a script whose prose leaves no words', () => {
    const messages = messagesOf('# ocean\n\n— … —\n');
    expect(messages).toEqual(['no words left once punctuation is stripped']);
  });

  it('rejects a bed pair outside its range rather than clamping it', () => {
    const messages = messagesOf('bed: 150/600\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['beat 600 Hz outside 0–30 Hz']);
  });

  it('rejects a carrier outside its range', () => {
    const low = messagesOf('bed: 40/6\n\n# ocean\n\nOnly this.\n');
    const high = messagesOf('bed: 1200/6\n\n# ocean\n\nOnly this.\n');
    expect(low).toEqual(['carrier 40 Hz outside 50–1000 Hz']);
    expect(high).toEqual(['carrier 1200 Hz outside 50–1000 Hz']);
  });

  it('accepts decimals, the range bounds and a beat of zero', () => {
    const findings = findingsOf('bed: 50/0\n\n# ocean\nbed: 1000/30\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('accepts a pace in words per minute, in the head or on a segment', () => {
    const findings = findingsOf('pace: 180\n\n# ocean\npace: 120.5\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('rejects a pace that is not a number', () => {
    const messages = messagesOf('pace: slow\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['pace slow is not a number of words per minute']);
  });

  it('rejects a pace outside its range rather than clamping it', () => {
    const low = messagesOf('pace: 20\n\n# ocean\n\nOnly this.\n');
    const high = messagesOf('pace: 400\n\n# ocean\n\nOnly this.\n');
    expect(low).toEqual(['pace 20 outside 40–240 words per minute']);
    expect(high).toEqual(['pace 400 outside 40–240 words per minute']);
  });

  it('accepts a spiral rate alone, and a rate with a depth', () => {
    const findings = findingsOf('spiral: 3\n\n# ocean\nspiral: 1.5/0.3\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('accepts a rate below zero as the same turn the other way round', () => {
    const findings = findingsOf('spiral: -3\n\n# ocean\nspiral: -1.5/0.3\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('accepts a depth that swells between two bounds over its seconds', () => {
    const findings = findingsOf('spiral: 3/0.05-0.3/40\n\n# ocean\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('accepts a pair of spirals turning against each other', () => {
    const findings = findingsOf('spiral: 3, -2/0.08\n\n# ocean\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('accepts an empty spiral value as the way to stop it', () => {
    const findings = findingsOf('spiral: 3\n\n# ocean\nspiral:\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('rejects a spiral that is none of the three shapes it may take', () => {
    const messages = messagesOf('spiral: slow/deep\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual([
      'spiral slow/deep is not a rate, a rate/depth pair, or a rate/from-to/seconds swell',
    ]);
  });

  it('rejects a swell missing the seconds it takes to travel', () => {
    const messages = messagesOf('spiral: 3/0.05-0.3\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual([
      'spiral 3/0.05-0.3 is not a rate, a rate/depth pair, or a rate/from-to/seconds swell',
    ]);
  });

  it('rejects a third spiral rather than turning two of the three', () => {
    const messages = messagesOf('spiral: 2, -2, 1\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['spiral names 3 spirals, and a session turns 2 at most']);
  });

  // Each of them is inside the bounds; what they turn between them is not.
  it('rejects a pair that turns more in the frame than one spiral may', () => {
    const messages = messagesOf('spiral: 8, -6\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['spirals turning 14 turns per minute between them, past 12']);
  });

  it('leaves a pair that meets the bound exactly alone', () => {
    const findings = findingsOf('spiral: 8.1, -3.9\n\n# ocean\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('rejects a spiral rate outside its range rather than clamping it', () => {
    const low = messagesOf('spiral: 0.2\n\n# ocean\n\nOnly this.\n');
    const high = messagesOf('spiral: 20\n\n# ocean\n\nOnly this.\n');
    expect(low).toEqual(['spiral 0.2 outside 0.5–12 turns per minute in either direction']);
    expect(high).toEqual(['spiral 20 outside 0.5–12 turns per minute in either direction']);
  });

  it('bounds a rate below zero by the same numbers as one above it', () => {
    const messages = messagesOf('spiral: -20\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['spiral -20 outside 0.5–12 turns per minute in either direction']);
  });

  it('rejects a depth past the whole of the frame', () => {
    const messages = messagesOf('spiral: 3/1.5\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['spiral depth 1.5 outside 0–1']);
  });

  it('reports each bound of a swell that runs past the frame', () => {
    const messages = messagesOf('spiral: 3/2-1.5/40\n\n# ocean\n\nOnly this.\n');
    expect(messages).toEqual(['spiral depth 2 outside 0–1', 'spiral depth 1.5 outside 0–1']);
  });

  it('rejects a swell that would pass as a pulse, or never come round', () => {
    const quick = messagesOf('spiral: 3/0.05-0.3/2\n\n# ocean\n\nOnly this.\n');
    const slow = messagesOf('spiral: 3/0.05-0.3/900\n\n# ocean\n\nOnly this.\n');
    expect(quick).toEqual(['spiral swell 2 outside 10–600 seconds']);
    expect(slow).toEqual(['spiral swell 900 outside 10–600 seconds']);
  });

  it('reports every finding rather than the first', () => {
    const script = 'the water is warm\nimges: ocean\n\n# ocean\nbed: 150\nbed: 150/600\n\nOnly this.\n';
    const findings = findingsOf(script);
    const lines = findings.map((finding) => finding.locus);
    expect(findings).toHaveLength(4);
    expect(lines).toEqual([
      { kind: 'file', line: 1 },
      { kind: 'file', line: 2 },
      { kind: 'file', line: 5 },
      { kind: 'file', line: 6 },
    ]);
  });
});
