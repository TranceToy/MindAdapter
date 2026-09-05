import { describe, expect, it } from 'vitest';
import { fileFinding, libraryFinding } from './finding';
import { findingLine } from './finding-copy';

describe('findingLine', () => {
  it('leads a file finding with its line number', () => {
    const finding = fileFinding(12, 'beat 600 Hz outside 0–30 Hz');
    expect(findingLine(finding)).toBe('line 12 — beat 600 Hz outside 0–30 Hz');
  });

  it('leads a library finding with its root-relative path', () => {
    const message = '# ocaen at line 8 names a pool that does not exist';
    const finding = libraryFinding('images/ocaen/', message);
    expect(findingLine(finding)).toBe(`images/ocaen/ — ${message}`);
  });
});
