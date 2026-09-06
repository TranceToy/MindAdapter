import {
  BEAT_HIGH,
  BED_KEY,
  CARRIER_HIGH,
  CARRIER_LOW,
  DEPTH_HIGH,
  DEPTH_LOW,
  PACE_HIGH,
  PACE_KEY,
  PACE_LOW,
  RATE_HIGH,
  RATE_LOW,
  SPIRAL_KEY,
  SWELL_HIGH,
  SWELL_LOW,
  VOICE_KEY,
  readBedPair,
  readPace,
  readSpiral,
  swells,
} from './declaration-values';
import type { Depth } from './declaration-values';
import { fileFinding } from './finding';
import type { Finding } from './finding';
import {
  NO_SEGMENT_HEADER,
  NO_WORDS,
  PROSE_IN_HEAD,
  PROSE_IN_SEGMENT,
  beatOutOfRangeLine,
  carrierOutOfRangeLine,
  depthOutOfRangeLine,
  duplicateKeyLine,
  malformedBedLine,
  malformedPaceLine,
  malformedSpiralLine,
  paceOutOfRangeLine,
  rateOutOfRangeLine,
  swellOutOfRangeLine,
  unknownKeyLine,
} from './finding-copy';
import { countWords } from './parse-script';
import type { BlockEntry, DeclarationBlock, DeclarationEntry, ParsedScript } from './parse-script';

const WHOLE_FILE_LINE = 1;

export function formatFindings(script: ParsedScript): Finding[] {
  const findings = blockFindings(script.head, PROSE_IN_HEAD);
  for (const segment of script.segments) {
    const declared = blockFindings(segment.block, PROSE_IN_SEGMENT);
    findings.push(...declared);
  }
  const structure = structureFindings(script);
  findings.push(...structure);
  return findings;
}

function structureFindings(script: ParsedScript): Finding[] {
  if (script.segments.length === 0) {
    const headerless = fileFinding(WHOLE_FILE_LINE, NO_SEGMENT_HEADER);
    return [headerless];
  }
  if (countWords(script) === 0) {
    const wordless = fileFinding(WHOLE_FILE_LINE, NO_WORDS);
    return [wordless];
  }
  return [];
}

function blockFindings(block: DeclarationBlock, strayMessage: string): Finding[] {
  const findings: Finding[] = [];
  const declared = new Set<string>();
  for (const entry of block) {
    const found = entryFindings(entry, strayMessage, declared);
    findings.push(...found);
  }
  return findings;
}

function entryFindings(entry: BlockEntry, strayMessage: string, declared: Set<string>): Finding[] {
  if (entry.kind === 'stray') {
    const stray = fileFinding(entry.line, strayMessage);
    return [stray];
  }
  if (declared.has(entry.key)) {
    const message = duplicateKeyLine(entry.key);
    const duplicate = fileFinding(entry.line, message);
    return [duplicate];
  }
  declared.add(entry.key);
  return declarationFindings(entry);
}

function declarationFindings(entry: DeclarationEntry): Finding[] {
  if (entry.key === VOICE_KEY) return [];
  if (entry.key === BED_KEY) return bedFindings(entry);
  if (entry.key === PACE_KEY) return paceFindings(entry);
  if (entry.key === SPIRAL_KEY) return spiralFindings(entry);
  const message = unknownKeyLine(entry.key);
  const unknown = fileFinding(entry.line, message);
  return [unknown];
}

function paceFindings(entry: DeclarationEntry): Finding[] {
  const pace = readPace(entry.value);
  if (pace === null) {
    const message = malformedPaceLine(entry.value);
    const malformed = fileFinding(entry.line, message);
    return [malformed];
  }
  if (pace < PACE_LOW || pace > PACE_HIGH) {
    const message = paceOutOfRangeLine(pace);
    const outside = fileFinding(entry.line, message);
    return [outside];
  }
  return [];
}

// An empty value is the author asking for no spiral, the way an empty voice
// list asks for silence, so it is read before the value is read at all.
function spiralFindings(entry: DeclarationEntry): Finding[] {
  if (entry.value === '') return [];
  const spiral = readSpiral(entry.value);
  if (!spiral) {
    const message = malformedSpiralLine(entry.value);
    const malformed = fileFinding(entry.line, message);
    return [malformed];
  }
  const findings = rateFindings(entry, spiral.rate);
  const depth = depthFindings(entry, spiral.depth);
  findings.push(...depth);
  return findings;
}

// How fast it turns is bounded and which way it turns is not, so the bounds are
// read off the rate without its sign.
function rateFindings(entry: DeclarationEntry, rate: number): Finding[] {
  const turning = Math.abs(rate);
  if (turning < RATE_LOW || turning > RATE_HIGH) {
    const message = rateOutOfRangeLine(rate);
    const outside = fileFinding(entry.line, message);
    return [outside];
  }
  return [];
}

// A still depth is one bound reported once rather than the same number twice,
// and it has no seconds to be outside anything.
function depthFindings(entry: DeclarationEntry, depth: Depth): Finding[] {
  const findings: Finding[] = [];
  const swelling = swells(depth);
  const bounds = swelling ? [depth.from, depth.to] : [depth.from];
  for (const bound of bounds) {
    if (bound < DEPTH_LOW || bound > DEPTH_HIGH) {
      const message = depthOutOfRangeLine(bound);
      const outside = fileFinding(entry.line, message);
      findings.push(outside);
    }
  }
  if (swelling && (depth.seconds < SWELL_LOW || depth.seconds > SWELL_HIGH)) {
    const message = swellOutOfRangeLine(depth.seconds);
    const outside = fileFinding(entry.line, message);
    findings.push(outside);
  }
  return findings;
}

function bedFindings(entry: DeclarationEntry): Finding[] {
  const pair = readBedPair(entry.value);
  if (!pair) {
    const message = malformedBedLine(entry.value);
    const malformed = fileFinding(entry.line, message);
    return [malformed];
  }
  const findings: Finding[] = [];
  if (pair.carrier < CARRIER_LOW || pair.carrier > CARRIER_HIGH) {
    const message = carrierOutOfRangeLine(pair.carrier);
    const carrier = fileFinding(entry.line, message);
    findings.push(carrier);
  }
  if (pair.beat > BEAT_HIGH) {
    const message = beatOutOfRangeLine(pair.beat);
    const beat = fileFinding(entry.line, message);
    findings.push(beat);
  }
  return findings;
}
