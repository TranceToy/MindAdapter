import { describe, expect, it } from 'vitest';
import { assetFindings } from './asset-findings';
import type { Inventory } from './asset-findings';
import { parseScript } from './parse-script';
import type { Finding } from './finding';

const INVENTORY: Inventory = {
  images: new Map([['ocean', 12], ['void', 0]]),
  clips: new Map([['obedience', 4], ['calm', 0]]),
};

function findingsOf(text: string): Finding[] {
  const script = parseScript(text);
  return assetFindings(script, INVENTORY);
}

describe('assetFindings', () => {
  it('accepts tags whose pools hold at least one file', () => {
    const findings = findingsOf('voice: obedience\n\n# ocean\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('reports an image tag naming a pool that does not exist', () => {
    const findings = findingsOf('# ocaen\n\nOnly this.\n');
    expect(findings).toEqual([
      {
        locus: { kind: 'library', path: 'images/ocaen/' },
        message: '# ocaen at line 1 names a pool that does not exist',
      },
    ]);
  });

  it('reports an image tag naming an empty pool', () => {
    const findings = findingsOf('# void\n\nOnly this.\n');
    expect(findings[0]?.locus).toEqual({ kind: 'library', path: 'images/void/' });
    expect(findings[0]?.message).toBe('# void at line 1 names a pool with no images');
  });

  it('reports a clip tag naming a pool that does not exist', () => {
    const findings = findingsOf('voice: obedeince\n\n# ocean\n\nOnly this.\n');
    expect(findings).toEqual([
      {
        locus: { kind: 'library', path: 'clips/obedeince/' },
        message: 'voice: obedeince at line 1 names a pool that does not exist',
      },
    ]);
  });

  it('reports a clip pool with no readable clips', () => {
    const findings = findingsOf('# ocean\nvoice: calm\n\nOnly this.\n');
    expect(findings[0]?.locus).toEqual({ kind: 'library', path: 'clips/calm/' });
    expect(findings[0]?.message).toBe('voice: calm at line 2 names a pool with no readable clips');
  });

  it('accepts an empty voice value, which names no pool', () => {
    const findings = findingsOf('# ocean\nvoice:\n\nOnly this.\n');
    expect(findings).toEqual([]);
  });

  it('reports a broken tag once, at its first mention', () => {
    const script = '# ocaen\n\nOnly this.\n\n# ocaen\n\nAnd this.\n';
    const findings = findingsOf(script);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain('at line 1');
  });

  it('reports every broken tag of a script', () => {
    const script = '# ocaen, void\nvoice: calm, obedeince\n\nOnly this.\n';
    const findings = findingsOf(script);
    const paths = findings.map((finding) => finding.locus);
    expect(paths).toEqual([
      { kind: 'library', path: 'images/ocaen/' },
      { kind: 'library', path: 'images/void/' },
      { kind: 'library', path: 'clips/calm/' },
      { kind: 'library', path: 'clips/obedeince/' },
    ]);
  });
});
