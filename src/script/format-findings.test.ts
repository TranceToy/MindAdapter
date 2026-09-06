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
