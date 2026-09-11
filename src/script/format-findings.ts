import {
  BEAT_HIGH,
  BED_KEY,
  CARRIER_HIGH,
  CARRIER_LOW,
  DEPTH_HIGH,
  DEPTH_LOW,
  GAP_KEY,
  GAP_LONGEST,
  GAP_SHORTEST,
  LOOP_KEY,
  PACE_HIGH,
  PACE_KEY,
  PACE_LOW,
  RATE_HIGH,
  RATE_LOW,
  SHUFFLE_KEY,
  SPIRAL_KEY,
  SPIRALS_HIGH,
  SWELL_HIGH,
  SWELL_LOW,
  VOICE_KEY,
  readBedPair,
  readGap,
  readLoop,
  readPace,
  readShuffle,
  readSpirals,
  swells,
} from './declaration-values';
import type { Depth, Gap, Spiral } from './declaration-values';
import { fileFinding } from './finding';
import type { Finding } from './finding';
import {
  LOOP_IN_SEGMENT,
  NO_SEGMENT_HEADER,
  NO_WORDS,
  PROSE_IN_HEAD,
  PROSE_IN_SEGMENT,
  SHUFFLE_IN_SEGMENT,
  beatOutOfRangeLine,
  carrierOutOfRangeLine,
  depthOutOfRangeLine,
  duplicateKeyLine,
  gapBackwardsLine,
  gapOutOfRangeLine,
  malformedBedLine,
  malformedGapLine,
  malformedLoopLine,
  malformedPaceLine,
  malformedShuffleLine,
  malformedSpiralLine,
  paceOutOfRangeLine,
  rateOutOfRangeLine,
  swellOutOfRangeLine,
  tooManySpiralsLine,
  turningOutOfRangeLine,
  unknownKeyLine,
} from './finding-copy';
import { countWords } from './parse-script';
import type { BlockEntry, DeclarationBlock, DeclarationEntry, ParsedScript } from './parse-script';

const WHOLE_FILE_LINE = 1;
const TURNING_PLACES = 3;

// The findings a block's place decides: what a stray line reads as, and whether
// the two head declarations may be declared there at all.
type Place = {
  stray: string;
  head: boolean;
};

// A head declaration that is one of two words rather than a value: how to read
// it, and what to say where it is neither in the head nor one of the two.
type Answer = {
  read: (value: string) => boolean | null;
  misplaced: string;
  line: (value: string) => string;
};

const HEAD: Place = { stray: PROSE_IN_HEAD, head: true };
const SEGMENT: Place = { stray: PROSE_IN_SEGMENT, head: false };

export function formatFindings(script: ParsedScript): Finding[] {
  const findings = blockFindings(script.head, HEAD);
  for (const segment of script.segments) {
    const declared = blockFindings(segment.block, SEGMENT);
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

function blockFindings(block: DeclarationBlock, place: Place): Finding[] {
  const findings: Finding[] = [];
  const declared = new Set<string>();
  for (const entry of block) {
    const found = entryFindings(entry, place, declared);
    findings.push(...found);
  }
  return findings;
}

function entryFindings(entry: BlockEntry, place: Place, declared: Set<string>): Finding[] {
  if (entry.kind === 'stray') {
    const stray = fileFinding(entry.line, place.stray);
    return [stray];
  }
  if (declared.has(entry.key)) {
    const message = duplicateKeyLine(entry.key);
    const duplicate = fileFinding(entry.line, message);
    return [duplicate];
  }
  declared.add(entry.key);
  return declarationFindings(entry, place);
}

function declarationFindings(entry: DeclarationEntry, place: Place): Finding[] {
  if (entry.key === VOICE_KEY) return [];
  if (entry.key === BED_KEY) return bedFindings(entry);
  if (entry.key === PACE_KEY) return paceFindings(entry);
  if (entry.key === GAP_KEY) return gapFindings(entry);
  if (entry.key === SPIRAL_KEY) return spiralFindings(entry);
  if (entry.key === LOOP_KEY) return loopFindings(entry, place);
  if (entry.key === SHUFFLE_KEY) return shuffleFindings(entry, place);
  const message = unknownKeyLine(entry.key);
  const unknown = fileFinding(entry.line, message);
  return [unknown];
}

// A segment cannot loop, because what comes round is the whole script: a loop
// declared on one is an author asking for something the format has no way to
// play rather than for a stretch that repeats.
function loopFindings(entry: DeclarationEntry, place: Place): Finding[] {
  const answer: Answer = { read: readLoop, misplaced: LOOP_IN_SEGMENT, line: malformedLoopLine };
  return answerFindings(entry, place, answer);
}

// A segment cannot shuffle either, and for the same reason: what the order is
// drawn for is the round, and a segment asking for one inside itself is asking
// for something the format has no way to play.
function shuffleFindings(entry: DeclarationEntry, place: Place): Finding[] {
  const answer: Answer = {
    read: readShuffle,
    misplaced: SHUFFLE_IN_SEGMENT,
    line: malformedShuffleLine,
  };
  return answerFindings(entry, place, answer);
}

function answerFindings(entry: DeclarationEntry, place: Place, answer: Answer): Finding[] {
  if (!place.head) {
    const misplaced = fileFinding(entry.line, answer.misplaced);
    return [misplaced];
  }
  if (answer.read(entry.value) === null) {
    const message = answer.line(entry.value);
    const malformed = fileFinding(entry.line, message);
    return [malformed];
  }
  return [];
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

// A fixed gap is one bound reported once rather than the same number twice,
// and it can hardly run backwards.
function gapFindings(entry: DeclarationEntry): Finding[] {
  const gap = readGap(entry.value);
  if (!gap) {
    const message = malformedGapLine(entry.value);
    const malformed = fileFinding(entry.line, message);
    return [malformed];
  }
  const findings = boundFindings(entry, gap);
  if (gap.low > gap.high) {
    const message = gapBackwardsLine(gap.low, gap.high);
    const backwards = fileFinding(entry.line, message);
    findings.push(backwards);
  }
  return findings;
}

function boundFindings(entry: DeclarationEntry, gap: Gap): Finding[] {
  const findings: Finding[] = [];
  const bounds = gap.low === gap.high ? [gap.low] : [gap.low, gap.high];
  for (const bound of bounds) {
    if (bound < GAP_SHORTEST || bound > GAP_LONGEST) {
      const message = gapOutOfRangeLine(bound);
      const outside = fileFinding(entry.line, message);
      findings.push(outside);
    }
  }
  return findings;
}

// An empty value is the author asking for no spiral, the way an empty voice
// list asks for silence, and it comes back as a list of none rather than as a
// value that would not read.
function spiralFindings(entry: DeclarationEntry): Finding[] {
  const spirals = readSpirals(entry.value);
  if (!spirals) {
    const message = malformedSpiralLine(entry.value);
    const malformed = fileFinding(entry.line, message);
    return [malformed];
  }
  const findings = countFindings(entry, spirals);
  for (const spiral of spirals) {
    findings.push(...rateFindings(entry, spiral.rate));
    findings.push(...depthFindings(entry, spiral.depth));
  }
  findings.push(...turningFindings(entry, spirals));
  return findings;
}

function countFindings(entry: DeclarationEntry, spirals: Spiral[]): Finding[] {
  if (spirals.length <= SPIRALS_HIGH) return [];
  const message = tooManySpiralsLine(spirals.length);
  const tooMany = fileFinding(entry.line, message);
  return [tooMany];
}

// What a pair turns between them is bounded by what one may turn alone, since a
// point is passed as often either way. The sum is rounded because two decimals
// that meet the bound exactly can land a hair past it, and because the number
// the finding names should be the one the author wrote.
function turningFindings(entry: DeclarationEntry, spirals: Spiral[]): Finding[] {
  if (spirals.length < 2) return [];
  const turning = totalTurning(spirals);
  if (turning <= RATE_HIGH) return [];
  const message = turningOutOfRangeLine(turning);
  const outside = fileFinding(entry.line, message);
  return [outside];
}

function totalTurning(spirals: Spiral[]): number {
  let turning = 0;
  for (const spiral of spirals) turning += Math.abs(spiral.rate);
  return Number(turning.toFixed(TURNING_PLACES));
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
