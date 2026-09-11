import {
  BED_KEY,
  DEFAULT_BED,
  DEFAULT_GAP,
  DEFAULT_LOOP,
  DEFAULT_PACE,
  DEFAULT_SHUFFLE,
  GAP_KEY,
  LOOP_KEY,
  PACE_KEY,
  SHUFFLE_KEY,
  SPIRAL_KEY,
  VOICE_KEY,
  readBedPair,
  readGap,
  readLoop,
  readPace,
  readShuffle,
  readSpirals,
  readTagList,
} from './declaration-values';
import type { BedPair, Gap, Spiral } from './declaration-values';
import type { DeclarationBlock, DeclarationEntry, ParsedScript } from './parse-script';
import type { Word } from './tokenise-prose';

const NO_VOICE: string[] = [];
const NO_SPIRAL: Spiral[] = [];

// What a block said about the spiral, which is not the same as what it holds:
// a block that declares nothing inherits the running spirals, a block that
// declares an empty value stops them.
type SpiralHold = {
  spirals: Spiral[];
};

export type Segment = {
  tags: string[];
  bed: BedPair;
  voice: string[];
  pace: number;
  gap: Gap;
  spirals: Spiral[];
  words: Word[];
};

export function resolveSegments(script: ParsedScript): Segment[] {
  let bed = declaredBed(script.head) ?? DEFAULT_BED;
  let voice = declaredVoice(script.head) ?? NO_VOICE;
  let pace = declaredPace(script.head) ?? DEFAULT_PACE;
  let gap = declaredGap(script.head) ?? DEFAULT_GAP;
  let spirals = declaredSpirals(script.head)?.spirals ?? NO_SPIRAL;
  const segments: Segment[] = [];
  for (const parsed of script.segments) {
    bed = declaredBed(parsed.block) ?? bed;
    voice = declaredVoice(parsed.block) ?? voice;
    pace = declaredPace(parsed.block) ?? pace;
    gap = declaredGap(parsed.block) ?? gap;
    // Not a ?? like the four above it, because the value a spiral declaration
    // holds may itself be nothing, and that nothing is a stop rather than an
    // inheritance.
    const held = declaredSpirals(parsed.block);
    if (held) spirals = held.spirals;
    const segment = { tags: parsed.tags, bed, voice, pace, gap, spirals, words: parsed.words };
    segments.push(segment);
  }
  return segments;
}

// Whether the script comes round, which is the head's to say and nothing a
// segment inherits: what loops is the session, not a stretch of it.
export function resolveLoop(script: ParsedScript): boolean {
  const declared = headEntry(script, LOOP_KEY);
  if (!declared) return DEFAULT_LOOP;
  return readLoop(declared.value) ?? DEFAULT_LOOP;
}

// Whether the round draws the order its segments come in, which is the head's
// to say for the same reason: what is shuffled is the whole round.
export function resolveShuffle(script: ParsedScript): boolean {
  const declared = headEntry(script, SHUFFLE_KEY);
  if (!declared) return DEFAULT_SHUFFLE;
  return readShuffle(declared.value) ?? DEFAULT_SHUFFLE;
}

function headEntry(script: ParsedScript, key: string): DeclarationEntry | null {
  for (const entry of script.head) {
    if (entry.kind !== 'declaration' || entry.key !== key) continue;
    return entry;
  }
  return null;
}

function declaredBed(block: DeclarationBlock): BedPair | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== BED_KEY) continue;
    return readBedPair(entry.value);
  }
  return null;
}

function declaredPace(block: DeclarationBlock): number | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== PACE_KEY) continue;
    return readPace(entry.value);
  }
  return null;
}

function declaredGap(block: DeclarationBlock): Gap | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== GAP_KEY) continue;
    return readGap(entry.value);
  }
  return null;
}

function declaredSpirals(block: DeclarationBlock): SpiralHold | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== SPIRAL_KEY) continue;
    return { spirals: readSpirals(entry.value) ?? NO_SPIRAL };
  }
  return null;
}

function declaredVoice(block: DeclarationBlock): string[] | null {
  for (const entry of block) {
    if (entry.kind !== 'declaration' || entry.key !== VOICE_KEY) continue;
    return readTagList(entry.value);
  }
  return null;
}
