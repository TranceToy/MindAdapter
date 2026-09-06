import {
  BEAT_HIGH,
  BEAT_LOW,
  CARRIER_HIGH,
  CARRIER_LOW,
  DEPTH_HIGH,
  DEPTH_LOW,
  GAP_LONGEST,
  GAP_SHORTEST,
  PACE_HIGH,
  PACE_LOW,
  RATE_HIGH,
  RATE_LOW,
  SPIRALS_HIGH,
  SWELL_HIGH,
  SWELL_LOW,
} from './declaration-values';
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

export function malformedPaceLine(value: string): string {
  return `pace ${value} is not a number of words per minute`;
}

export function paceOutOfRangeLine(pace: number): string {
  return `pace ${pace} outside ${PACE_LOW}–${PACE_HIGH} words per minute`;
}

export function malformedGapLine(value: string): string {
  return `gap ${value} is not a number of seconds or a low-high pair of them`;
}

export function gapOutOfRangeLine(seconds: number): string {
  return `gap ${seconds} outside ${GAP_SHORTEST}–${GAP_LONGEST} seconds`;
}

export function gapBackwardsLine(low: number, high: number): string {
  return `gap ${low}-${high} names its bounds the long way round`;
}

export function malformedSpiralLine(value: string): string {
  return `spiral ${value} is not a rate, a rate/depth pair, or a rate/from-to/seconds swell`;
}

export function tooManySpiralsLine(count: number): string {
  return `spiral names ${count} spirals, and a session turns ${SPIRALS_HIGH} at most`;
}

export function turningOutOfRangeLine(turning: number): string {
  return `spirals turning ${turning} turns per minute between them, past ${RATE_HIGH}`;
}

export function rateOutOfRangeLine(rate: number): string {
  return `spiral ${rate} outside ${RATE_LOW}–${RATE_HIGH} turns per minute in either direction`;
}

export function depthOutOfRangeLine(depth: number): string {
  return `spiral depth ${depth} outside ${DEPTH_LOW}–${DEPTH_HIGH}`;
}

export function swellOutOfRangeLine(seconds: number): string {
  return `spiral swell ${seconds} outside ${SWELL_LOW}–${SWELL_HIGH} seconds`;
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
