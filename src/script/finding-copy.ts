import { BEAT_HIGH, BEAT_LOW, CARRIER_HIGH, CARRIER_LOW } from './declaration-values';
import type { Finding, Locus } from './finding';

export const PROSE_IN_HEAD = 'prose before the first segment, where only declarations belong';
export const PROSE_IN_SEGMENT = 'prose without the blank line a segment requires before it';
export const NO_SEGMENT_HEADER = 'no segment header anywhere';
export const NO_WORDS = 'no words left once punctuation is stripped';

export function unknownKeyLine(key: string): string {
  return `unknown declaration key ${key}`;
}

export function duplicateKeyLine(key: string): string {
  return `${key} declared twice in one block`;
}

export function malformedBedLine(value: string): string {
  return `bed ${value} is not a carrier/beat pair`;
}

export function carrierOutOfRangeLine(carrier: number): string {
  return `carrier ${carrier} Hz outside ${CARRIER_LOW}–${CARRIER_HIGH} Hz`;
}

export function beatOutOfRangeLine(beat: number): string {
  return `beat ${beat} Hz outside ${BEAT_LOW}–${BEAT_HIGH} Hz`;
}

export function missingImagePoolLine(tag: string, line: number): string {
  return `# ${tag} at line ${line} names a pool that does not exist`;
}

export function emptyImagePoolLine(tag: string, line: number): string {
  return `# ${tag} at line ${line} names a pool with no images`;
}

export function missingClipPoolLine(tag: string, line: number): string {
  return `voice: ${tag} at line ${line} names a pool that does not exist`;
}

export function emptyClipPoolLine(tag: string, line: number): string {
  return `voice: ${tag} at line ${line} names a pool with no readable clips`;
}

export const BACK_LINE = 'scripts';

export function problemsLine(count: number): string {
  const noun = count === 1 ? 'problem' : 'problems';
  return `${count} ${noun}`;
}

export function findingLine(finding: Finding): string {
  const locus = locusLine(finding.locus);
  return `${locus} — ${finding.message}`;
}

function locusLine(locus: Locus): string {
  if (locus.kind === 'file') return `line ${locus.line}`;
  return locus.path;
}
